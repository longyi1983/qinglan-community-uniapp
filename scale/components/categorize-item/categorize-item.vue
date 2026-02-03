<template>
	<view class="mode-item" :style="{ '--background': `url(${item.background})`}" @click="goTo">
		<view class="left">
			<view class="title">
				{{item.title}}
			</view>
			<view class="desc">
				{{item.description}}
			</view>
			<view class="time">
				<view class="arrow">
					<u-image width="49rpx" height="49rpx" :src="item.button"></u-image>
				</view>
			</view>
		</view>
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
				uni.navigateTo({
					url: "/scale/list/list?id=" + this.item.id + "&title=" + this.item.title
				})
			}
		}
	}
</script>

<style lang="scss">
	.mode-item {
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
			width: 550rpx;

			.title {
				font-weight: 600;
				font-size: 44rpx;
				color: #1B1B26;
			}

			.desc {
				font-weight: 400;
				font-size: 24rpx;
				color: #95959D;
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
	}
</style>