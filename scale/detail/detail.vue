<template>
	<view class="container">
		<my-navbar title="详情" :navBg="navBg"></my-navbar>
		<!-- 顶部轮播图 -->
		<view class="swiper">
			<u-swiper :list="list" :height="520"></u-swiper>
		</view>
		<view class="info">
			<view class="title">
				{{detail.scaleName}}
			</view>
			<view class="count">
				{{detail.resultCount || 0}}人已测
			</view>
		</view>
		<view class="detail">
			<view class="name">
				测试简介
			</view>
			<mp-html :content="detail.introduction"></mp-html>
		</view>
		<view class="bottom">
			<view class="button" @click="checkLogin">
				立即测试
			</view>
			<!-- #ifdef MP -->
			<button class="button share-button" open-type="share">
				<image src="@/static/scale/share.png" mode=""></image>
				分享
			</button>
			<!-- #endif -->
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
				id: "",
				archiveId: "",
				list: [],
				detail: {},
			}
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(option) {
			this.id = option.id;
			this.getDetail();
			if (option.archiveId) this.archiveId = option.archiveId;
		},
		methods: {
			checkLogin() {
				const hasLogin = uni.getStorageSync('hasLogin') || false;
				if (!hasLogin) {
					uni.showModal({
						title: '提示',
						content: '登录后才能进行测评，是否立即登录？',
						success: (res) => {
							if (res.confirm) {
								this.$f.login();
							}
						}
					});
				} else {
					this.goTo();
				}
			},
			goTo() {
				uni.navigateTo({
					url: `/scale/test/test?id=${this.id}` + (this.archiveId ? `&archiveId=${this.archiveId}` : '')
				})
			},
			getDetail() {
				this.$H.get(`scale/${this.id}`, {
						// id: this.id
					})
					.then(res => {
						this.detail = res.data;
						this.list = [res.data.imgUrl];
						console.log(11111111111, res)
					});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 750rpx;
		min-height: 100vh;
		background-color: $background;
		padding: 0;
		margin: 0;
	}

	.swiper {
		width: 750rpx;
		height: 520rpx;
	}

	.info {
		width: 750rpx;
		box-sizing: border-box;
		background-color: #fff;
		padding: $gap;
		border-radius: 30rpx 30rpx 0 0;
		font-size: 28rpx;
		color: #95959D;

		view {
			margin-bottom: 10rpx;
		}

		.title {
			font-weight: bold;
			font-size: 36rpx;
			color: #1B1B26;
		}
	}

	.detail {
		width: 750rpx;
		padding: $gap;
		background-color: #fff;
		margin-top: 16rpx;
		padding-bottom: 150rpx;

		.name {
			color: #1B1B26;
			font-weight: bold;
			margin-bottom: 29rpx;
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
			width: 686rpx;
			height: 80rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
		}

		.button:nth-child(1) {
			width: 460rpx;
			height: 80rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
		}

		.button:nth-child(2) {
			width: 202rpx;
			height: 80rpx;
			background: linear-gradient(270deg, #BEE2D8 0%, #51A28B 100%);
			border-radius: 16rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0;
			padding: 0;
			line-height: 1;

			image {
				width: 36rpx;
				height: 36rpx;
				margin-right: 10rpx;
			}
		}

	}
</style>