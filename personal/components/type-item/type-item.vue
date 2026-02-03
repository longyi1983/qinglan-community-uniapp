<template>
	<view class="type-item-container" :style="{ '--background': `url(${item.background})`,'--color':item.color}"
		@click="goTo">
		<view class="left">
			<u-image :src="item.icon" width="100rpx" height="100rpx"></u-image>
		</view>
		<view class="right">
			<view class="title">
				{{item.title}}
			</view>
			<view class="desc">
				{{item.desc}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "type-item",
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
					url: this.item.url
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.type-item-container {
		width: 687rpx;
		height: 180rpx;
		background-image: var(--background);
		background-size: 100% 100%;
		margin: 0 auto;
		margin-bottom: $gap;
		display: flex;

		.left {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: $gap;
		}

		.right {
			color: white;
			padding: $gap;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			width: 400rpx;

			.title {
				font-weight: 600;
				font-size: 36rpx;
			}

			.desc {
				font-weight: 400;
				font-size: 24rpx;
			}
		}
	}
</style>