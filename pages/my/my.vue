<template>
	<view class="user" :style="[background]">
		<view class="header">
			<!-- #ifndef  H5 -->
			<u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent">
				<u-navbar :is-back="false" title="个人中心" :title-bold="true" :is-fixed="false" :border-bottom="false"
					:background="{ background: 'rgba(256,256, 256,' + navBg + ')' }"
					:title-color="navBg > 0.5 ? '#000' : '#fff'"></u-navbar>
			</u-sticky>
			<!-- #endif -->
			<view class="user-info row-between">
				<view class="info row">
					<image v-if="hasLogin" class="avatar mr20 flexnone" :src="userInfo.avatar" @click="showDrawer()">
					</image>
					<image v-else class="avatar mr20 flexnone" @tap="toLogin" src="../static/images/unlogin_avatar.png">
					</image>
					<view class="white" v-if="hasLogin" @tap="toNav('/pages/user/home')">

						<view class="name xxl line1">{{userInfo.username}}
							<image style="height: 22rpx;margin-left:10rpx ;" mode="heightFix" v-if="userInfo.level"
								:src="$IMG+'/vip/level_'+userInfo.level+'.png'" class="level-img-2" />
						</view>

						<view class="user-intro row-between" v-if="userInfo.intro">
							<view class="xs white ml20 mr20">{{userInfo.intro}}</view>
						</view>
					</view>
					<view class="white" v-else @tap="toLogin">
						<view style="font-size: 42rpx">点击登录</view>
						<view class="sm">登录体验更多功能</view>
					</view>
				</view>
				<view class="row" style="align-self: flex-start;">
					<view class="user-opt" style="margin-right: 30rpx;" @tap="goMessage()">
						<view class="dot row-center" v-if="msg>0"></view>
						<image style="width:58rpx;height: 58rpx;" src="/static/images/icon_my_news.png"></image>
					</view>
					<view class="user-opt" @tap="toNav('/pages/user/edit-info/edit')">
						<image style="width:58rpx;height: 58rpx;" src="/static/images/icon_my_setting.png"></image>
					</view>
				</view>
			</view>
			<view class="member column-end" @click="toVip" >
				<view class="member-entery row-between">
					<view class="row">
						<image class="icon-md" src="/static/images/icon_member.png"></image>
						<view class="ml10" v-if="hasLogin&&userInfo.vip==1">尊贵的会员您好</view>
						<view class="ml10" v-else-if="hasLogin&&userInfo.vip==0">普通用户</view>
						<view class="ml10" v-else>登录体验更多服务</view>
					</view>
					<view class="row">
						<view class="sm" v-if="isOpen=='0'">{{hasLogin ? '会员中心' : '请先登录'}}</view>
						<view class="sm" v-else>{{hasLogin ? '' : '请先登录'}}</view>
						<u-icon name="arrow-right"></u-icon>
					</view>
				</view>
			</view>
		</view>
		<view class="my-assets bg-white">
			<view class="title row lg">我的账号</view>
			<view class="nav row">
				<view class="icon-box" @click="toNav('/pages/my/fans')">
					<view class="icon-num">{{userInfo.fans || 0}}</view>
					<view class="icon-txt">粉丝</view>
				</view>
				<view class="icon-box" @click="toNav('/pages/my/follow')">
					<view class="icon-num">{{userInfo.follow || 0}}</view>
					<view class="icon-txt">关注</view>
				</view>
				<view class="icon-box" @click="toNav('/pages/my/post')">
					<view class="icon-num">{{userInfo.postNum || 0}}</view>
					<view class="icon-txt">帖子</view>
				</view>
				<view class="icon-box" @click="toNav('/pages/sign/integral')">
					<view class="icon-num">{{userInfo.integral || 0}}</view>
					<view class="icon-txt">积分</view>
				</view>
			</view>
		</view>
		<!-- mini幻灯片 -->
		<view v-if="bannerList && bannerList.length>0">
			<mine-banner :items="bannerList"></mine-banner>
		</view>
		<!-- 我的服务 -->
		<view class="block-wrap">
			<view class="block-title">我的服务</view>
			<u-grid :col="4" :border="false" style="margin: 20rpx 0;" @click="toNav">
				<u-grid-item v-for="(menu,menuListIndex) in menuList" :key="menuListIndex" :index="menu.url">
					<image class="gn-icon" :src="menu.img"></image>
					<view class="grid-text">{{menu.name}}</view>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- <view class="xs muted" style="margin: 50rpx 0;" @click="goBeian">
			<view class="row-center">
				栖心港-演示站点
			</view>
			<view class="row-center">
				© www.linfengtech.cn
			</view>
		</view> -->
		<!-- tabbar -->
		<lf-tabbar :active="4" :count="msgCount"></lf-tabbar>
		<!-- 侧边栏 -->
		<unidrawer ref="draw" :mask="true" :width="280" :mode="'left'">
			<sideview></sideview>
		</unidrawer>
		<!-- 自定义加载 -->
		<toast color="#fff" type="rotate3"></toast>
	</view>
