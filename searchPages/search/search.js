// pages/search/search.js

import request from '../../utils/request.js';

// 防抖函数 给定时器设置一个值
let TimeId = -1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 热搜榜数据列表
    SearchHotDetail: [],
    // 默认搜索关键字
    placeholderContent: '',
    // 用户搜索关键字
    keywords: '',
    // 搜索歌曲数据列表
    searchSong: [],
    // 定时器
    timeId: 1,
    // 搜索历史记录
    searchHistory: [],
    // 清除按钮的显示隐藏
    clearShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSearchHotDetail();
    this.getPlaceholderContent();
    // 获取本地储存，没有则是空数组
    let searchHistory = wx.getStorageSync('searchHistory') || [];
    this.setData({
      searchHistory
    })

  },
  // 获取热搜榜数据函数
  async getSearchHotDetail() {
    let res = await request("/search/hot/detail");
    let index = 0;
    let SearchHotDetail = res.data.map(item => {
      item.id = index++;
      return item
    });
    this.setData({
      SearchHotDetail
    })
  },
  // 获取默认搜索关键字
  async getPlaceholderContent() {
    let res = await request("/search/default");
    this.setData({
      placeholderContent: res.data.realkeyword
    })
  },
  // 表单输入事件
  handleInput(e) {
    // 获取到表单的输入值
    let result = e.detail.value.trim();
    this.setData({
      keywords: result,
      clearShow: true
    });
    // 清除之前的定时器
    clearTimeout(TimeId);
    // 最后输入的500ms后发送请求
    TimeId = setTimeout(() => {
      this.getSearch(result);

    }, 300);
  },
  // 关键字发送请求
  async getSearch(keywords) {
    let { searchHistory } = this.data;
    // 如果关键词为空就不发送请求并且把searchSong设为空数组
    if (!keywords) {
      this.setData({
        searchSong: [],
        clearShow: false
      });
      return
    };
    let res = await request("/search", { keywords, limit: 10 });
    // 把用户搜索的关键字都保存到searchHistory中并且保存到本地中
    // 判断searchHistory中是否有keywords，有就把之前的keywords删掉，最后再添加到数组中
    // 通过indexOf判断 返回-1则是没有
    if (searchHistory.indexOf(keywords) !== -1) {
      searchHistory.splice(searchHistory.indexOf(keywords), 1)
    };
    searchHistory.unshift(keywords);
    this.setData({
      searchSong: res.result.songs,
    });
    wx.setStorageSync('searchHistory', searchHistory);
  },
  // 点击清空按钮
  clearKeywords() {
    let searchHistory = wx.getStorageSync('searchHistory') || [];
    // 把关键字和searchSong重置为空,把最新的历史记录给到searchHistory
    this.setData({
      keywords: '',
      searchSong: [],
      searchHistory
    })
  },
  // 清空历史记录
  cancelHistory() {
    // 使用对话框询问用户是否要删除历史记录
    wx.showModal({
      title: '确定要删除历史记录吗？',
      content: '',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        // result.confirm为true表示点击了确定
        if (result.confirm) {
          // 清空缓存中的历史记录并且把searchHistory重置为空数组
          wx.removeStorageSync("searchHistory");
          this.setData({
            searchHistory: []
          });
        }
      },
    });
  }
})