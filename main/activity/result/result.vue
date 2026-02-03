<template>
	<view class="container">
		<my-navbar title="报名成功" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="success">
				<u-image width="52rpx" height="52rpx" src="@/static/activity/success.png"></u-image>
			</view>
			<view class="word">
				已报名【{{detail.title}}】活动，请添加以下活动客服微信哦！
			</view>
			<view class="qrcode">
				<u-image width="366rpx" height="366rpx" :src="detail.qrCode"></u-image>
			</view>
			<!-- 推荐活动 -->
			<view class="activity-list">
				<activity-item-hot v-for="item in list" :key="item.id" :item="item"></activity-item-hot>
			</view>
			<!-- 底部栏 -->
			<view class="bottom">
				<view class="button" @click="goTo('/main/index/index')">
					回到首页
				</view>
				<view class="button" @click="goTo('/main/community/community')">
					去社区逛逛
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				id: null,
				detail: {},
				list:[]
			};
		},
		onLoad(option) {
			this.id = option.id;
			this.getDetail();
			this.getActivityList();
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		methods: {
			// 获取帖子
			getActivityList() {
				this.loadStatus = 'loading';
				this.$H.get('activity/list', {
						page: 1,
						type: 0
					})
					.then(res => {
						this.list = res.rows;
					});
			},
			getDetail() {
				this.$H.get(`activity/${this.id}`)
					.then(res => {
						this.detail = res.data;
					});
			},
			goTo(url) {
				uni.navigateTo({
					url: url,
					fail() {
						uni.switchTab({
							url: url
						})
					}
				})
			}
		}
	};
</script>
<style lang="scss" scoped>
	.innerContainer {
		padding: $gap;
	}

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

	.success {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 60rpx;
	}

	.word {
		width: 400rpx;
		margin: 0 auto;
		text-align: center;
		font-size: 32rpx;
		color: #333333;
		margin-top: 40rpx;
	}

	.qrcode {
		width: 392rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 40rpx auto;
		padding: 14rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
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
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
			margin: 0 auto;
			font-weight: bold;
		}

		.button:nth-child(1) {
			background: #F6F6FF;
			color: #6986FD;
		}

		.disabled {
			background: #F5F5F5;
			color: #95959D;
		}
	}
	.activity-list{
		padding-bottom: 180rpx;
	}
</style>