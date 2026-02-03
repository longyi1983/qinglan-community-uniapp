<template>
	<view class="scale-item" @click="goDetail">
		<view class="left">
			<view class="title">
				{{item.scaleName}}
			</view>
			<view class="desc">
				<view class="test" v-if="!history">
					{{item.resultCount}}人已测
				</view>
				<view class="test" v-else>
					{{item.responseTime}}
				</view>
				<view v-if="!history">
					<view class="price" v-if="item && item.isCharge == 0">限免</view>
					<view class="price pay" v-else>¥{{ amountDisplay }}</view>
				</view>
				<!-- <view class="thumbs">
					23人点赞
				</view> -->
			</view>
		</view>
		<view class="right">
			<u-image :src="item.imgUrl" width="140rpx" height="140rpx" borderRadius="16rpx"></u-image>
		</view>
	</view>
</template>

<script>
	export default {
		name: "history-scale-item",
		data() {
			return {

			};
		},
		props: {
			item: {
				type: Object,
				default: () => {
					return {}
				}
			},
			history: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			amountDisplay() {
				const n = Number(this.item && this.item.amount || 0)
				return isNaN(n) ? '0.00' : n.toFixed(2)
			}
		},
		methods: {
			goDetail() {
				if (this.history) {
					uni.navigateTo({
						url: "/scale/result/result?id=" + this.item.id + "&history=true"
					})
				} else {
					uni.navigateTo({
						url: "/scale/detail/detail?id=" + this.item.id
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.scale-item {
		width: 686rpx;
		height: 202rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		box-sizing: border-box;
		padding: $gap;
		margin-bottom: 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.left {
			padding-right: $gap;

			.title {
				font-size: 28rpx;
				font-weight: bold;
				color: #1B1B26;
				margin-bottom: 16rpx;
				// 显示两行字数
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.desc {
				width: 440rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.test {
					font-size: 24rpx;
					font-weight: 400;
					color: #95959D;
					margin-right: 24rpx;
				}

				.price {
					font-size: 24rpx;
					color: #51A28B;

					&.pay {
						color: #FF7A45;
					}
				}

				.thumbs {
					font-size: 24rpx;
					font-weight: 400;
					color: #95959D;
				}
			}
		}

		.right {
			width: 140rpx;
			height: 140rpx;
		}
	}
</style>