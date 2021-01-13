// pages/video/video.js

import request from '../../utils/request.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 导航数据
    navList: [],
    // 有样式的标签id
    navid: 0,
    // 视频数据
    videoList: [],
    // video标识
    videoId: '',
    // 记录视频播放的时间
    videoUpdateTime: [],
    // scroll下拉刷新是否被触发
    scrollRefresher:false

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNavList();

  },
  // 获取导航栏数据
  async getNavList() {
    // 发请求获取导航栏数据只取前10个
    let res = await request("/video/group/list");
    // slice不改变原数组
    let navList = res.data.slice(0, 14);
    this.setData({
      navList,
      navid: navList[0].id
    });
    this.getVideoData(this.data.navid)

  },
  // 获取视频标签下对应的视频数据
  async getVideoData(navid) {
    let res = await request("/video/group", { id: navid });
    // 收到数据后关闭提示框
    wx.hideLoading();
    // 给每一个item都增加一个id属性
    let index = 0;
    let videoList = res.datas.map(item => {
      item.id = index++;
      return item
    });
    this.setData({
      videoList,
      scrollRefresher:false // 关闭下拉刷新
    });
  },
  // 导航栏标签样式更改
  handleCurrent(e) {
    // 获取被点击的nav获取到navid赋值到data
    let { navid } = e.currentTarget.dataset;
    // 这里重新赋值新的navid，而且请求视频数据
    this.setData({
      navid,
      videoListL: []
    });
    // 显示真正加载
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    this.getVideoData(this.data.navid);
  },
  // 视频播放或者继续时触发事件
  handlePlay(e) {
    // 需求：在点击播放事件中找到上一个播放的视频，在播放新视频的时候关闭上一个正在播放的视频
    // 关键点：如果找到上一个视频的实例对象；如何确认现在播放的视频和点击播放的视频不是同一个视频
    // 单例模式：需要创建多个对象场景时，通过一个变量来接受，始终保持只有一个对象，这样可以节省内存空间


    // 获取到当前video的id
    let vid = e.currentTarget.id
    // 获取视频播放记录数据
    let { videoUpdateTime } = this.data;

    // 当this.videoContext存在的时候执行this.videoContext.stop() 这里this.videoContext是上一个视频的实例
    // 当this.vid和vid不同时说明现在播放的视频和点击的视频不是同一个视频，不是同一个视频才需要暂停视频
    // this.vid !== vid && this.videoContext && this.videoContext.stop();

    // 把获取到的vid赋值到this.vid
    // this.vid = vid;
    // 把vid赋值到data中的videoId
    this.setData({
      videoId: vid
    });
    // 重新获取this.videoContext实例，这是新播放视频的实例
    this.videoContext = wx.createVideoContext(vid);

    // 判断之前的视频是否播放过，没有则直接播放，有则从上次播放记录开始播放
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime);
    } else {
      this.videoContext.play();
    }
  },
  // 视频播放进度触发事件
  videoUplateTime(e) {

    // 获取到视频播放的时间和视频的唯一id整合成一个对象
    let videoTimeObj = {
      currentTime: e.detail.currentTime,
      vid: e.currentTarget.id
    };
    let { videoUpdateTime } = this.data;
    // 思路：判断记录播放时长的videoUpdateTime中是否有当前的播放记录
    // 如果有，在原有的记录中修改播放时间为当前的播放时间
    // 如果没有，需要在数组中添加当前视频的播放对象
    // 使用find方法判断vid是否一致 有则返回对象给到videoItem
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if (videoItem) {
      videoItem.currentTime = e.detail.currentTime
    } else {
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })
  },
  // 视频播放完触发事件
  videoPlayEnd(e) {
    // 获取到视频结束的vid，在videoUpdateTime中移除它
    this.setData({
      videoUpdateTime: this.data.videoUpdateTime.filter(item => item.vid !== e.currentTarget.id)
    })
  },
  // 监听下拉刷新
  refresherrefresh() {
    this.getVideoData(this.data.navid);
  },
  // 监听上拉加载事件
  scrolltolower() {
    console.log(11);
  },
  // 监听页面分享功能 解构from参数
  onShareAppMessage:function({from},e) {
    // from参数可以是butotn或者是menu
    console.log(from);
    return {
      title:'来听音乐啊！！！',
      page:'/pages/video/video',
      imageUrl:'/static/images/wangye.jpg'
    }
  },
  // 跳转到搜索页面
  toSearch() {
    wx.navigateTo({
      url:'/searchPages/search/search'
    })
  }
})