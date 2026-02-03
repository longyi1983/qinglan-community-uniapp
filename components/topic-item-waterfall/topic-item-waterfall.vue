<template>
	<view class="content" @click="jump">
		<view class="img">
			<u-image width="100%" height="380rpx" :src="item.media[0]" mode="aspectFill"></u-image>
		</view>
		<view class="title">
			{{item.title}}
		</view>
		<view class="user">
			<view class="left">
				<view class="avatar">
					<u-avatar :src="item.userInfo.avatar" :size="32"></u-avatar>
				</view>
				<text>{{item.userInfo.username}}</text>
			</view>
			<view class="right" @click.stop="handleLike">
				<image src="@/static/community/like-active.png" v-if="localCollection"></image>
				<image src="@/static/community/like.png" v-else></image>
				<text>{{localCollectionCount}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "topic-item",
		data() {
			return {
				localCollection: false,
				localCollectionCount: 0
			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
		},
		watch: {
			'item': {
				immediate: true,
				handler(newVal) {
					console.log('topic-item-waterfall监听到item变化1', newVal);
					this.localCollection = newVal.isCollection;
						this.localCollectionCount = newVal.collectionCount;
					if (newVal) {

						this.localCollection = newVal.isCollection;
						this.localCollectionCount = newVal.collectionCount;
						
					console.log('topic-item-waterfall监听到item变化2', newVal,this.localCollectionCount);
					}
				},
				deep: true
			}
		},
		methods: {
			jump() {
				uni.navigateTo({
					url: '/pages/post/detail?id=' + this.item.id
				})
			},
			handleLike() {
				if (this.localCollection) {
					this.cancelCollection();
				} else {
					this.addCollection();
				}
			},
			cancelCollection() {
				this.$H
					.post('post/cancelCollection', {
						id: this.item.id
					})
					.then(res => {
						if (res.code === 0) {
							this.localCollection = false;
							this.localCollectionCount--;
						}
					});
			},
			addCollection() {
				this.$H
					.post('post/addCollection', {
						id: this.item.id,
						uid: this.item.uid
					})
					.then(res => {
						if (res.code === 0) {
							this.localCollection = true;
							this.localCollectionCount++;
						}
					});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		width: 333rpx;
		height: 564rpx;
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 0;

		.title {
			width: 301rpx;
			height: 80rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 500;
			font-size: 28rpx;
			color: #3F3F50;
			line-height: 40rpx;
			text-align: left;
			font-style: normal;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			margin: 0 16rpx;
			margin-top: 16rpx;
		}

		.img {
			width: 333rpx;
			height: 380rpx;
			border-radius: 16rpx 16rpx 0 0;
			overflow: hidden;
			margin-bottom: 24rpx;
		}

		.user {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 24rpx 20rpx 16rpx;

			.left {
				display: flex;
				align-items: center;
				height: 32rpx;
				line-height: 32rpx;

				.avatar {
					height: 32rpx;
					line-height: 32rpx;
				}

				text {
					width: 150rpx;
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					color: #8A8A99;
					margin-left: 8rpx;
				}
			}

			.right {
				display: flex;
				align-items: center;

				image {
					width: 32rpx;
					height: 32rpx;
				}

				text {
					font-size: 24rpx;
					color: #8A8A99;
					margin-left: 8rpx;
				}
			}
		}
	}
</style>