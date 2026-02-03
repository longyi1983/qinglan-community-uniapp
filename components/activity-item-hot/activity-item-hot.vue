<template>
	<view class="activityItem" @click="goToDetail">
		<view class="left">
			<view class="title">
				{{item.title}}
			</view>
			<view class="desc">
				<!-- <view class="user">
						{{item.username}}
				</view> -->
				<view class="thumbs">
					{{item.likeCount || 0}}人点赞
				</view>
			</view>
		</view>
		<view class="right">
			<u-image width="140rpx" height="140rpx" :src="item.coverUrl" border-radius="16rpx"></u-image>
		</view>
	</view>
</template>

<script>
	export default {
		name: "activity-item-hot",
		data() {
			return {

			};
		},
		props: {
			item: {
				type: Object,
				default: {}
			}
		},
		methods: {
			goToDetail() {
				uni.navigateTo({
					url: `/main/activity/detail/detail?id=${this.item.id}`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.activityItem {
		padding: $gap;
		margin: 24rpx 0;
		background-color: #ffffff;
		border-radius: 24rpx;
		display: flex;
		justify-content: space-between;

		.left {
			width: 450rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
			}

			.desc {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 24rpx;
				color: #999999;
				margin-top: 16rpx;
			}
		}

		.right {
			width: 140rpx;
			height: 140rpx;
		}
	}
</style>