// pages/personal/personal.js
import request from '../../utils/request.js'

// 手指的初始距离
let startY = 0;
// 手指的移动距离
let moveY = 0;
// 手指最终移动距离
let moveDistance = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 下拉距离和动画过度时间
    coverTransform: 'translateY(0rpx)',
    coveTransition: '0s',
    // 用户信息
    userInfo: {},
    // 用户播放记录
    userMusicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取本地保存的用户信息
    let userInfo = wx.getStorageSync('userInfo') || {};
    // 能获取到用户信息才赋值到data中
    if (userInfo) {
      this.setData({
        userInfo
      })
    }

    this.getUserMusicList(userInfo.userId)
  },
  // 获取用户播放记录
  async getUserMusicList(userId) {
    let res = await request("/user/record", { uid: userId, type: 0 })
    let index = 0;
    let userMusicList = []
    while (index < 10) {
      userMusicList.push(res.allData[index++].song.al)
    }
    this.setData({
      userMusicList
    })
  },
  // 手指按下事件
  handleTouchStart(e) {
    // 动画过度时间初始化
    this.setData({
      coveTransition: '0s'
    })
    // 获取第一个手指的启始垂直距离
    startY = e.touches[0].clientY;

  },
  // 手指移动事件
  handleTouchMove(e) {
    // 获取第一个手指的移动垂直距离
    moveY = e.touches[0].clientY;
    // 计算手指移动的距离
    moveDistance = moveY - startY;
    // 根据手指移动的距离动态更新coverTransform值
    if (moveDistance < 0) {
      return
    }
    if (moveDistance > 120) {
      moveDistance = 120
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  // 手指离开事件
  handleTouchEnd() {
    // 指定动画过度时间和距离
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coveTransition: '0.5s'
    })
  },
  // 跳转到登录页面
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },
  // 获取用户的opendid
  handleGetOpenid() {
    // 1.获取登录凭证
    wx.login({
      success: async (res) => {
        // 获取到code
        let { code } = res;
        // 2.把登录凭证发送到服务器端
        let result = await request("/getOpenId", { code });
        console.log(result);
      }
    })
  }

})