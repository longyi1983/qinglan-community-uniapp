<template>
	<view class="container">
		<my-navbar title="我的伙伴" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 输入框 -->
			<!-- <view class="header">
				<u-search placeholder="搜索已邀请的人" v-model="keyword" :showAction="false" bgColor="#FFFFFF"></u-search>
			</view> -->
			<view class="topic-list">
				<!-- 话题 -->
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="item.uid">
						<partner-item :item="item"></partner-item>
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
				</view>
			</view>
			<view class="bottom">
				<view class="button" @click="getCode">
					查看我的伙伴码
				</view>
				<view class="button" @click="goCustomerService">
					<view class="coin">
						当前可兑换：{{balance || 0}}青蓝币
					</view>
					去兑换
				</view>
			</view>
			<!-- 悬浮提现记录按钮 -->
			<view class="withdraw-record-fab" @click="goWithdrawRecord">
				提现记录
			</view>
			<!-- 邀请码图片生成 -->
			<l-painter custom-style="position: fixed; left: 200%" ref="painter" @success="handleSuccess"
				css="width: 560rpx;height: 800rpx;border-radius: 32rpx;">
				<l-painter-view css="width: 560rpx;height: 800rpx;background: white;border-radius: 32rpx;">
					<!-- 图片 -->
					<l-painter-image src="https://ceping.qinglan.cn/uniapp/new/my/1.png"
						css="width: 560rpx; height: 560rpx;border-radius: 32rpx 32rpx 0 0;" />
					<!-- 文字 -->
					<l-painter-view css="margin-left:32rpx;width: 260rpx; height: 230rpx; display: inline-block">
						<l-painter-text text="加入栖心港\n一起寻找自我吧！"
							css="width: 260rpx;font-size:28rpx;font-weight:bold;margin-top:32rpx;line-height:48rpx" />
					</l-painter-view>
					<!-- 邀请码 -->
					<l-painter-view
						css="margin-left:32rpx;margin-top:10rpx;width: 200rpx;height: 200rpx; display: inline-block">
						<l-painter-image :src="imgUrl" css="width: 200rpx; height: 200rpx;" />
					</l-painter-view>
				</l-painter-view>
			</l-painter>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import partnerItem from '@/personal/components/partner-item/partner-item.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			partnerItem
		},
		data() {
			return {
				current: 0,
				tabs: [{
					name: '热门帖子',
				}, {
					name: '按互动',
				}, ],
				// 帖子相关
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				hotTopic: [1, 2, 3, 4, 5, 6, 7, 8, 9],
				imgUrl: "",
				balance: 0
			};
		},
		computed: {
			newHot() {
				// 将数组进行分割
				return this.$f.splitArray(this.hotTopic, 4)
			},
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad() {
			this.getData();
		},
		onShow() {

		},
		onReachBottom() {
			this.page++;
			this.getData();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.list = [];
			this.loadStatus = 'loading';
			this.getData();
			uni.stopPullDownRefresh();
		},
		methods: {
			goCustomerService() {
				// this.$f.customerService({
				// 	title: '积分兑换',
				// 	path: '/personal/partner/promotion/promotion',
				// 	img: ""
				// })
				uni.navigateTo({
					url: "/personal/partner/withdrawal/withdrawal"
				})
			},
			getData() {
				if (this.loadStatus == 'nomore') return;
				this.getTopicList();
			},
			handleStatus(res) {
				console.log("res", res)
				if (res.code == 200 && res.data.userInviteRewardLogs) {
					this.balance = res.data.balance;
					this.list = this.list.concat(res.data.userInviteRewardLogs.rows);
					if (res.data.userInviteRewardLogs.rows.length < 10) {
						this.loadStatus = 'nomore';
					} else {
						this.loadStatus = 'loadmore';
					}
				} else {
					this.loadStatus = 'nomore';
				}
			},
			// 获取帖子
			getTopicList() {
				this.loadStatus = 'loading';
				this.$H.get('userCoin/mePartner', {
						pageNum: this.page,
						pageSize: 10
					})
					.then(res => {
						this.handleStatus(res)
					});
			},
			change(index) {
				this.current = index;
				this.loadStatus = 'loading';
				this.page = 1;
				this.list = [];
				this.getData();
			},
			goTo(item) {
				uni.navigateTo({
					url: item.url
				});
			},
			handleSuccess(res) {
				uni.previewImage({
					urls: [res.tempFilePath],
					success: function() {
						console.log('preview success');
					}
				});
			},
			getCode() {
				uni.showLoading({
					title: '生成中',
					mask: true
				})
				// 首先获取邀请码
				this.$H.post('qlInviteCode', {})
					.then(res => {
						this.$H.post('qlInviteCode/wxcode', {
								path: `/pages/user/login?inviteCode=${res.msg}`,
								// env_version: "trial",
							})
							.then(code => {
								const base64 = "data:image/png;base64," + code //这里需要添加前缀
								this.imgUrl = base64 || '';
								setTimeout(() => {
									// 延迟一会
									this.$refs.painter.canvasToTempFilePathSync({
										fileType: "png",
										quality: 1,
										success: (res) => {
											this.handleSuccess(res)
											uni.hideLoading()
										},
										fail: () => {
											uni.hideLoading()
											uni.showToast({
												title: '生成失败',
												icon: 'none'
											})
										}
									});
								}, 500)
							});
					});
			},
			goWithdrawRecord() {
				uni.navigateTo({
					url: '/personal/partner/withdrawal/list'
				});
			},
		}
	};
</script>
<style lang="scss" scoped>
	.container {
		position: relative;
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
		height: 68rpx;
		padding: $gap;
	}


	.topic-list {
		width: 100vw;
		overflow: hidden;

		.content {
			padding: $gap;
		}
	}

	.hot-topic {
		padding: $gap;

		.title {
			display: flex;
			align-items: center;
			font-weight: 600;
			font-size: 36rpx;
			color: #1B1B26;

			image {
				width: 36rpx;
				height: 36rpx;
				margin-right: 16rpx;
			}
		}
	}

	.swiper {
		height: 400rpx;
	}

	.hot-topic-list {
		.hot-topic-item {
			width: 450rpx;
			display: flex;
			align-items: center;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #5B5B6E;
			margin: 50rpx 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			image {
				width: 28rpx;
				height: 28rpx;
				margin-right: 10rpx;
			}
		}
	}

	.bottom {
		background-color: #fff;
		width: 750rpx;
		height: 150rpx;
		position: fixed;
		bottom: 0;
		left: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;

		.button {
			width: 328rpx;
			height: 80rpx;
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
			margin: 0 auto;
		}

		.button:nth-child(1) {
			width: 328rpx;
			height: 80rpx;
			background: #F6F6FF;
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #6986FD;
		}

		.button:nth-child(2) {
			width: 328rpx;
			height: 80rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #FFFFFF;
			position: relative;

			.coin {
				position: absolute;
				top: -32rpx;
				left: 0;
				height: 32rpx;
				line-height: 32rpx;
				background: linear-gradient(180deg, #FFEBB6 0%, #FFC449 100%);
				border-radius: 100rpx;
				font-weight: 600;
				padding: 0 5rpx;
				font-size: 20rpx;
				color: #946400;
			}
		}
	}
	.withdraw-record-fab {
		position: fixed;
		z-index: 100;
		bottom: 220rpx;
		right: 40rpx;
		width: 120rpx;
		height: 120rpx;
		background: #6986FD;
		color: #fff;
		border-radius: 60rpx;
		box-shadow: 0 8rpx 24rpx rgba(105,134,253,0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		letter-spacing: 2rpx;
	}
</style>