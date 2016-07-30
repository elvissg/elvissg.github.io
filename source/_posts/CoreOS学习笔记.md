title: CoreOS学习笔记
date: 2015-06-29 13:48:08
tags: Linux
---
以下为在windows上实验:

- 首先利用vagrant + virtualbox安装CoreOS


        git clone https://github.com/coreos/coreos-vagrant/
        cd coreos-vagrant
        cp config.rb.sample config.rb
        cp user-data.sample user-data

        
- 修改 config.rb 文件


        # Size of the CoreOS cluster created by Vagrant
        $num_instances=3


- 修改user-data

去[https://discovery.etcd.io/new?size=3]( https://coreos.com/docs/cluster-management/setup/cluster-discovery/)申请cluster  discovery修改discovery
        
        
Coreos 的配置是利用cloud-config.yml
coreos-cloudinit -from-file=cloud-config.yaml


启动虚拟机:

        vagrant up --provision
        
连接虚拟机core-01:

        vagrant ssh core-01 -- -A

###登陆后可以用fleet进行集群管理：      
用`fleetctl list_machines`查看。

(加上`-- -A`参数可以把密钥带入登陆的虚拟机，以便fleet直接从一个节点ssh到另一个节点,命令:`fleetctl ssh id`)

`此处遇到的问题:`

    1. fleetctl ssh id时报错The SSH_AUTH_SOCK environment variable must be set 
        解决:
        ssh-agent
        ssh-add /home/core/fleet/fixtures/insecure_private_key(注意：权限必须是600)
        echo $SSH_AUTH_SOCK
    2. 执行ssh-add时出现
        Could not open a connection to your authentication agent
    　  ssh-agent bash
　  
这样就搭好了一个有三个服务器的CoreOS集群

---

###有时候这样配置以后不能自动Discovery服务器,需要手动添加:

        etcd -name="core-01" -addr="172.16.8.101:4001" -peer-addr="172.16.8.101:7001" -peers="172.16.8.102:7001,172.16.8.103:7001" -data-dir="/home/core/etcd"  
        
---

接下来跨节点执行命令:

    $ fleetctl ssh 其他节点id cat /etc/environment
    COREOS_PUBLIC_IPV4=10.0.2.13
    COREOS_PRIVATE_IPV4=172.17.8.101

在服务管理方面Fleet使用和Systemd相似的Unit文件进行配置。不同的地方在于，Fleet额外支持一个X-Fleet配置段，用于指定服务可以在哪些节点上运行。例如下面这个Unit文件。

    # Don't schedule on the same machine as other hello instances
    X-Conflicts=hello*.service
    X-Conflicts 指定了这个 Hello 服务不能运行在“任意已经分配了任何名字以hello开头的服务”的节点上
    
由于Fleet需要在集群层面上对服务进行管理，因此它的服务管理流程与Systemd略有不同。最明显的两个区别是：Fleet没有指定Unit文件必须放置在哪些目录下，而是直接通过参数的方式告诉fleetctl命令。使用上面的内容在用户的主目录下创建hello.service文件，然后来通过fleetctl start启动这个服务。

现在建立一个hello.service:

    [Unit]
    Description=Hello World
    After=docker.service
    Requires=docker.service
    [Service]
    TimeoutStartSec=0
    ExecStartPre=-/usr/bin/docker kill busybox1
    ExecStartPre=-/usr/bin/docker rm busybox1
    ExecStartPre=/usr/bin/docker pull busybox
    ExecStart=/usr/bin/docker run --name busybox1 busybox /bin/sh -c "while true; do echo Hello World; sleep 1; done"
    ExecStop=/usr/bin/docker kill busybox1
    [X-Fleet]
    # Don't schedule on the same machine as other hello instances
    X-Conflicts=hello*.service
    
---
    $ fleetctl start ${HOME}/hello.service
    Unit hello.service launched on 0acdd9bf.../10.0.2.15

    $ fleetctl list-units
    UNIT MACHINE ACTIVE SUB
    hello.service 0acdd9bf.../10.0.2.15 active running
    
---
 服务的提交阶段，这个步骤仅仅是在Fleet服务中完成的，目的是将指定的Unit文件添加到Fleet的记录缓存。此时Fleet并不会与Systemd进行通信。通过 fleetctl list-unit-files 和 fleetctl list-units 命令可以看到，Unit文件被提交后，并没有出现在后者的记录中。此时这个Unit文件已经被注册为一个Fleet可识别的Unit名称，但还不是一个可以执行的的服务。
 
    $ fleetctl submit ${HOME}/hello.service
    $ fleetctl list-unit-files
    UNIT HASH DSTATE STATE TARGET
    hello.service 4bff33d inactive inactive -
$ fleetctl list-units
    UNIT MACHINE ACTIVE SUB
 其他命令:
 
    $ fleetctl cat hello.service #查看
    $ fleetctl load hello.service #载入
    加载服务实际上是根据Unit文件的 X-Fleet 配置段条件，将服务传递到符合条件的特定节点的本地Systemd系统的过程，这个过程中Fleet通过DBus API与节点的Systemd进行了通信。
    
    $ fleetctl start hello.service #启动
    刚刚启动的服务会处于start-pre状态（服务正在执行Unit文件中的ExecStartPre部分操作），几分钟后再次查看服务的状态，服务状态就会变为running了。
    
    $ fleetctl status hello.service #查看状态
    $ fleetctl journal --lines 20 hello.service #指定行
    $ fleetctl journal -f hello.service #跟随日志输出
    
    $ fleetctl journal hello.service #查看日志
    $ fleetctl stop hello.service #停止
    $ fleetctl unload hello.service #卸载
    $ fleetctl destroy hello.service #销毁
    $ fleetctl ssh hello # 跳转到运行Hello服务的节点
 
 ---

Kubernetes:


概念:

- CoreOS是一个基于Docker(or rocket)的轻量级容器化Linux发行版，为了计算机集群的基础设施建设而生，专注于自动化，轻松部署，安全，可靠，规模化。
- etcd 与 fleet的使用
    - etcd 是一个分布式 key/value 存储服务
    - [fleet](https://github.com/coreos/fleet) 是一个通过 Systemd对CoreOS 集群中进行控制和管理的工具
    - Kubernetes负责容器的管理
    - flannel (rudder)flannel (rudder) 是 CoreOS 团队针对 Kubernetes 设计的一个覆盖网络 (overlay network) 工具，其目的在于帮助每一个使用 Kuberentes 的 CoreOS 主机拥有一个完整的子网。Kubernetes 会为每一个 POD 分配一个独立的 IP 地址，这样便于同一个 POD 中的 Containers 彼此连接，而之前的 CoreOS 并不具备这种能力。为了解决这一问题，flannel 通过在集群中创建一个覆盖网格网络 (overlay mesh network) 为主机设定一个子网。
    

*http://www.infoq.com/cn/articles/what-is-coreos*
*http://www.infoq.com/cn/articles/coreos-analyse-etcd*




