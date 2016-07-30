title: Python-Request库学习笔记
date: 2015-06-19 13:32:28
tags: Python
---
  * 基本Get请求：


    #-*- coding:utf-8 -*-
    import requests
    url = 'http://www.baidu.com'
    r = requests.get(url)
    print r.text

---

  * 带参数Get请求：


    #-*- coding:utf-8 -*-
    import requests
    url = 'http://www.baidu.com'
    payload = {'key1': 'value1', 'key2': 'value2'}
    r = requests.get(url, params=payload)
    print r.text


* POST请求模拟登陆及一些返回对象的方法：


    #-*- coding:utf-8 -*-
    import requests
    url1 = 'http://www.exanple.com/login'#登陆地址
    url2 = "http://www.example.com/main"#需要登陆才能访问的地址
    data={"user":"user","password":"pass"}
    headers = { "Accept":"text/html,application/xhtml+xml,application/xml;",
                "Accept-Encoding":"gzip",
                "Accept-Language":"zh-CN,zh;q=0.8",
                "Referer":"http://www.example.com/",
                "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36"
                }
    res1 = requests.post(url1, data=data, headers=headers)
    res2 = requests.get(url2, cookies=res1.cookies, headers=headers)

    print res2.content#获得二进制响应内容
    print res2.raw#获得原始响应内容,需要stream=True
    print res2.raw.read(50)
    print type(res2.text)#返回解码成unicode的内容
    print res2.url
    print res2.history#追踪重定向
    print res2.cookies
    print res2.cookies['example_cookie_name']
    print res2.headers
    print res2.headers['Content-Type']
    print res2.headers.get('content-type')
    print res2.json#讲返回内容编码为json
    print res2.encoding#返回内容编码
    print res2.status_code#返回http状态码
    print res2.raise_for_status()#返回错误状态码
---
* 使用Session()对象的写法（Prepared Requests）:


    #-*- coding:utf-8 -*-
    import requests
    s = requests.Session()
    url1 = 'http://www.exanple.com/login'#登陆地址
    url2 = "http://www.example.com/main"#需要登陆才能访问的地址
    data={"user":"user","password":"pass"}
    headers = { "Accept":"text/html,application/xhtml+xml,application/xml;",
                "Accept-Encoding":"gzip",
                "Accept-Language":"zh-CN,zh;q=0.8",
                "Referer":"http://www.example.com/",
                "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36"
                }

    prepped1 = requests.Request('POST', url1,
        data=data,
        headers=headers
    ).prepare()
    s.send(prepped1)


    '''
    也可以这样写
    res = requests.Request('POST', url1,
    data=data,
    headers=headers
    )
    prepared = s.prepare_request(res)
    # do something with prepped.body
    # do something with prepped.headers
    s.send(prepared)
    '''

    prepare2 = requests.Request('POST', url2,
        headers=headers
    ).prepare()
    res2 = s.send(prepare2)

    print res2.content

* 另一种写法 :


    #-*- coding:utf-8 -*-
    import requests
    s = requests.Session()
    url1 = 'http://www.exanple.com/login'#登陆地址
    url2 = "http://www.example.com/main"#需要登陆才能访问的页面地址
    data={"user":"user","password":"pass"}
    headers = { "Accept":"text/html,application/xhtml+xml,application/xml;",
                "Accept-Encoding":"gzip",
                "Accept-Language":"zh-CN,zh;q=0.8",
                "Referer":"http://www.example.com/",
                "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36"
                }
    res1 = s.post(url1, data=data)
    res2 = s.post(url2)
    print(resp2.content)

[SessionApi](http://cn.python-requests.org/en/latest/api.html#sessionapi)
* 其他的一些请求方式


    >>> r = requests.put("http://httpbin.org/put")
    >>> r = requests.delete("http://httpbin.org/delete")
    >>> r = requests.head("http://httpbin.org/get")
    >>> r = requests.options("http://httpbin.org/get")



##遇到的问题:

---
在cmd下执行，遇到个小错误:

    UnicodeEncodeError:'gbk' codec can't encode character u'\xbb' in   
    position 23460: illegal multibyte sequence

分析:
1、Unicode是编码还是解码

    UnicodeEncodeError
很明显是在编码的时候出现了错误

2、用了什么编码

    'gbk' codec can't encode character

使用GBK编码出错

##解决办法：
确定当前字符串，比如

    #-*- coding:utf-8 -*-
    import requests
    url = 'http://www.baidu.com'
    r = requests.get(url)
    print r.encoding
    >utf-8

已经确定html的字符串是utf-8的，则可以直接去通过utf-8去编码。

    print r.text.encode('utf-8')

---
参考链接：[官方文档](http://www.python-requests.org/en/latest/ )            
        


