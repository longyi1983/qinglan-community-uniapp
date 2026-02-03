<template>
	<view class="container">
		<!-- #ifdef MP-WEIXIN -->
		<!-- 闪屏页面 -->
		<view class="launch-container" v-if="showLaunch">
			<my-navbar title="栖心港" :navBg="navBg" :isBack="false"></my-navbar>
			<!-- 右上角透明跳过按钮 -->
			<view class="skip-btn" @click="hideLaunch">
				<text class="skip-text">{{countdown}}s 跳过</text>
			</view>
			
			<!-- 底部图片 -->
			<image 
				class="launch-image" 
				:src="launchImageUrl" 
				mode="aspectFill"
			></image>
		</view>
		<!-- #endif -->
		
		<z-paging ref="pagePaging" refresher-only @onRefresh="onRefresh" @scrolltolower="scrolltolower"
			@scroll="scroll">
			<template #top>
				<my-navbar title="栖心港" :navBg="navBg" :isBack="false"></my-navbar>
			</template>
			<!-- 输入框 -->
			<view class="header">
				<view class="search" @click="goSearch">
					<u-search placeholder="搜AI视觉聊愈" v-model="keyword" disabled :showAction="false"
						bgColor="#FFFFFF"></u-search>
				</view>
				<view class="signIn" @click="goActivity">
					<image src="/static/index/signIn.png" mode=""></image>
					活动
				</view>
			</view>
			<!-- banner栏 -->
			<view class="banner">
				<my-swiper code="home-swiper"></my-swiper>
			</view>
			<!-- 工具栏宫格 -->
			<view class="grid">
				<swiper :indicator-dots="false" class="swiper">
					<swiper-item>
						<u-grid :border="false" :col="5">
							<u-grid-item :customStyle="{width:110+'rpx',height:140+'rpx',background:'none'}"
								v-for="(item, index) in gridList" :index="index" :key="item.name" bgColor="transparent">
								<u-image :showLoading="true" :src="item.img" width="100rpx" height="100rpx"
									@click="goTo(item.url)"></u-image>
								<text class="grid-text">{{ item.name }}</text>
							</u-grid-item>
						</u-grid>
					</swiper-item>
				</swiper>
			</view>
			<!-- 评估 -->
			<view class="evaluation">
				<view class="evaluation-item" v-for="item in evaluationList" @click="goTo(item.url)">
					<u-image :src="item.img" width="214rpx" height="172rpx"></u-image>
					<text class="name">{{item.name}}</text>
				</view>
			</view>
			<!-- 图片展示 -->
			<view class="imgList">
				<view class="left-img">
					<u-image :showLoading="true" :src="imgList[0].img" width="333rpx" height="340rpx"
						@click="goTo(imgList[0].url)"></u-image>
				</view>
				<view class="right-img">
					<u-image :showLoading="true" :src="imgList[1].img" width="333rpx" height="160rpx"
						@click="goTo(imgList[1].url)"></u-image>
					<u-image :showLoading="true" :src="imgList[2].img" width="333rpx" height="160rpx"
						@click="goTo(imgList[2].url)"></u-image>
				</view>
			</view>
			<view class="swiper-container">
				<view class="tabs">
					<u-tabs :list="tabs" @click="click" font-size="$gap" :is-scroll="false"
						:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
						:current="current" @change="change" bg-color="#FFFFFF"></u-tabs>
				</view>
				<swiper class="swiper" :style="[{height:swiperHeight+'px'}]" :current="current" @change="swiperChange">
					<swiper-item class="swiper-item" v-for="(item, index) in tabs" :key="index">
						<swiper-topic-list ref="swiperList" :tabIndex="index" :currentIndex="current"
							@heightChanged="heightChanged">
						</swiper-topic-list>
					</swiper-item>
				</swiper>
			</view>
			<template #bottom>
				<lf-tabbar :active="0" :count="msgCount"></lf-tabbar>
			</template>
		</z-paging>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				swiperHeight: 0,
				topicList: [],
				current: 1,
				bannerList: [
					"https://ceping.qinglan.cn/uniapp/new/index/banner.png"
				],
				gridList: [],
				imgList: [{
						img: "https://ceping.qinglan.cn/uniapp/new/index/banner1.png",
						name: "AI视觉疗愈限免",
						url: "/ai/ohCard/ohCard"
					},
					{
						img: "https://ceping.qinglan.cn/uniapp/new/index/banner2.png",
						name: "本周热门测试",
						url: "/scale/list/list?id=999&title=热门量表测试"
					},
					{
						img: "https://ceping.qinglan.cn/uniapp/new/index/banner3.png",
						name: "AI心理学沙龙",
						url: "/main/activity/detail/detail?id=36"
					},
				],
				tabs: [{
					name: '关注',
				}, {
					name: '推荐',
				}, ],
				keyword: '',
				imgUrl: "",
				evaluationList: [],
				// #ifdef MP-WEIXIN
				showLaunch: true,
				launchImageUrl: "",
				launchTimer: null,
				countdown: 5
				// #endif
			};
		},
		onLoad() {
			// #ifdef MP-WEIXIN
			// 设置闪屏图片路径
			this.launchImageUrl = this.$f.geturl("/uniapp/new/index/launch.jpg");
			// 倒计时
			this.countdown = 5;
			const timer = setInterval(() => {
				if (this.countdown > 0) {
					this.countdown--;
				} else {
					clearInterval(timer);
					this.hideLaunch();
				}
			}, 1000);
			// 5秒后自动隐藏闪屏
			this.launchTimer = setTimeout(() => {
				this.hideLaunch();
			}, 5000);
			// #endif
			
			this.getMenus();
			// this.getCode();
			this.getMsgNum();
		},
		onUnload() {
			// #ifdef MP-WEIXIN
			// 清除定时器
			if (this.launchTimer) {
				clearTimeout(this.launchTimer);
			}
			// #endif
		},
		computed: {
			msgCount() {
				this.msg = this.$store.state.messegeNum[3]
				return this.$store.state.messegeNum
			}
		},
		methods: {
			goActivity() {
				uni.navigateTo({
					url: '/personal/partner/describe/describe'
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
			scroll(e) {
				this.handlePageScroll(e.detail);
			},
			onRefresh() {
				this.$refs.swiperList[this.current].reload(() => {
					this.$refs.pagePaging.endRefresh();
				});
			},
			scrolltolower() {
				this.$refs.swiperList[this.current].doLoadMore();
			},
			swiperChange(e) {
				this._setCurrent(e.detail.current);
			},
			heightChanged(height) {
				if (height === 0) {
					height = uni.getSystemInfoSync().windowHeight - uni.upx2px(80);
				}
				this.swiperHeight = height;
			},
			_setCurrent(current) {
				if (current !== this.current) {
					this.$refs.swiperList[this.current].clear();
				}
				this.current = current;
			},
			change(index) {
				this.current = index;
			},
			getMenus() {
				this.$H.get('appusermenu/list', {
						code: 'home',
						status: 1
					})
					.then(res => {
						if (res.code == 200 && res.rows) {
							this.gridList = res.rows[0].appUserMenuList;
						}
					});
				this.$H.get('appusermenu/list', {
						code: 'evaluation',
						status: 1
					})
					.then(res => {
						if (res.code == 200 && res.rows) {
							this.evaluationList = res.rows[0].appUserMenuList;
						}
					});
			},
			goTo(url) {
				uni.navigateTo({
					url: url,
					fail: () => {
						uni.switchTab({
							url: url
						});
					}
				});
			},
			click() {
				// 处理点击事件
			},
			goSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				});
			},
			hideLaunch() {
				// #ifdef MP-WEIXIN
				if (this.launchTimer) {
					clearTimeout(this.launchTimer);
				}
				this.showLaunch = false;
				// #endif
			}
		}
	};
