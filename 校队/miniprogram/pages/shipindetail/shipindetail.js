var util = require('../util/util.js')

function getRandomColor() {
  const rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

Page({
  inputValue: '',
  data:{
    sendMoreMsgFlag:false,
    keyboardInputValue:'',
    useKeyboardFlag:true,
    chakancomments:false,
    chooseFiles:[],
    deleteIndx:-1,
    currentAudio:'',
    oneComment:false
  },
  onLoad:function(options){
    this.chaComments();
    var shipinid=options.id
    console.log(shipinid)
    this.setData({
      shipinid:shipinid        
    })
    wx.getSetting({
      success:res=>{
        if(res.authSetting['scope.userInfo']){
           wx.getUserInfo({
             success:res=>{
               this.setData({
                 avatarUrl:res.userInfo.avatarUrl,
                 nickName:res.userInfo.nickName
               })
               console.log('nickName',res.userInfo.nickName)
             }
           })
        }
      }
    })    
  },

  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  chaComments() {
    var that = this
    var shipinid = that.data.shipinid
    console.log(shipinid)
    const db = wx.cloud.database()
    db.collection('shipin').where({ _id: shipinid }).get({
      success: res => {
        that.setData({
          shipin: res.data || [],
        })
        console.log('[数据库] [查询记录] 成功: ', res.data)
        console.log('[数据库] [查询记录] 成功: ', that.data.shipin[0].comments[0].username)
        var com = that.data.shipin[0].comments
        console.log('jidfjs', com)
        com.sort(that.compareWithTime);
        var len = com.length,
          comment;
        for (var i = 0; i < len; i++) {
          comment = com[i];
          comment.create_time = util.getDiffTime(comment.create_time, true);
          console.log('jidfjs', comment.create_time)
        }
        that.setData({
          comments: com
        });
      },
    })
  },

  oneComment:function(event){
     var that=this
     var commentIdx=event.currentTarget.dataset.commentIdx
     that.setData({
       oneComment:!that.data.oneComment,
       commentIdx:commentIdx
     })
     var comment=that.data.comments[commentIdx]
     console.log('一条评论',comment)
     that.setData({
       comment:comment
     })
     var com=comment.twice
     console.log('二次评论',com)
     com.sort(that.compareWithTime)
     var len=com.length
     for(var i=0;i<len;i++){
      var oneTwice=com[i];
       oneTwice.create_time=util.getDiffTime(oneTwice.create_time,true);
       console.log('二次评论时间',oneTwice.create_time)
     }
     that.setData({
       twice:com
     })
  },

  backAllComments:function(){
    this.setData({
      oneComment:!this.data.oneComment
    })
  },

  compareWithTime(value1,value2){
    var flag=parseFloat(value1.create_time)-parseFloat(value2.create_time);
    if(flag<0){
      return 1;
    }else if(flag>0){
      return -1
    }else{
      return 0;
    }
  },

  bindInputBlur: function (e) {
    this.inputValue = e.detail.value
  },

  compareWithTime(value1,value2){
    var flag=parseFloat(value1.create_time) - parseFloat(value2.create_time);
    if(flag<0){
      return 1;
    }else if(flag>0){
      return -1
    }else{
      return 0;
    }
  },

  bindSendDanmu: function () {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  },

  onUpTap:function(){

  },

  onCommentTap(){
    this.setData({
      chakancomments:!this.data.chakancomments
    })
  },

  onCollectionTap(){

  },

  previewImg:function(event){
    var commentIdx=event.currentTarget.dataset.commentIdx,
    imgIdx=event.currentTarget.dataset.imgIdx,
    imgs=this.data.comments[commentIdx].content.img;
    wx.previewImage({
      current:imgs[imgIdx],
      urls:imgs
    })
  },

  onePreviewImg: function (event) {
      imgIdx = event.currentTarget.dataset.imgIdx,
      imgs = this.data.comment.content.img;
    wx.previewImage({
      current: imgs[imgIdx],
      urls: imgs
    })
  },

  twicePreviewImg: function (event) {
    var twiceIdx = event.currentTarget.dataset.twiceIdx,
      imgIdx = event.currentTarget.dataset.imgIdx,
      imgs = this.data.twice[twiceIdx].content.img;
    wx.previewImage({
      current: imgs[imgIdx],
      urls: imgs
    })
  },

  switchInputType:function(event){
    this.setData({
      useKeyboardFlag:!this.data.useKeyboardFlag
    })
  },

  bindCommentInput:function(event){
    var val=event.detail.value
    console.log(val)
    this.data.keyboardInputValue=val
  },

  submitComment:function(e){
    var that=this
    
      that.setData({
        avatarUrl:e.detail.userInfo.avatarUrl,
        nickName:e.detail.userInfo.nickName
      })
      console.log(that.data.nickName)
    
    var newComment={
      username:that.data.nickName,
      avatar:that.data.avatarUrl,
      create_time:new Date().getTime()/1000,
      content:{
        txt:that.data.keyboardInputValue,
        img:that.data.chooseFiles
      },
    };
    that.setData({
      newComment:newComment
    })
    console.log('newComment',that.data.newComment)
    if(!newComment.content.txt&&that.data.chooseFiles.length===0){
      return;
    }
    console.log('shipinid',that.data.shipinid)
    wx.cloud.callFunction({
      name:'update',
      data:{
        newComment:that.data.newComment,
        shipinid:that.data.shipinid
      },
      success: res => {
        that.chaComments();
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    that.showCommitSuccessToast();
    that.resetAllDefaultStatus();
  },

  showCommitSuccessToast:function(){
    wx.showToast({
      title:"评论成功",
      duration:1000,
      icon:"success"
    })
  },

  resetAllDefaultStatus:function(){
    this.setData({
      chooseFiles:[],
      sendMoreMsgFlag:false,
      keyboardInputValue:''
    })
  },
  
  sendMoreMsg:function(){
    this.setData({
      sendMoreMsgFlag:!this.data.sendMoreMsgFlag
    })
  },

  chooseImage:function(event){
    var imgArr=this.data.chooseFiles;
    var leftCount=9-imgArr.length;
    if(leftCount<=0){
      return;
    }
    var sourceType=[event.currentTarget.dataset.category],
       that=this;
    wx.chooseImage({
      count:leftCount,
      sourceType:sourceType,
      success: function(res) {
        that.setData({
          chooseFiles:imgArr.concat(res.tempFilePaths)
        })
      },
    })
  },

  deleteImage:function(event){
    var index=event.currentTarget.dataset.idx,
    that=this;
    that.setData({
      deleteIndx: index
    });
    that.data.chooseFiles.splice(index,1);
    setTimeout(function(){
      that.setData({
        deleteIndx:-1,
        chooseFiles:that.data.chooseFiles
      });
    },500)
  },

  recordStart:function(){
    var that=this
    this.setData({
      recordingClass:'recoding'
    });
    this.startTime=new Date();
    wx.startRecord({
      success:function(res){
        var diff=(that.endTime-that.startTime)/1000;
        diff=Math.ceil(diff);
        that.submitVoiceComment({url:res.tempFilePath,timeLen:diff})
      },
      fail:function(res){
        console.log(res);
      },
      complete:function(res){
        console.log(res);
      }
    })
  },

  recordEnd:function(){
    this.setData({
      recordingClass:''
    })
    this.endTime=new Date();
    wx.stopRecord();
  },

  submitVoiceComment:function(audio){
    var that=this
    var newComment={
      username:that.data.nickName,
      avatar:that.data.avatarUrl,
      create_time:new Date().getTime()/1000,
      content:{
        audio:audio
      }
    }
    that.setData({
      newComment: newComment
    })
    console.log('newComment', that.data.newComment)
    if (!newComment.content.audio) {
      return;
    }
    console.log('shipinid', that.data.shipinid)
    wx.cloud.callFunction({
      name: 'update',
      data: {
        newComment: that.data.newComment,
        shipinid: that.data.shipinid
      },
      success: res => {
        that.chaComments();
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    that.showCommitSuccessToast()
  },

  playAudio:function(event){
    var url=event.currentTarget.dataset.url,
    that=this;
    if(url==this.data.currentAudio){
      wx.pauseVoice();
      this.data.currentAudio=''
    }
    else{
      this.data.currentAudio=url
      wx.playVoice({
        filePath: url,
        complete:function(){
          that.data.currentAudio='';
        }
      })
    }
  }

})