title: LNMP安装
date: 2015-06-20 15:30:26
tags: Linux
---

#采用yum安装
Nginx

    rpm -ivh http://nginx.org/packages/centos/6/noarch/RPMS/nginx-release-centos-6-0.el6.ngx.noarch.rpm
    yum install -y nginxm

Mysql
    
    yum install -y mysql-devel mysql-server
    
PHP

    yum install -y php php-fpm
    
#源码安装
下载pcre  （支持nginx伪静态）
ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/
编译安装

- Nginx

下载源码:http://nginx.org/en/download.html


    ./configure  --prefix=/usr/local/php  \

    --with-mysql=/usr/local/mysql \#设置mysql的安装路径

    --enable-fastcgi \ #开启fastcgi支持

    --enable-debug \ #支持调试 
    
    --with-openssl=/usr/ --with-pcre=/usr/local/src/pcre 

---

- mysql 


    groupadd mysql  #添加mysql组    
    useradd -g mysql mysql -s /bin/false  #创建用户mysql并加入到mysql组
    
安装一些必要的组件:


    yum -y install make gcc-c++ cmake bison-devel  ncurses-devel gcc autoconf automake zlib* fiex* libxml* libmcrypt* libtool-ltdl-devel*
       
       
       
下载源码: http://dev.mysql.com/downloads/mysql/


    cmake \
    -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
    -DMYSQL_DATADIR=/data/mysql/data \
    -DSYSCONFDIR=/etc \
    -DWITH_MYISAM_STORAGE_ENGINE=1 \
    -DWITH_INNOBASE_STORAGE_ENGINE=1 \
    -DWITH_MEMORY_STORAGE_ENGINE=1 \
    -DWITH_READLINE=1 \
    -DMYSQL_UNIX_ADDR=/tmp/mysql/mysql.sock \
    -DMYSQL_TCP_PORT=3306 \
    -DENABLED_LOCAL_INFILE=1 \
    -DWITH_PARTITION_STORAGE_ENGINE=1 \
    -DEXTRA_CHARSETS=all \
    -DDEFAULT_CHARSET=utf8 \
    -DDEFAULT_COLLATION=utf8_general_ci
    
    
    make && make install

    
    报错:FATAL ERROR: Could not find ./bin/my_print_defaults
    解决:/usr/local/mysql/scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data &

---


如果默认绑定的是ipv6
需要在my.cnf中加入

    [mysqld]
    bind-address=0.0.0.0#绑定ipv4
    port=3306
    
- PHP   
下载源码: http://www.php.net/releases/
编译参数:


    ./configure --prefix=/usr/local/php --with-config-file-path=/usr/local/php/etc --with-mysql=/usr/local/mysql --with-mysqli=/usr/local/bin/mysql_config --with-iconv-dir=/usr/local --with-freetype-dir --with-jpeg-dir --with-png-dir --with-zlib --with-libxml-dir=/usr --enable-xml --disable-rpath --enable-discard-path --enable-safe-mode --enable-bcmath --enable-shmop --enable-sysvsem --enable-inline-optimization --with-curl --with-curlwrappers --enable-mbregex --enable-fastcgi --enable-fpm --enable-force-cgi-redirect --enable-mbstring --with-mcrypt --with-gd --enable-gd-native-ttf --with-openssl --with-mhash --enable-pcntl --enable-sockets --with-ldap --with-ldap-sasl --with-xmlrpc --enable-zip --enable-soap --without-pear --with-zlib --enable-pdo --with-pdo-mysql --with-mysql --with-fpm-systemd