</template>

<script>
	import mineBanner from "@/components/mine-banner/mine-banner.vue";
	import unidrawer from '@/uni_modules/uni-drawer/components/uni-drawer/uni-drawer.vue';
	import sideview from '@/components/sideView/sideview.vue';
	import wxMpUtil from "@/utils/wxMpUtil.js";
	import config from '@/utils/config.js';
	export default {
		components: {
			mineBanner,
			sideview,
			unidrawer
		},
		data() {
			return {
				$IMG: this.$IMG,
				userInfo: '',
				showNav: false,
				navH: 0,
				navBg: 0,
				menuList: [],
				statusBarH: "",
				hasLogin: false,
				background: '',
				msg: 0,
				bgImg: '',
				bannerList: [],
				isOpen: '',
				shareCover: '',
				iosClose: '',
				isIphone: getApp().globalData.iphone
			};
		},

		computed: {
			msgCount() {
				this.msg = this.$store.state.messegeNum[3]
				return this.$store.state.messegeNum
			}
		},
		onLoad(options) {
			this.getSysInfo();
			this.getBgImg();
			this.getLinkList();
			//#ifdef MP-WEIXIN
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
			//#endif
			// #ifdef H5
			if (uni.getStorageSync('hasLogin')&&config.wxh5Login) {
				//登录后的用户绑定公众号openid 下次登录判断openid即可 不用手机验证码登录
				wxMpUtil.checkAndSaveWxMpOpenid(options.code, "/main/my/my")
				let ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					if (typeof WeixinJSBridge == "undefined"){
					   if( document.addEventListener ){
						   document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
					   }else if (document.attachEvent){
						   document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
						   document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
					   }
					}
				}
			}
			// #endif
		},
		onShow() {
			if (uni.getStorageSync('hasLogin')) {
				this.getUserInfo();
				this.hasLogin = true;
			} else {
				this.hasLogin = false;
				this.userInfo = '';
			}
			this.getMsgNum();
		},
		onPageScroll(e) {
			const top = uni.upx2px(100)
			const {
				scrollTop
			} = e
			let percent = scrollTop / top > 1 ? 1 : scrollTop / top
			this.navBg = percent
		},
		onShareAppMessage(res) {
			let imgURL = this.shareCover
			return {
				title: this.$c.miniappName,
				path: '/pages/index/index',
				imageUrl: imgURL
			};
		},
		methods: {
			getUserMenu() {
				this.$loading(true);
				this.$H.get('userMenu/list').then(res => {
					if (res.code == 0) {
						if(this.isIphone&&this.iosClose=='0'){
							let list = res.result
							const excludedValues = ['/pages/user/vip/vip', '/pages/account/account','/pages/pay/pay'];
							
							this.menuList = list.filter(item => !excludedValues.includes(item.url));
						}else{
							this.menuList = res.result;
						}
						
					}
					this.$loading(false);
				});
			},
			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + this.$store.state.totalUnread.notice + res
						.result.allCount
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
				});
			},
			//显示侧边栏
			showDrawer() {
				this.$refs.draw.open();
			},
			// 获取轮播图
			getLinkList() {
				this.$H
					.post('link/list', {
						cateId: 1
					})
					.then(res => {
						this.bannerList = res.result;
					});
			},
			toLogin() {
				this.$f.login();
			},
			getSysInfo() {
				this.$H.get('system/basic').then(res => {
					this.shareCover = res.logo;
					this.isOpen = res.vipShow;
					this.iosClose = res.iosClose;
					this.getUserMenu();
				});
			},
			getUserInfo() {
				this.$H.get('user/userInfo').then(res => {
					this.userInfo = res.result;
					if(res.result.status==1){
						uni.removeStorageSync("hasLogin");
						uni.removeStorageSync("token");
						uni.removeStorageSync("userInfo");
						uni.closeSocket();
						uni.switchTab({
							url: "/pages/index/index"
						})
					}
				});
			},
			toUcenter() {
				uni.navigateTo({
					url: '/pages/user/home'
				});
			},
			toNav(url) {
				uni.navigateTo({
					url: url
				});
			},
			getIsOpen() {
				this.$H.get('system/vipShow').then(res => {
					this.isOpen = res.vipShow;
				});
			},
			toVip() {
				//会员入口总开关开着才能进入，且要考虑IOS机型是否开启虚拟支付相关功能的开关
				if (this.isOpen == '0') {
					if (!this.isIphone) {
						uni.navigateTo({
							url: '/pages/user/vip/vip'
						});
					} else {
						if (this.iosClose == '1') {
							uni.navigateTo({
								url: '/pages/user/vip/vip'
							});
						}
					}
				}
			},
			goMessage() {
				uni.switchTab({
					url: '/pages/message/message'
				})
			},

			getBgImg() {
				this.$H.get('system/bgImgConfig').then(res => {
					this.bgImg = res.bgImg;
					this.background = {
						'background-image': `url(${this.bgImg})`
					}
				});
			},
			goBeian() {
				// #ifdef H5
				window.open("https://beian.miit.gov.cn/")
				// #endif
			},
		},
	};