</script>
<style lang="scss" scoped>
	.container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		padding: 0;
		margin: 0;
	}

	.container::before {
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

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 68rpx;
		padding: $gap;

		.search {
			width: 542rpx;
		}

		.signIn {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 400;
			color: #FFFFFF;
			color: black;
			font-size: 28rpx;
			font-weight: bold;

			image {
				width: 44rpx;
				height: 44rpx;
				margin-right: 8rpx;
			}
		}
	}

	.grid {
		margin-top: $gap;
		padding: 0 $gap;

		.grid-text {
			font-size: 24rpx;
			color: #5B5B6E;
		}

		.swiper {
			height: 140rpx;
		}
	}

	.banner {
		margin-top: $gap;
		height: 360rpx;
		padding: 0 $gap;
	}

	.imgList {
		display: flex;
		justify-content: space-between;
		margin: $gap 0;
		padding: 0 $gap;

		.right-img {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
	}

	.swiper {
		height: 1000px;
	}

	.swiper-container {
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		padding: $gap;
	}

	.tabs {
		z-index: 100;
		position: sticky;
		top: 0;
	}
	.evaluation{
		width: 686rpx;
		margin: $gap;
		display: flex;
		justify-content: space-between;
		
		.evaluation-item{
			width: 214rpx;
			height: 172rpx;
			overflow: hidden;
			position: relative;
			.name{
				position: absolute;
				left: 0;
				top: $gap;
				width: 214rpx;
				text-align: center;
				font-weight: 600;
				font-size: 28rpx;
				color: #FFFFFF;
			}
		}
	}

	.launch-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #fff;
		z-index: 9999;
		
		.skip-btn {
			position: absolute;
			top: 0;
			right: 0;
			width: 300rpx;
			height: 300rpx;
			z-index: 10;
			background-color: transparent;
			display: flex;
			justify-content: center;
			align-items: flex-end;
			padding-bottom: 40rpx;
			
			.skip-text {
				font-size: 28rpx;
				color: #FFFFFF;
				background-color: rgba(0, 0, 0, 0.3);
				padding: 8rpx 20rpx;
				border-radius: 30rpx;
			}
		}
		
		.launch-image {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
		}
	}
</style>