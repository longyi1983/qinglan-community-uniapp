<template>
	<view class="mode-item-container" :style="{ '--background': `url(${item.background})`,'--color':item.color}"
		@click="goTo">
		<view class="left">
			<view class="title">
				{{item.title}}
			</view>
			<view class="desc">
				{{item.desc}}
			</view>
			<view class="time">
				<view class="number">
					3~5min
				</view>
				<view class="arrow">
					<u-image width="49rpx" height="49rpx" :src="item.arrow"></u-image>
				</view>
			</view>
		</view>
		<!-- <view class="right">
			查看视频攻略
		</view> -->
	</view>
</template>

<script>
	export default {
		name: "mode-item",
		data() {
			return {

			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			}
		},
		methods: {
			goTo() {
				if (!this.item.open) {
					uni.showToast({
						title: '敬请期待',
						icon: 'none',
					});
					return;
				}
				uni.navigateTo({
					url: this.item.url
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.mode-item-container {
		width: 687rpx;
		height: 266rpx;
		background-image: var(--background);
		background-size: 100% 100%;
		margin-bottom: $gap;
		display: flex;
		justify-content: space-between;

		.left {
			color: white;
			padding: $gap;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			width: 500rpx;

			.title {
				font-weight: 600;
				font-size: 48rpx;
				color: #FFFFFF;
			}

			.desc {
				font-weight: 400;
				font-size: 24rpx;
				color: #FFFFFF;
			}

			.time {
				display: flex;
				align-items: center;
				gap: 20rpx;

				.number {
					font-weight: 400;
					font-size: 24rpx;
					color: black;
					width: 102rpx;
					height: 44rpx;
					line-height: 44rpx;
					background: #FFFFFF;
					border-radius: 22rpx;
					opacity: 0.2;
					backdrop-filter: blur(10px);
					text-align: center;
				}

				.arrow {
					width: 49rpx;
					height: 49rpx;
				}
			}
		}

		.right {
			width: 90rpx;
			height: 266rpx;
			background: #FFFFFF;
			border-radius: 0rpx 24rpx 24rpx 0rpx;
			opacity: 0.7;
			backdrop-filter: blur(10px);
			// 文字竖着排列
			writing-mode: vertical-rl;
			text-align: center;
			line-height: 90rpx;
			font-weight: 400;
			font-size: 24rpx;
			letter-spacing: 13rpx;
			color: var(--color);
			padding-top: 10rpx;
		}
	}
</style>