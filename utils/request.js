// 导入主机信息  域名
import confing from './config.js'
// 导出封装好的请求方法 data和method都说默认参数
export default (url, data = {}, method = "GET") => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: confing.host + url,
            data,
            method,
            header: {
                cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies'):''
            },
            success: (result) => {
                // 当isLogin为true说明是登录成功
                if (data.isLogin) {
                    // 把cookie保存到缓存中
                    wx.setStorageSync('cookies', result.cookies.find(item=>item.indexOf('MUSIC_U') !== -1));
                }
                resolve(result.data)
            },
            fail: (err) => {
                reject(err)
            }
        });

    })
}