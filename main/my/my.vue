<template>
	<view class="user">
		<view class="header">
			<my-navbar title="个人中心" :navBg="navBg" :isBack="false"></my-navbar>
			<view class="user-info row-between">
				<view class="info row">
					<image v-if="hasLogin" class="avatar mr20 flexnone" :src="userInfo.avatar" @click="showDrawer()">
					</image>
					<image v-else class="avatar mr20 flexnone" @tap="toLogin" src="/static/images/unlogin_avatar.png">
					</image>
					<view class="black" v-if="hasLogin" @tap="toNav('/pages/user/home')">
						<view class="name xxl line1">
							{{userInfo.username}}
							<text class="level">
								LV.{{userInfo.level}}
							</text>
						</view>

						<view class="user-intro row-between" v-if="userInfo.intro">
							<view class="xs ml20 mr20">{{userInfo.intro}}</view>
						</view>
					</view>
					<view class="black" v-else @tap="toLogin">
						<view style="font-size: 42rpx">点击登录</view>
						<view class="sm">登录体验更多功能</view>
					</view>
				</view>
				<view class="row"
					style="align-self: center;color:#6986FD;font-size: 24rpx;display: flex;align-items: center;" @tap="toNav('/pages/user/home')">
					<view class="">
						我的主页
					</view>
					<view class="">
						<u-icon name="arrow-right"></u-icon>
					</view>
				</view>
			</view>
		</view>
		<view class="vip" @click="toNav('/main/my/vip/vip')">
			<view class="background">
				<image :src="$f.geturl('/uniapp/new/my/vip.png')" mode=""></image>
			</view>
			<view class="content">
				<view class="top">
					<view class="left">
						<view class="name">
							栖心港VIP
						</view>
						<view class="desc" v-if="hasLogin && userInfo.vip == 1">
							会员到期时间：{{userInfo.vipExpireTime}}
						</view>
						<view class="desc" v-else>
							开通会员享各种专享功能优惠
						</view>
					</view>
					<view class="right">
						<text v-if="hasLogin && userInfo.vip == 1">续费会员</text>
						<text v-else>立即查看</text>
					</view>
				</view>
				<view class="bottom">
					<text v-if="hasLogin && userInfo.vip == 1">享受专属会员特权</text>
					<text v-else>解锁4项会员特权</text>
				</view>
			</view>
		</view>
		<!-- 青蓝币卡片 -->
		<view class="coin-card" @click="toNav('/personal/partner/describe/describe')">
			<view class="coin-card-left">
				<image src="/static/my/coin.png" class="coin-icon" mode="aspectFit" />
				<text class="coin-label">青蓝币余额</text>
			</view>
			<view class="coin-card-right">
				<text class="coin-balance">{{ qlBalance }}</text>
				<u-icon name="arrow-right"></u-icon>
			</view>
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
		<view class="block-wrap">
			<view class="block-title">更多功能</view>
			<u-grid :col="4" :border="false" style="margin: 20rpx 0;" @click="toNav">
				<u-grid-item v-for="(menu,menuListIndex) in moreList" :key="menuListIndex" :index="menu.url">
					<image class="gn-icon" :src="menu.img"></image>
					<view class="grid-text">{{menu.name}}</view>
				</u-grid-item>
			</u-grid>
		</view>
		
		<!-- 退出登录 -->
		<view class="logout-wrap" v-if="hasLogin">
			<view class="logout-btn" @click="outlogin">退出登录</view>
		</view>
		
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
	import scrollMixin from '@/mixins/scrollMixin.js';
	import mineBanner from "@/components/mine-banner/mine-banner.vue";
	import unidrawer from '@/uni_modules/uni-drawer/components/uni-drawer/uni-drawer.vue';
	import sideview from '@/components/sideView/sideview.vue';
	import wxMpUtil from "@/utils/wxMpUtil.js";
	import config from '@/utils/config.js';
	import websocket from '@/utils/websocket.js';
	export default {
		mixins: [scrollMixin],
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
				menuList: [],
				moreList:[],
				statusBarH: "",
				hasLogin: false,
				background: '',
				msg: 0,
				bgImg: '',
				bannerList: [],
				isOpen: '',
				shareCover: '',
				iosClose: '',
				isIphone: getApp().globalData.iphone,
				qlBalance: 0,
			};
		},

		computed: {
			msgCount() {
				this.msg = this.$store.state.messegeNum[3]
				return this.$store.state.messegeNum
			}
		},
		onLoad(options) {
			this.getMenus();
			this.getSysInfo();
			this.getBgImg();
			this.getLinkList();
			this.getQlBalance();
			//#ifdef MP-WEIXIN
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
			//#endif
			// #ifdef H5
			if (uni.getStorageSync('hasLogin') && config.wxh5Login) {
				//登录后的用户绑定公众号openid 下次登录判断openid即可 不用手机验证码登录
				wxMpUtil.checkAndSaveWxMpOpenid(options.code, "/pages/my/my")
				let ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					if (typeof WeixinJSBridge == "undefined") {
						if (document.addEventListener) {
							document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
						} else if (document.attachEvent) {
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
				// 登录时重新请求青蓝币余额
				this.getQlBalance();
			} else {
				this.hasLogin = false;
				this.userInfo = '';
				// 未登录时重置青蓝币余额
				this.qlBalance = 0;
			}
			this.getMsgNum();
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onShareAppMessage(res) {
			let imgURL = this.shareCover
			return {
				title: this.$c.miniappName,
				path: '/main/index/index',
				imageUrl: imgURL
			};
		},
		methods: {
			getMenus(){
				this.$H.get('appusermenu/list', {
						code:'myService',
						status:1
					})
					.then(res => {
						if (res.code == 200 && res.rows) {
							this.menuList = res.rows[0].appUserMenuList;
						}
					});
				this.$H.get('appusermenu/list', {
						code:'more',
						status:1
					})
					.then(res => {
						if (res.code == 200 && res.rows) {
							this.moreList = res.rows[0].appUserMenuList;
						}
					});
			},
			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + res.result.allCount 
					// - res.result.systemUnreadCount
					// + this.$store.state.totalUnread.notice 
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
				});
			},
			//显示侧边栏
			showDrawer() {
				return;
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
					if (res.result.status == 1) {
						// 用户被禁用时重置青蓝币余额
						this.qlBalance = 0;
						uni.removeStorageSync("hasLogin");
						uni.removeStorageSync("token");
						uni.removeStorageSync("userInfo");
						uni.closeSocket();
						uni.switchTab({
							url: "/main/index/index"
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
				if (url.includes('客服')) {
					this.$f.customerService({
						title: "",
						path: '/main/index/index',
						img: ""
					})
					return;
				}
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
							url: '/main/my/vip/vip'
						});
					} else {
						if (this.iosClose == '1') {
							uni.navigateTo({
								url: '/main/my/vip/vip'
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
					this.bgImg = 'https://ceping.qinglan.cn/uniapp/new/index/1.png';
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
			outlogin() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.$store.state.totalUnread.message = 0;
							this.$store.state.totalUnread.notice = 0;
							this.$store.state.friendList = [];
							this.$store.state.friendListShow = [];
							this.$store.state.sessionList = [];
							// 重置青蓝币余额
							this.qlBalance = 0;
							uni.removeStorageSync("hasLogin");
							uni.removeStorageSync("token");
							uni.removeStorageSync("userInfo");
							uni.removeStorageSync("activeStyle");
							uni.closeSocket();
							websocket.cleanup();
							uni.switchTab({
								url: "/main/index/index"
							});
						}
					}
				});
			},
			getQlBalance() {
				this.$H.get('userCoin/mePartner', {
					pageNum: 1,
					pageSize: 10
				}).then(res => {
					if (res.code == 200 && res.data && typeof res.data.balance !== 'undefined') {
						this.qlBalance = res.data.balance;
					}
				});
			},
		},
	};
