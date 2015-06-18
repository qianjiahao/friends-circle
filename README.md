# 好友圈
 
- Mongoose
- Express 
- Angular.js 
- Node.js 
- Socket.io 

##Usage

###clone & enter

    git clone git@github.com:qianjiahao/friends-circle.git
    cd friends-circle

###install dependencies

	bower install && npm install
    
###start node server

    cd back-end && node application.js
    
###start front end server

    cd .. && http-server .
    `要在根路径下执行`
    
###open brwser

    http://localhost:8080/front-end/views/layout.html


##Description

新人练手，在学了一段时间angular后，结合node和socket.io弄个小东西

Angular.js做前端路由，逻辑控制
Node.js做后端api，提供数据
Mongoose做orm
socket.io做聊天室和订阅、发布

###项目图片 [friends-circle](http://www.angularjs.cn/A1aQ)

### 1.0.0 正式版 [2015-06-18]

基本功能有

    登录、注册 [ 含基本验证 ]
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
    修改个人信息 [ username or signature ]


>觉得凑合的话，记得star哦꒰･◡･๑꒱

> If you like it , don't forget to star ~ thanks a lot .