</script>
<style lang="scss">
	.user {
		background-image: url(../static/images/my_topbg.png);
		background-size: 100% 420rpx;
		background-repeat: no-repeat;

		.header {
			display: flex;
			flex-direction: column;
			height: 420rpx;

			.user-info {
				padding: 10rpx 30rpx;
				//#ifdef  H5 
				padding-top: 90rpx;

				//#endif
				.avatar {
					height: 110rpx;
					width: 110rpx;
					border-radius: 50%;
					overflow: hidden;
				}

				.name {
					text-align: left;
					margin-bottom: 5rpx;
					max-width: 400rpx;
				}

				.user-intro {
					border: 1px solid white;
					border-radius: 100rpx;

					.copy-btn {
						background-color: #FFDFDA;
						height: 40rpx;
						width: 90rpx;
						border-radius: 100rpx;
					}
				}

				.user-opt {
					position: relative;

					.dot {
						position: absolute;
						background-color: #ee0a24;
						border: 2rpx solid #FFFFFF;
						color: #F4F4F5;
						border-radius: 100%;
						top: 6rpx;
						right: 0rpx;
						font-size: 22rpx;
						min-width: 16rpx;
						height: 16rpx;
					}
				}

				.buyer-type {
					background-color: #FFA200;
					height: 38rpx;
					padding: 0 10rpx;
				}
			}

			.member {
				flex: 1;
				padding: 0 20rpx;

				.member-entery {
					color: #FFE0A1;
					padding: 0 16rpx;
					width: 100%;
					height: 80rpx;
					background: url(../static/images/bg_member_grade.png);
					background-size: 100%;
				}
			}

		}

		.order-nav {
			.icon-contain {
				position: relative;
			}
		}

		.order-nav,
		.my-assets {
			margin: 20rpx 20rpx 0;
			border-radius: 8rpx;
		}

		.title {
			height: 88rpx;
			padding: 0 30rpx;
			border-bottom: 1px dashed #ffffff;
		}

		.nav {
			padding: 26rpx 0 0;

			.assets-item {
				flex: 1;
			}

			.item {
				width: 25%;
			}

			.badge {
				padding: 0 6rpx;
				min-width: 28rpx;
				height: 28rpx;
				border-radius: 28rpx;
				box-sizing: border-box;
				border: 1rpx solid #FF2C3C;
				color: #FF2C3C;
				position: absolute;
				left: 33rpx;
				top: -10rpx;
				z-index: 2;
			}

			.nav-icon {
				width: 52rpx;
				height: 52rpx;
			}
		}
	}

	.block-wrap {
		background-color: #fff;
		border-radius: 20rpx;
		margin: 20rpx;
		overflow: hidden;

		.block-title {
			background-color: #fff;
			padding: 20rpx;
		}
	}
	.icon-box{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
		flex: 1;
	}
	.icon-txt{
		font-size: 26rpx;
		color: #999999;
	}
	.gn-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 20rpx;
	}

	.grid-text {
		color: #999;
		font-size: 12px;
		margin-bottom: 20rpx;
	}

	.icon {
		min-height: 34rpx;
		min-width: 34rpx;
		height: 34rpx;
		width: 34rpx;
		vertical-align: middle;
	}

	.icon-md {
		min-height: 44rpx;
		min-width: 44rpx;
		height: 44rpx;
		width: 44rpx;
		vertical-align: middle;
	}

	.row {
		display: flex;
		align-items: center;
	}

	.row-between {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.column-end {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
	}

	.mr20 {
		margin-right: 20rpx;
	}

	.flexnone {
		flex: none;
	}

	.line1 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.column-between {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}

	.wrap {
		flex-wrap: wrap;
	}

	.bg-white {
		background-color: #ffffff;
	}

	.white {
		color: #ffffff;
	}

	.icon-num {
		font-size: 32rpx;
		color: #2b2b2b;
	}

	.ml20 {
		margin-left: 20rpx;
	}

	.lg {
		font-size: 32rpx;
	}

	.sm {
		font-size: 26rpx;
	}

	.xs {
		font-size: 24rpx;
	}

	.mr5 {
		margin-right: 5rpx;
	}

	.xxl {
		font-size: 36rpx;
	}

	.xxs {
		font-size: 24rpx;
		color: #ccc;
	}

	.mb20 {
		margin-bottom: 20rpx;
	}

	.mt10 {
		margin-top: 10rpx;
	}

	.row-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.br60 {
		border-radius: 60rpx;
	}

	.ml10 {
		margin-left: 10rpx;
	}

	.ml5 {
		margin-left: 5rpx;
	}

	.muted {
		color: #999999;
	}
</style>