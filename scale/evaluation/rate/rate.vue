<template>
	<view class="container">
		<my-navbar title="评价" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="type-container">
				<view class="sheep">
					<u-image :src="sheep" width="200rpx" height="255rpx"></u-image>
				</view>
				<view class="desc">
					<view class="name">
						<view class="">
							<image src="@/static/scale/arrow.png" mode=""></image>
						</view>
						Hi，我是可可
					</view>
					<view class="detail">
						<view class="typewriter-text">
							{{ officialDesc }}
						</view>
					</view>
				</view>
			</view>
			
			<view class="rating-section">
				<view class="rating-title">您的评分</view>
				<u-rate v-model="rating" :count="5" active-color="#7691FF" inactive-color="#E0E0E0"></u-rate>
			</view>
			
			<view class="feedback-section">
				<view class="feedback-title">您的反馈</view>
				<u-input
					v-model="feedback"
					type="textarea"
					placeholder="请输入您的意见和建议..."
					:border="true"
					height="200"
				></u-input>
			</view>
			
			<view class="btn" @click="submitRating">
				提交评价
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
				sheep: this.$f.geturl("/uniapp/new/ai-bot/3-logo.png"),
				rating: 0,
				feedback: '',
				officialDesc: "感谢您使用我们的心理健康评估服务。您的反馈对我们非常重要，它将帮助我们不断改进服务质量，为更多用户提供更好的心理支持。请花一点时间，分享您的使用体验和建议。"
			}
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		methods: {
			submitRating() {
				if (this.rating === 0) {
					uni.showToast({
						title: '请选择评分',
						icon: 'none'
					});
					return;
				}

				const data = {
					rating: this.rating,
					feedback: this.feedback
				};
				uni.showToast({
					title: '评价提交成功',
					icon: 'success'
				});
				setTimeout(()=>{
					uni.switchTab({
						url: '/main/index/index'
					})
				},1500)
				// this.$H.post('/psychologicalAssessment/feedback', data)
				// 	.then(res => {
				// 		uni.showToast({
				// 			title: '评价提交成功',
				// 			icon: 'success'
				// 		});
				// 		setTimeout(()=>{
				// 			uni.navigateTo({
				// 				url: '/main/index/index'
				// 			})
				// 		},1500)
				// 	})
				// 	.catch(err => {
				// 		uni.showToast({
				// 			title: '提交失败，请重试',
				// 			icon: 'none'
				// 		});
				// 	});
			}
		}
	}
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

	.type-container {
		position: relative;

		.sheep {
			width: 200rpx;
			height: 255rpx;
			margin: 0 auto;
			z-index: -1;
			padding-top: 50rpx;
		}

		.desc {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 686rpx;
			box-sizing: border-box;
			padding: $gap;
			background: #FFFFFF;
			border-radius: 24rpx;
			margin: 0 auto;
			margin-top: -20rpx;
			backdrop-filter: blur(30px);

			.name {
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: bold;
				font-size: 52rpx;
				color: #1B1B26;

				view {
					margin-top: -40rpx;
					margin-right: 20rpx;
				}

				image {
					width: 40rpx;
					height: 32rpx;
				}
			}

			.detail {
				margin-top: $gap;
				font-weight: 400;
				font-size: 28rpx;
				color: #5B5B6E;

				view {
					text-indent: 2em;
					margin-bottom: 10rpx;
				}
			}
		}
	}

	.rating-section {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: $gap;
		margin: 20rpx auto;
		
		.rating-title {
			font-size: 32rpx;
			color: #1B1B26;
			margin-bottom: 20rpx;
		}
	}

	.feedback-section {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: $gap;
		margin: 20rpx auto;
		
		.feedback-title {
			font-size: 32rpx;
			color: #1B1B26;
			margin-bottom: 20rpx;
		}
	}

	.btn {
		border-radius: 100rpx;
		font-size: 32rpx;
		text-align: center;
		width: 686rpx;
		height: 88rpx;
		line-height: 88rpx;
		margin: 40rpx auto;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: white;
		border-radius: 16rpx;
	}

	.typewriter-text {
		min-height: 1.5em;
	}
</style>
