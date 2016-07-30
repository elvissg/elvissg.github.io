---
title: Openwrt配置SS智能翻墙笔记
date: 2016-12-01 14:38:28
tags: Linux
---

需要安装的软件包：

- shadowsocks-libev
- chinadns
- luci-app-shadowsocks
- luci-app-chinadns
- dnsmasq-full(把自带的dnsmasql卸了装这个，支持min-cache-ttl)


1、先设置ss，因为安装了luci-app-shadowsocks，直接进后台填写ss服务器信息，勾选透明代理，端口1080，代理协议TCP+UDP。保存并应用ss-redir就跑起来了。

2、设置chinadns，勾选“启动”、“启动双向过滤”、“启动DNS压缩指针”，本地端口5353，上游服务器114.114.114.114,8.8.8.8:53(ps:一定要填两个，不然启动不起来，国内走114，国外走8888)

3、转到网络-DHCP/DNS，设置DNS转发127.0.0.1#5353(就是刚才chinadns的端口),在host和解析文件选项卡中勾选*忽略解析文件*和*忽略/etc/hosts*。

4、接下来我试了两种办法智能翻


- 一种是白名单方式，从apnic爬取国内ip段([爬取脚本](https://github.com/elvissg/config/blob/master/gen_Asiaip.sh))，利用iptables将国内ip直接通过，其余全部走ss代理。
结果爬下来有7000多条，每次重启添加到iptables都要添加个好几分钟，mdzz。

- 于是用了第二种黑名单的方式，利用gfwlist，被墙的走代理。这看起来比较合理。
  在/etc/dnsmasq.conf最后添加
    

        conf-dir=/etc/dnsmasq.d
        cache-size=1500
        min-cache-ttl=720

新建dnsmasq.conf目录，生成dnsmasq_list.conf，[github上找的生成脚本](ttps://github.com/cokebar/gfwlist2dnsmasq/blob/master/gfwlist2dnsmasq.py)
格式看起是这样:

    dserver=/.github.com/127.0.0.1#5353　#使用UDP转发的方式解析该域名，实际查询的DNS是Google DNS。
    ipset=/.github.com/gfwlist　　#将解析出来的IP保存到名为gfwlist的ipset表中。

在网络-防火墙-自定义规则添加

        ipset -N gfwlist iphash
        iptables -t nat -A PREROUTING -p tcp -m set --match-set gfwlist dst -j REDIRECT --to-port 1080
        iptables -t nat -A OUTPUT -p tcp -m set --match-set gfwlist dst -j REDIRECT --to-port 1080

最后在/etc/init.d/shadowsocks里把ss-rules那段注释掉，不然每次都会生成一条SS_SPEC_WAN_FW链全局代理，每次还要去删很麻烦。

重启路由，试试访问baidu.com和httpbin.org/ip，后者显示的应该是代理服务器ip。
