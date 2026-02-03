<template>
	<view class="list" v-if="list.length > 0">
		<navigator :url="'/subpages/content/article/article?id=' + item.id" class="item" v-for="(item, index) in list" :key="index" hover-class="none">
			<view class="info">
				<view class="text">
					<view class="title">{{ item.title }}</view>
					<view class="other">
						<view class="left" @click.stop="jumpUser(item.userInfo.uid)">
							<view class="nickname" v-if="item.userInfo.username">{{ item.userInfo.username }}</view>
							<view class="time">{{ item.createTime | timeFormat }}</view>
						</view>
						
						<view class="right view">
							<image src="/static/images/view.png"></image>
							<text>{{ item.readCount }}</text>
						</view>
					</view>
				</view>
				<view class="photo"><image :src="item.media[0]" mode="aspectFill"></image></view>
			</view>
			<view class="line"></view>
		</navigator>
	</view>
</template>

<script>
export default {
	name: 'articleList',
	props: {
		list: {
			type: Array,
			default: function(e) {
				return [];
			}
		}
	},
	methods: {
		jumpUser(uid) {
			uni.navigateTo({
				url: '/pages/user/home?uid=' + uid
			});
		}
	}
};
</script>

<style lang="scss">
.list {
	margin-top: 2rpx;
	.item {
		padding: 40rpx 24rpx 0 24rpx;
		.info {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			padding-bottom: 4rpx;
			.text {
				flex-grow: 1;
				flex-shrink: 1;
				display: flex;
				flex-direction: column;
				margin-right: 40rpx;
				.title {
					flex-grow: 1;
					flex-shrink: 1;
					font-size: 34rpx;
					line-height: 1.5;
					display: -webkit-box;
					text-overflow: ellipsis;
					word-break: break-all;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
					height: 72rpx;
					margin-bottom: 8rpx;
				}
				.other {
					flex-grow: 1;
					flex-shrink: 1;
					display: flex;
					align-items: center;
					font-size: 28rpx;
					color: #999;
					line-height: normal;
					.left {
						display: flex;
						flex-grow: 1;
						flex-shrink: 1;
						.nickname {
							display: -webkit-box;
							text-overflow: ellipsis;
							word-break: break-all;
							-webkit-line-clamp: 1;
							-webkit-box-orient: vertical;
							overflow: hidden;
							width: 220rpx;
							margin-right: 36rpx;
						}
					}
					.right {
						display: flex;
						flex-direction: row;
						justify-content: center;
						align-items: center;
						flex-grow: 0;
						flex-shrink: 0;
						margin-right: 5rpx;
						image {
							flex-grow: 1;
							flex-shrink: 1;
							width: 28rpx;
							height: 28rpx;
							margin-right: 12rpx;
						}
						text {
							flex-grow: 1;
							flex-shrink: 1;
							margin-top: -6rpx;
						}
					}
					.view {
						image {
							width: 40rpx;
							height: 40rpx;
							margin-right: 5rpx;
						}
					}
				}
			}
			.photo {
				image {
					height: 170rpx;
					width: 222rpx;
					border-radius: 10rpx;
				}
			}
		}
		.line {
			display: bock;
			width: 100%;
			height: 1rpx;
			margin-top: 22rpx;
			background: #e8e8e8;
		}
		&:last-child {
			.line {
				//display: none;
			}
			//padding-bottom: 30rpx;
		}
	}
}
</style>
