<template>
	<view class="vip">
		<text>LV.{{level}}</text>
	</view>
</template>

<script>
	export default {
		name: "user-level",
		data() {
			return {

			};
		},
		props: {
			level: {
				type: Number,
				default: 1
			}
		}
	}
</script>

<style lang="scss" scoped>
	.vip {
		// width: 44rpx;
		// height: 24rpx;
		line-height: 24rpx;
		text-align: center;
		background: linear-gradient(172deg, #FFEBB6 0%, #FFC449 100%);
		border-radius: 4rpx;
		font-weight: 600;
		font-size: 12rpx;
		color: #946400;
		text-align: center;
		padding: 3rpx 7rpx;
		margin-left: 10rpx;
	}
</style>