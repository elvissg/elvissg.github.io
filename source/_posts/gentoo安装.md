title: gentoo安装
date: 2015-05-19 13:48:08
tags: Linux
---

> Gentoo的安装笔记


用livecd引导：


    mount /dev/sdax /mnt/gentoo
    
将stage3解压到/mnt/gentoo,将protage解压到/mnt/gentoo/usr/


    mount --bind /dev /mnt/gentoo/dev
    --bind命令我的理解是：将/mnt/gentoo/dev目录的内容暂时用/dev里的内容代替

    mount -t proc proc /mnt/gentoo/proc
    chroot /mnt/gentoo /bin/bash
    env-update && source /etc/profile

配置/etc/portage/make.conf换源(最新版本的是配置/etc/portage/repos.conf/*，[官方wiki-Sync](https://wiki.gentoo.org/wiki/Project:Portage/Sync))

    cp /usr/share/portage/config/repos.conf /etc/portage/repos.conf/gentoo.conf
    /etc/portage/repos.conf/gentoo.conf
    [gentoo]
    location = /usr/portage
    sync-type = rsync#同时还支持git
    sync-uri = rsync://rsync.gentoo.org/gentoo-portage
    auto-sync = yes

    emerge --sync #更新portage
    passwd #记得改密码
    
    emerge -av grub2
    grub: /boot/grub/grub.cfg
    emerge -av gcc
    gcc-config 2
    emerge -c gcc


注释 /etc/conf.d/local.start 里面全部东西，或用下面的指令清空

    cat /dev/null > /etc/conf.d/local.start
    rc-update del autoconfig

设定时区

    rm /etc/localtime
    ln –s /usr/share/zoneinfo/Asia/Taipei /etc/localtime

修改 /etc/fstab

    /dev/sda8 / ext4 defaults 0 1


编译内核

    lspci -k  观察需要的驱动
    WLAN驱动 注意把firmware编译成模块
    声卡驱动 
    
- /etc/pam.d/login  有关root登陆问题
- wpa_supplicant 连接wifi问题

如果 wpa_cli不能开启

    /etc/wap_supplicant.conf
    其他注释掉
    ctrl_interface=/var/run/wpa_supplicant
    wpa_supplicant -Dwext -i wlan0 -c //etc/wap_supplicant    

wext 是驱动名字，大部分是这个
这时候就可以连接cli了
wpa_cli -i wlan0

    add_network 返回一个数
    0
    set_network 0 ssid "ABC"
    set_network 0 psk "65445" 注意这里只能是双引号。。。
    select_network 0
    enable_network 0


---

`把/etc/shadow后面两个冒号之间的*去掉可以重置密码`

---

添加网络开机自启动

    ln -s /etc/init.d/net.lo /etc/init.d/net.enp4s
    /etc/conf.d/net内容
    config_enp4s0=("192.168.0.7/24")
    routes_enp4s0=("default via 192.168.0.1" )
    emerge -av pciutils wireless-tools mlocate wpa_supplicant
    
安装图形界面

    先配置USE /usr/portage/make.conf USE加入X
    安装xorg-server

    Xorg -configure
    cp /root/xorg.conf.new /etc/X11/xorg.conf


如果在home目录下存在一个名为.xinitrc的文件，它将会执行文件中列出的命令。
否则，它将会读取XSESSION变量并执行/etc/X11/Sessions/中可用的一个会话。你可以在/etc/rc.conf中设置系统上所有用户的默认XSESSION变量值。
如果以上所有都失败了，那么它将会回到一个简单的窗口管理器，通常是twm。

WM选择dwm+dmenu 或者 awesome,终端模拟器选择自带的uxterm

---
uxterm字体问题
安装输入法

    emerge fcitx fcitx-pinyin

配置声音

    emerge alsa-utils
    $alsamixer
默认是静音问题
可以通过M来切换
不过主要是因为默认把模式设为了HDMI

    aplay -l
    vi /etc/asound.conf
    defaults.pcm.card0
    defaults.pcm.device0
    
启动图形界面是启动输入法:    
    vi .xinitrc
    exec fcitx加入到 exec dwm前
    
卸载桌面：

    emerge eix && update-eix
    eix -CI xfce --only-names | xargs emerge -pC
    (先p看清楚)

    然后再mask这个套件的核心，比如xfce4-session
    之后的emerge -avuDN world     之类就会告诉你那些没有被包括进xfce-base和xfce-extra的依赖包包

删一套桌面的时候，甚至连基本库，如kdelib, libgnome, libxfce**** 都可以mask
需要mask的包写在/etc/protage/package.keywords

    emerge --depclean 清楚没有依赖关系的包
    revdep-rebuild
    autocutsel 这个包可以实现从终端粘贴到火狐  不好用
)

grub2 识别win7需要装这个

    emerge -av os-prober

将gentoo安装到lvm:

    pvcreate /dev/sdax
    vgcreate Vol /dev/sdax
    lvcreat -L 20G Vol

lvm 重启消失需要激活

    vgscan  //扫描所有磁盘得到卷组信息
    vgchange -ay  //激活系统所有卷组vg

1、必须emerge lvm2 而且 rc-update add lvm boot后。grub2-install /dev/sda才能成功，否则会提示无法写入的提示。导致grub2安装失败。
2、必须采用genkernel形式才可引导。即按照原普通手册制作完成后，在制作内核后，emerge genkernel，然后genkernel --lvm --install initramfs。生成initramfs
3、用grub2-mkconfig -o /boot/grub/grub.cfg后，必须修改grub.cfg。在linux /boot/kernel-xxxx ro 这句话里的"ro"后面加上dolvm 注意要有空格。即我的是
"linux /boot/kernel-3.10.17-gentoo root=/dev/mapper/vg-root dolvm ro"

修改 /etc/fstab

    /dev/vg/lv  ext4 defaults 0 0

记得passwd

---

更新:

emerge --sync      //升级整个portage目录
emerge portage     //如果不是最新的portage，需要按提示执行此操作
emerge python     //如果不是最新的python，需要按提示执行此操作
/usr/sbin/update-python     //执行完emerge python后执行此操作

emerge -avuDN world      //按照 /var/lib/portage/world 文件下的包，重新构建整个系统
 参数说明：  --ask (-a)  控制Portage显示它要更新的软件包列表，并让您决定是否继续更新
                --verbose (-v) 在屏幕上输出完整的文件列表
                --update (-u) 更新包的最佳版本
                --deep (-D)  更新系统中的每个软件包
                --newuse (-N) USE标记变更后，要使Portage检查USE标记的变动是否导致
                            需要安装新的软件包或者将现有的包重新编译

emerge -av --depclean     //清除不需要（孤立）的软件包

revdep-rebuild     //gentoolkit包里面的一个软件，用来检查系统的依赖关系是否都满足，
                            自动安装没有满足关系的包

dispatch-conf     //更新系统的配置文件

emerge -e world     //本地重新编译整个系统，USE标记变化不大时不需执行

---

将gentoo改用systemd启动:

systemd

[参照官方wiki](http://wiki.gentoo.org/wiki/Systemd)

    /etc/default/grub

    GRUB_CMDLINE_LINUX="init=/usr/lib/systemd/systemd"
    use加上systemd

    emerge -avuDN world

    emerge --depclean

    dispatch-conf

    revdep-rebuild

---

ebuild知识(转)
1. 定位ebuild
    基础知识，比如
    $emerge -s gcal
    * app-misc/gcal
    Latest version available: 3.01
    Latest version installed: [ Not Installed ]
    Size of downloaded files: 2,315 kB
    Homepage: http://www.gnu.org/software/gcal/gcal.html
    Description: The GNU Calendar - a replacement for cal

    那么gcal这个软件的ebuild就在/usr/portage/app-misc/gcal/下面
    在这个目录下，一般能看到很多ebuild文件，分别对应不同版本号

2. 怎么继续前次的ebuild操作?
比如，emerge到一半，发现一个错误，你google/去论坛搜了一圈，找出了解决办法，难道非要从头开始么? 解决办法其实很多了，说几个最常用的
a. 使用ccache
每个人都应该把它打开
emerge ccache之后，在/etc/make.conf里面
找到FEATURES设置，加上
FEATURES="ccache"
以及CCACHE_SIZE="2G"
默认好像是2G，我觉得如果硬盘空间足够，多多益善。
下次emerge的时候，你会发现编译的速度快了很多。这样间接起到了中断继续的效果。个人推荐这个方法，最简单。

继续make
emerge也就是一个用源码编译/安装的过程，而gnu make系统也保证了它实际上是可以"断点续传"的。而gentoo的portage系统在每次开始新的emerge的时候，会自己删掉以前的临时目录，重新生成，造成中断的emerge过程不可恢复。
你只要进入到临时目录，一般是
/var/tmp/portage/ebuild名称/work/ebuild名称/
下继续make，然后make install就行
不用怀疑，这样已经装好了。。但是，这样安装的软件包不会被记载在portage的world file里面。。所以，更优雅的办法是
0. 找到ebuild文件，比如abc-1.0.1.ebuild
1. ebuild abc-1.0.1.ebuild compile
2. ebuild abc-1.0.1.ebuild install
3. ebuild abc-1.0.1.ebuild qmerge

---

locale知识:

    [oracle@game ~]$ locale
    LANG=en_US.UTF-8
    LC_CTYPE="en_US.UTF-8"
    LC_NUMERIC="en_US.UTF-8"
    LC_TIME="en_US.UTF-8"
    LC_COLLATE="en_US.UTF-8"
    LC_MONETARY="en_US.UTF-8"
    LC_MESSAGES="en_US.UTF-8"
    LC_PAPER="en_US.UTF-8"
    LC_NAME="en_US.UTF-8"
    LC_ADDRESS="en_US.UTF-8"
    LC_TELEPHONE="en_US.UTF-8"
    LC_MEASUREMENT="en_US.UTF-8"
    LC_IDENTIFICATION="en_US.UTF-8"
    LC_ALL=en_US.UTF-8
    [oracle@game ~]$ 

locale把按照所涉及到的文化传统的各个方面分成12个大类，这12个大类分别是： 

1、语言符号及其分类(LC_CTYPE) 
2、数字(LC_NUMERIC) 
3、比较和排序习惯(LC_COLLATE) 
4、时间显示格式(LC_TIME) 
5、货币单位(LC_MONETARY) 
6、信息主要是提示信息,错误信息,状态信息,标题,标签,按钮和菜单等(LC_MESSAGES) 
7、姓名书写方式(LC_NAME) 
8、地址书写方式(LC_ADDRESS) 
9、电话号码书写方式(LC_TELEPHONE) 
10、度量衡表达方式 (LC_MEASUREMENT) 
11、默认纸张尺寸大小(LC_PAPER) 
12、对locale自身包含信息的概述(LC_IDENTIFICATION)。
