# friends-circle

# 好友圈

## use Mongoose , Express , Angular.js , Node.js , Socket.io .

#Usage

##clone & enter

    git clone git@github.com:qianjiahao/friends-circle.git
    cd friends-circle

##install dependencies

	bower install && npm install
    
##start node server

    cd back-end && node application.js
    
##start front end server

    cd .. && http-server .
    要在根路径下执行
    
##open brwser

    http://localhost:8080/front-end/views/layout.html



新人练手，在学了一段时间angular后，结合node和socket.io弄个小东西

Angular.js做前端路由，逻辑控制
Node.js做后端api，提供数据
Mongoose做orm
socket.io做聊天室和订阅、发布

基本功能有

    登录、注册
    查询用户 [ by nickname or email ]
    好友申请 [ dynamic update by socket.io ]
    接受申请或标记已读 [ dynamic update by socket.io ]
    好友列表 [ online or offline dynamic update by socket.io ]
    创建聊天组 [dynamic update by socket.io]
    进入、退出聊天组 [ logout后自动退出 ]
    群组聊天 [ 基于 socket.io 仅支持同一时间单一群组聊天，可切换聊天组, 支持markdowm ]
    发布新鲜事 [ 仅好友可见 , 可选是否需要markdown]
    编辑，删除新鲜事 [ 仅发布者可操作 ]
    点赞新鲜事 [ 好友均可 ]
	
截了几张图
 ![QQ20150616-1@2x.png](//dn-cnode.qbox.me/FmxdYScRDiELWJHr808X8_sylKOf)
 
 ![QQ20150616-2@2x.png](//dn-cnode.qbox.me/FuKbHqRE8twDQ8f2voxyHBTF-XXK)
  
![QQ20150616-3@2x.png](//dn-cnode.qbox.me/FhIBm0tIAWTUGEf9L1bHGLEP8liB)
   
 ![QQ20150616-4@2x.png](//dn-cnode.qbox.me/FrBIFOptbfOvHYP2f10WhI0Diixx)
	
 ![QQ20150616-6@2x.png](//dn-cnode.qbox.me/FrG-8cy2WbvKuU_ZcnoiE6d2joM1)
	 
  ![QQ20150616-7@2x.png](//dn-cnode.qbox.me/FuOViDt4PNppWWmKi3g39VIO2H7u)
	  
项目地址：[friends-circle](https://github.com/qianjiahao/friends-circle)

>希望大神们能star鼓励鼓励，꒰･◡･๑꒱

> If you like it , don't forget to star ~ thanks a lot .

