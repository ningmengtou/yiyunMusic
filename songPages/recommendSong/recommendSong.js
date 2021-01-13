// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js';
import request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    // 推荐歌曲数据
    recommendList: [],
    // 被点击歌曲的index值
    songIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 先获取缓存中的userInfo，没有就跳转到登录页面
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 1.5秒后跳转到登录页面
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login',
            });
          }, 1500);
        }
      })
    } else {
      this.getRecommendSongs();
    }

    this.setData({
      date: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    });

    // 定义来自歌曲详情页发布的事件 参数1是事件名称 参数2是传递过来的参数
    PubSub.subscribe('switchType', (msg, type) => {
      let { recommendList, songIndex } = this.data;
      if (type === "pre") {
        (songIndex === 0) && (songIndex = recommendList.length);
        songIndex -= 1;
      } else {
        (songIndex === recommendList.length - 1) && (songIndex = -1);
        songIndex += 1;
      }
      // 把歌曲的索引做更新
      this.setData({
        songIndex
      });
      // 获取到切歌后的索引值，再自定义事件传递过去
      let musicId = recommendList[songIndex].id;
      PubSub.publish('musicId', musicId);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取每日推荐歌单
  async getRecommendSongs() {
    let res = await request("/recommend/songs");
    this.setData({
      recommendList: res.recommend
    });
  },
  // 点击歌曲事件
  toSongDetail(e) {
    // 获取到跳转页面参数和被点击歌曲的index值
    let { id, index } = e.currentTarget.dataset;
    this.setData({
      songIndex: index
    });
    // 跳转时把歌曲id传递过去
    wx.navigateTo({
      url: '/songPages/songDetail/songDetail?id=' + id,
    });

  }
})