</script>
<style lang="scss">
	.user::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 432rpx;
		z-index: -1;
		background-image: url('https://ceping.qinglan.cn/uniapp/new/index/1.png');
		background-size: cover;
		background-position: center;
	}

	.user {
		// background-image: url(../static/index/background.png);
		// background-size: 100% 432rpx;
		// background-repeat: no-repeat;
		position: relative;
		background-color: $background;
		z-index: 1;

		.header {
			display: flex;
			flex-direction: column;

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
					font-size: 36rpx;
					font-weight: bold;
					display: flex;
					align-items: center;

					.level {
						padding: 5rpx 10rpx;
						background: linear-gradient(172deg, #FFEBB6 0%, #FFC449 100%);
						border-radius: 8rpx;
						font-weight: 600;
						font-size: 24rpx;
						color: #946400;
						text-align: center;
						margin-left: 20rpx;
					}
				}

				.user-intro {
					border-radius: 100rpx;
					color: #95959D;

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
		overflow: hidden;
		width: 686rpx;
		margin: $gap auto;
		border-radius: 24rpx;
		padding: 0;

		.block-title {
			background-color: #fff;
			padding: $gap;
			font-size: 32rpx;
			font-weight: bold;
		}
	}

	.icon-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
		flex: 1;
	}

	.icon-txt {
		font-size: 26rpx;
		color: #999999;
	}

	.gn-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 20rpx;
	}

	.grid-text {
		color: #5B5B6E;
		font-size: 12px;
		margin-bottom: $gap;
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

	.black {
		color: black;
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

	.vip {
		width: 686rpx;
		height: 247rpx;
		margin: $gap auto;
		position: relative;

		.background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border-radius: 24rpx;
			z-index: 1;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.content {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 2;

			.top {
				height: 165rpx;
				display: flex;
				align-items: center;
				box-sizing: border-box;
				padding: 0 $gap;

				.left {
					width: 480rpx;

					.name {
						font-weight: 600;
						font-size: 40rpx;
						color: #875400;
					}

					.desc {
						font-weight: 400;
						font-size: 24rpx;
						color: #915A00;
					}
				}

				.right {
					width: 140rpx;
					height: 60rpx;
					line-height: 60rpx;
					text-align: center;
					background: linear-gradient(180deg, #FFC343 0%, #E08B00 100%);
					border-radius: 30rpx;
					font-weight: 400;
					font-size: 24rpx;
					color: #FFFFFF;
				}
			}

			.bottom {
				height: calc(247rpx - 165rpx);
				display: flex;
				align-items: center;
				box-sizing: border-box;
				padding: 0 $gap;
				font-weight: 400;
				font-size: 24rpx;
				color: #1B1B26;
			}
		}
	}
	
	.logout-wrap {
		width: 686rpx;
		margin: $gap auto;
		text-align: center;
	}
	
	.logout-btn {
		display: block;
		width: 686rpx;
		color: #CCCCCC;
		font-size: 26rpx;
		padding: 20rpx 0;
		border: 1px solid #EEEEEE;
		border-radius: 12rpx;
		background-color: #FAFAFA;
		opacity: 0.8;
		transition: all 0.3s ease;
		text-align: center;
	}
	
	.logout-btn:active {
		background-color: #F0F0F0;
		opacity: 1;
	}
	.coin-card {
		width: 686rpx;
		height: 100rpx;
		margin: 20rpx auto 0 auto;
		background: #fff;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 16rpx 0 rgba(105,134,253,0.08);
		padding: 0 32rpx;
	}
	.coin-card-left {
		display: flex;
		align-items: center;
	}
	.coin-icon {
		width: 44rpx;
		height: 44rpx;
		margin-right: 16rpx;
	}
	.coin-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
	}
	.coin-card-right {
		font-size: 36rpx;
		color: #FFB800;
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
</style>