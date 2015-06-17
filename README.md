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

#Description
  
    登录、注册
    查询用户 [ by nickname or email ]
    好友申请 [ dynamic update by socket.io ]
    接受申请或标记已读 [ dynamic update by socket.io ]
    好友列表 [ online or offline dynamic update by socket.io ]
    创建聊天组 [dynamic update by socket.io]
    进入、退出聊天组 [ logout后自动退出 ]
    群组聊天 [ 基于 socket.io 仅支持同一时间单一群组聊天，可切换聊天组 ]
    发布新鲜事 [ 仅好友可见 ]
    编辑，删除新鲜事 [ 仅发布者可操作 ]
    点赞新鲜事 [ 好友均可 ]
    to be continued ...


> If you like it , don't forget to star ~ thanks a lot .

