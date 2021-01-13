// pages/login/login.js
import request from '../../utils/request.js'


// 登录流程：1.收集表单数据 
// 2.前端验证(用户信息是否合法,如账号密码，不通过就提示用户不需要发请求；通过了再发请求携带用户信息) 
// 3.后端验证(验证用户是否存在，存在则需要验证密码是否正确，不存在则告诉用户不存在)
// 密码不正确返回给前端密码不正确，密码正确则返回用户登录成功并且携带用户信息

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    phone: '',
    password: '',
    // 用户信息列表

    // avatarUrl: '',
    // nickname: ''

  },
  // 输入电话号码事件
  handleInput(e) {
    // 获取表单的值和对于的type
    let value = e.detail.value;
    // let type = e.currentTarget.id
    // 利用data-set形式获取指定的表单属性
    let type = e.target.dataset.type
    this.setData({
      [type]: value
    });

  },
  // 登录事件
  async handleLogin() {
    // 在data中解构手机号和密码
    let { phone, password } = this.data;
    // 前端验证信息
    // 验证手机号是否为空
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
      });
      return;
    }
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
    // 验证手机号格式是否正确
    if (!phoneReg.test(phone.trim())) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none',
      });
      return;
    }
    // 验证密码是否为空
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
      });
      return;
    }

    // 后端验证信息
    let res = await request("/login/cellphone", { phone, password, isLogin: true });
    // 验证密码是否错误
    if (res.code === 200) {
      // 验证成功把用户信息保存到本地并且跳转页面
      wx.setStorageSync('userInfo', res.profile);
      wx.reLaunch({
        url: '/pages/personal/personal',
      });


    } else if (res.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'none',
      });
    } else if (res.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'none',
      });
    } else {
      wx.showToast({
        title: '登录失败',
        icon: 'none',
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
})