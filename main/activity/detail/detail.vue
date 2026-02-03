<template>
	<view class="container">
		<!-- 顶部轮播图 -->
		<view class="swiper">
			<u-swiper :list="list" :height="520"></u-swiper>
		</view>
		<view class="info">
			<view class="title">
				{{detail.title}}
			</view>
			<view class="desc">
				{{detail.synopsis}}
			</view>
			<view class="count">
				{{detail.enrollCount || 0}}人已报名
			</view>
		</view>
		<view class="detail">
			<view class="name">
				活动详情
			</view>
			<mp-html :content="detail.contentImages"></mp-html>
		</view>
		<view class="bottom">
			<view class="button disabled" v-if="detail.isEnroll">
				您已经报名
			</view>
			<view class="button disabled" v-else-if="type == 1 |type == 2">
				{{typeObj[type]}}
			</view>
			<view class="button" v-else @click="goEnroll">
				立即报名
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: "",
				list: [],
				detail: {},
				isOutLine: false,
				type: null,
				typeObj: {
					1: "报名尚未开始",
					2: "报名已经结束",
					3: "立即报名"
				}
			}
		},
		onShareAppMessage() {
			return {
				title: this.detail.title,
				imageUrl: this.detail.coverUrl
			}
		},
		onShareTimeline() {
			return {
				title: this.detail.title,
				imageUrl: this.detail.coverUrl
			}
		},
		onLoad(option) {
			this.id = option.id;
			this.getDetail();
		},
		methods: {
			goEnroll() {
				uni.navigateTo({
					url: `/main/activity/enroll/enroll?id=${this.id}`
				})
			},
			getDetail() {
				this.$H.get(`activity/${this.id}`, {
						// id: this.id
					})
					.then(res => {
						this.detail = res.data;
						this.list = [res.data.coverUrl];
						let now = new Date();
						let startEnrollTime = new Date(this.detail.startEnrollTime);
						let endEnrollTime = new Date(this.detail.endEnrollTime);
						if (now < startEnrollTime) {
							this.type = 1; // 当前时间小于报名开始时间，报名尚未开始
						} else if (now > endEnrollTime) {
							this.type = 2; // 当前时间大于报名结束时间，报名已经结束
						} else {
							this.type = 3; // 当前时间在报名开始时间和结束时间之间，报名进行中
						}
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

		.button {
			width: 686rpx;
			height: 80rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
			margin: 0 auto;
		}

		.disabled {
			background: #F5F5F5;
			color: #95959D;
		}
	}
</style>