//index.js
// 引入请求方法
import request from '../../utils/request.js'
//获取应用实例
const app = getApp()

Page({
    data: {
        // 轮播图数据
        swiperList: [],
        // 推荐歌曲数据
        personalizedList: [],
        // 排行榜数据
        topList: [],
        // 组件文字
        textContent: [{
            title: "推荐歌曲",
            des: "为你精心推荐"
        }, {
            title: "排行榜",
            des: "热歌风向标"
        }]
    },
    async onLoad() {
        // 使用请求方法拿到数据
        let res1 = await request('/banner', { type: 2 });
        let res2 = await request("/personalized", { limit: 10 });
        this.setData({
            swiperList: res1.banners,
            personalizedList: res2.result,
        })
        // 循环拿到前五的歌曲排行榜
        let topList = [];
        let index = 0;
        while (index < 5) {
            let res3 = await request("/top/list", { idx: index++ });
            let obj = { name: res3.playlist.name, tracks: res3.playlist.tracks }
            topList.push(obj);
            this.setData({
                topList
            })
        }
    }
})
