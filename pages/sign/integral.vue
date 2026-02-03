<template>
  <view class="integral-details" ref="container">
    <view class="header">
      <view class="currentScore">我的积分</view>
      <view>{{ info.integral }}</view>
      <view class="line"></view>
    </view>
    <view class="wrapper">
      <view class="nav acea-row">
        <view
          class="item acea-row row-center-wrapper"
          :class="current === navListIndex ? 'on' : ''"
          v-for="(item, navListIndex) in navList"
          :key="navListIndex"
          @click="nav(navListIndex)"
        >
          <text class="iconfont" :class="item.icon"></text>
          {{ item.name }}
        </view>
      </view>
      <view class="list" :hidden="current !== 0">
        <view
          class="item acea-row row-between-wrapper"
          v-for="(item, listIndex) in list"
          :key="listIndex"
        >
          <view>
            <text class="state">{{ item.title }}</text>
            <div>{{ item.addTime }}</div>
          </view>
          <text class="num" v-if="item.pm == 1">+{{ item.number }}</text>
          <text class="num" v-if="item.pm == 0">-{{ item.number }}</text>
        </view>
      </view>
      
    </view>
  
  </view>
</template>
<script>
export default {
  name: "integral",
  props: {},
  data: function() {
    return {
      navList: [
        { name: "积分明细" }
      ],
      current: 0,
      where: {
        page: 1,
        limit: 10
      },
      list: [],
      info: [],
	  type:0,//分类
    };
  },
  onLoad(options) {
	  if(options.type){
		  this.type=options.type
	  }
  	
  },
  
  mounted: function() {
    this.getUserInfo();
    this.getIntegralList();
  },
  onReachBottom() {
    this.where.page++;
    this.getIntegralList();
  },
  methods: {

    nav: function(index) {
      this.current = index;
    },
    getIntegralList: function() {
	  this.$H.get('sign/integralList', {
		  page: this.where.page,
		  limit: this.where.limit,
		  type:this.type
	  }).then(res => {   
		   this.list=this.list.concat(res.data)
	  })
    },
	getUserInfo: function(){
		this.$H.post('sign/userInfo', {}).then(res => {
			this.info = res.data;
		})
	}
	
  }
};
</script>
<style lang="less">
.integral-details .header {
  background-image: url('https://demo.linfeng.tech/resource/images/interal-bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 3.6 * 100rpx;
  font-size: 0.72 * 100rpx;
  color: #fff;
  padding: 0.31 * 100rpx 0 0.45 * 100rpx 0;
  text-align: center;
  font-family: 'GuildfordProBook 5';
}

.integral-details .header .currentScore {
  font-size: 0.26 * 100rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 0.05 * 100rpx;
}

.integral-details .header .line {
  width: 0.6 * 100rpx;
  height: 0.03 * 100rpx;
  background-color: #fff;
  margin: 0.2 * 100rpx auto 0 auto;
}

.integral-details .header .nav {
  font-size: 0.22 * 100rpx;
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
  -o-flex: 1;
  -ms-flex: 1;
  margin-top: 0.35 * 100rpx;
}

.integral-details .header .nav .item {
  width: 33.33%;
  text-align: center;
}

.integral-details .header .nav .item .num {
  color: #fff;
  font-size: 0.4 * 100rpx;
}

.integral-details .wrapper .nav {
  flex: 1;
  -o-flex: 1;
  -ms-flex: 1;
  width: 6.9 * 100rpx;
  border-radius: 0.2 * 100rpx 0.2 * 100rpx 0 0;
  margin: -0.96 * 100rpx auto 0 auto;
  background-color: #f7f7f7;
  height: 0.96 * 100rpx;
  font-size: 0.3 * 100rpx;
  color: #bbb;
}

.integral-details .wrapper .nav .item {
  text-align: center;
  width: 100%;
}

.integral-details .wrapper .nav .item.on {
  background-color: #fff;
  color: #00aaff;
  font-weight: bold;
  border-radius: 0.2 * 100rpx 0.2 * 100rpx 0 0;
}

.integral-details .wrapper .nav .item .iconfont {
  font-size: 0.38 * 100rpx;
  margin-right: 0.1 * 100rpx;
}

.integral-details .wrapper .list {
  background-color: #fff;
  padding: 0.24 * 100rpx 0.3 * 100rpx;
}

.integral-details .wrapper .list .tip {
  font-size: 0.25 * 100rpx;
  width: 6.9 * 100rpx;
  height: 0.6 * 100rpx;
  border-radius: 0.5 * 100rpx;
  background-color: #fff5e2;
  border: 1px solid #ffeac1;
  color: #c8a86b;
  padding: 0 0.2 * 100rpx;
  margin-bottom: 0.24 * 100rpx;
}

.integral-details .wrapper .list .tip .iconfont {
  font-size: 0.35 * 100rpx;
  margin-right: 0.15 * 100rpx;
}

.integral-details .wrapper .list .item {
  height: 1.24 * 100rpx;
  border-bottom: 1px solid #eee;
  font-size: 0.24 * 100rpx;
  color: #999;
}

.integral-details .wrapper .list .item .state {
  font-size: 0.28 * 100rpx;
  color: #282828;
  margin-bottom: 0.08 * 100rpx;
}

.integral-details .wrapper .list .item .num {
  font-size: 0.36 * 100rpx;
  font-family: 'GuildfordProBook 5';
  color: #ff0000;
}

.integral-details .wrapper .list2 {
  background-color: #fff;
  padding: 0.24 * 100rpx 0;
}

.integral-details .wrapper .list2 .item {
  background-image: linear-gradient(to right, #fff7e7 0%, #fffdf9 100%);
  background-image: -moz-linear-gradient(to right, #fff7e7 0%, #fffdf9 100%);
  width: 6.9 * 100rpx;
  height: 1.8 * 100rpx;
  position: relative;
  border-radius: 0.1 * 100rpx;
  margin: 0 auto 0.2 * 100rpx auto;
  padding: 0 0.25 * 100rpx 0 1.8 * 100rpx;
}

.integral-details .wrapper .list2 .item .pictrue {
  width: 0.9 * 100rpx;
  height: 1.5 * 100rpx;
  position: absolute;
  bottom: 0;
  left: 0.45 * 100rpx;
}

.integral-details .wrapper .list2 .item .pictrue image {
  width: 100%;
  height: 100%;
}

.integral-details .wrapper .list2 .item .name {
  width: 2.85 * 100rpx;
  font-size: 0.3 * 100rpx;
  font-weight: bold;
  color: #c8a86b;
}

.integral-details .wrapper .list2 .item .earn {
  font-size: 0.26 * 100rpx;
  color: #c8a86b;
  border: 0.02 * 100rpx solid #c8a86b;
  text-align: center;
  line-height: 0.52 * 100rpx;
  height: 0.52 * 100rpx;
  width: 1.6 * 100rpx;
  border-radius: 0.5 * 100rpx;
}
</style>
