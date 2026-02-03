<template>
	<view class="container">
		<my-navbar title="我的伙伴" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="topic-list">
				<!-- 话题 -->
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="item.id">
						<type-item :item="item"></type-item>
					</view>
				</view>
			</view>
			<view class="bottom">
				<view class="button" @click="getCode">
					查看我的伙伴码
				</view>
				<view class="button" @click="goEnroll">
					<view class="coin">
						当前可兑换：{{balance}}青蓝币
					</view>
					账户详情
				</view>
			</view>
			<!-- 邀请码图片生成 -->
			<l-painter custom-style="position: fixed; left: 200%" ref="painter" @success="handleSuccess"
				css="width: 560rpx;height: 800rpx;border-radius: 32rpx;">
				<l-painter-view css="width: 560rpx;height: 800rpx;background: white;border-radius: 32rpx;">
					<!-- 图片 -->
					<l-painter-image src="https://ceping.qinglanxinqing.com/uniapp/new/my/1.png"
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
	import typeItem from '@/personal/components/type-item/type-item.vue'
	export default {
		mixins: [scrollMixin],
		components: {
			typeItem
		},
		data() {
			return {
				list: [{
						id: 1,
						background: this.$f.geturl("/uniapp/new/personal/background1.png"),
						icon: this.$f.geturl("/uniapp/new/personal/icon1.png"),
						title: "我的群组",
						desc: "我的群组",
						url: "/personal/partner/group/group"
					},
					{
						id: 2,
						background: this.$f.geturl("/uniapp/new/personal/background2.png"),
						icon: this.$f.geturl("/uniapp/new/personal/icon2.png"),
						title: "我的推广",
						desc: "我的推广",
						url: "/personal/partner/promotion/promotion"
					},
					{
						id: 3,
						background: this.$f.geturl("/uniapp/new/personal/background3.png"),
						icon: this.$f.geturl("/uniapp/new/personal/icon3.png"),
						title: "我的活动",
						desc: "我的活动",
						url: "/personal/partner/activity/activity"
					}
				],
				imgUrl: "",
				balance: 0
			};
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad() {
			this.getData();
		},
		methods: {
			getData() {
				this.getTopicList();
			},
			handleStatus(res) {
				console.log("res", res)
				if (res.code == 200 && res.data.userInviteRewardLogs) {
					this.balance = res.data.balance;
				}
			},
			// 获取帖子
			getTopicList() {
				this.$H.get('userCoin/mePartner', {
						pageNum: 1,
						pageSize: 10
					})
					.then(res => {
						this.handleStatus(res)
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
			goTo(item) {
				uni.navigateTo({
					url: item.url
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
			width: 686rpx;
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
</style>