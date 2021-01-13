// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js';
import request from '../../utils/request.js';
import moment from 'moment';

// 获取app.js中定义的全局实例
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 标识音乐是否播放
    isPlay: false,
    // 歌曲详情
    songDetail: [],
    // 音乐播放地址
    songPlayUrl: '',
    // 当前音乐的id
    songId: '',
    // 音频播放链接地址
    musicLink: '',
    // 歌曲当前时长
    currentTime: '00:00',
    // 歌曲总时长
    durationTime: '00:00',
    // 实时进度 / 总进度
    audioBarWidth: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // options获取到传递过过来的歌曲详情id
    this.getSongDetail(options.id);
    // 拿到歌曲详情中的歌曲id获取歌曲播放地址
    this.setData({
      songId: options.id
    });

    // 判断是否有音频在播放 全局音频状态为true 并且该音频id和当前页面音频id一致就修改isPlay为true
    if (appInstance.globalData.songIsPlay && appInstance.globalData.songId === options.id) {
      this.setData({
        isPlay: true
      })
    }

    // 在this上创建音频实例对象
    this.backAudioManager = wx.getBackgroundAudioManager();
    // 监听音频实例的暂停和播放 把isPlap的值改成相应的boolean
    this.backAudioManager.onPause(() => {
      this.changeAudio(false);
    });
    this.backAudioManager.onPlay(() => {
      this.changeAudio(true);
      // 音频播放需要修改音频id
      appInstance.globalData.songId = this.data.songId;
    });
    // 音频停止也需要把isPlap的值改成相应的boolean
    this.backAudioManager.stop(() => {
      this.changeAudio(false);
    });
    // 监听音乐自然结束 该事件测试无效
    this.backAudioManager.onEnded(() => {
      // 自动切换下一首音乐，自动播放，并且把进度条长度还原成0,歌曲当前播放时间也是0
      // 这里切换下一首就是发送订阅事件 type值为next
      PubSub.publish("switchType", 'next');
      this.setData({
        audioBarWidth: '0%',
        currentTime: '00:00'
      })
    });
    // 监听音乐实时播放的进度
    this.backAudioManager.onTimeUpdate(() => {
      // 获取实时音频播放进度
      let currentTime = moment(this.backAudioManager.currentTime * 1000).format('mm:ss');
      // 获取实时音频进度 总进度/当前进度 转换为百分比 
      let audioBarWidth = (this.backAudioManager.currentTime / this.backAudioManager.duration) * (100).toFixed(2) + "%";
      this.setData({
        currentTime,
        audioBarWidth
      });
    });

  },
  // 更改音频的播放状态
  changeAudio(isPlay) {
    this.setData({
      isPlay
    });
    // 修改全局音乐播放的状态
    appInstance.globalData.songIsPlay = isPlay;
  },
  // 获取歌曲详情
  async getSongDetail(id) {
    let res = await request("/song/detail", { ids: id });
    // 时间单位是毫秒  moment库是专门用来格式化js时间的库
    let durationTime = moment(res.songs[0].dt).format('mm:ss');
    this.setData({
      songDetail: res.songs,
      durationTime
    });
    // 动态设置页面上方的标题
    wx.setNavigationBarTitle({
      title: res.songs[0].name,
    });
  },


  // 控制音乐的播放暂停
  handlePlay() {
    let isPlay = !this.data.isPlay;
    let { songId, musicLink } = this.data;
    // 调用控制播放暂停函数来控制音乐 传递音乐的状态
    this.musicControl(isPlay, songId, musicLink)
  },
  // 控制音乐播放暂停的函数
  async musicControl(isPlay, musicId, musicLink) {
    // 根据isPlay来播放暂停音乐
    if (isPlay) {
      // 没有获取到音频播放地址就发送请求，有就直接用
      if (!musicLink) {
        let res = await request('/song/url', { id: musicId });
        // 获取音频链接
        musicLink = res.data[0].url;
        this.setData({
          musicLink
        })
      }
      // 给音频实例对象设置src和title属性
      this.backAudioManager.src = musicLink;
      this.backAudioManager.title = this.data.songDetail[0].name;
    } else {
      this.backAudioManager.pause()
    }
  },
  // 切换歌曲功能函数
  handleSwitch(e) {
    // 获取切换的类型
    let type = e.currentTarget.dataset.type;
    // 切歌之前关闭音频实例
    this.backAudioManager.stop();
    // 订阅来自每日推进页面传递过来的自定义事件
    PubSub.subscribe('musicId', (msg, musicId) => {
      // 调用getSongDetail事件 参数就是传递过来的id
      this.getSongDetail(musicId);
      // 切歌之后自动播放歌曲
      this.musicControl(true, musicId);
      // 把切歌的id更新到data中
      this.setData({
        songId: musicId
      });
      // 取消订阅
      PubSub.unsubscribe('musicId');
    });
    // 发布自定义事件给每日推荐页面
    PubSub.publish("switchType", type);
  }
})