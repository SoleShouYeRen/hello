var util = require('../util/util.js')
const app = getApp()

Page({
  data: {
    winWidth:0,
    winHeight:0,
    currentTab:0,
    shipin: [],
    allshipin:[]
  },

  onLoad:function(options){
    var that=this;
    wx.getSystemInfo({
      success:function(res){
        that.setData({
          winWidth:res.windowWidth,
          winHeight:res.windowHeight
        })
      }
    })
    if(app.globalData.openid){
      that.setData({
        openid:app.globalData.openid
      })
    }
  },

  onShow:function(res){
    this.getShipinList();
  },

  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  bindChange:function(e){
    var that=this;
    that.setData({
      currentTab:e.detail.current
    })
  },

  swichNav:function(e){
    var that=this;
    if(this.data.currentTab===e.target.dataset.current){
      return false;
    }else{
      that.setData({
        currentTab:e.target.dataset.current
      })
    }
  },

  getShipinList:function(){
    var that=this
    const db=wx.cloud.database()
    
    db.collection('shipin').get({
      success: res => {
        that.setData({
          shipin: res.data || []
        })
        console.log('[数据库] [查询记录] 成功: ', res)
        var com = that.data.shipin
        console.log('jidfjs', com)
        com.sort(that.compareWithTime);
        var len = com.length,
          oneshipin;
        for (var i = 0; i < len; i++) {
          oneshipin = com[i];
          oneshipin.time = util.getDiffTime(oneshipin.time, true);
          console.log('jidfjs', oneshipin.time)
        }
        that.setData({
          allshipin: com
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  compareWithTime(value1, value2) {
    var flag = parseFloat(value1.create_time) - parseFloat(value2.create_time);
    if (flag < 0) {
      return 1;
    } else if (flag > 0) {
      return -1
    } else {
      return 0;
    }
  },

  shipindetail(event){
    var shipinid=event.currentTarget.dataset.shipinid;
    console.log(shipinid);
    wx.navigateTo({
      url:'../shipindetail/shipindetail?id='+shipinid,
    })
  }
})