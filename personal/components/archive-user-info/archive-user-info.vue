<template>
	<view class="userBox">
		<view class="header">
			<!-- 用户信息 -->
			<view class="user">
				<!-- 头像 -->
				<view class="avatar">
					<u-avatar :src="item.userInfo.avatar" :size="80"></u-avatar>
				</view>
				<!-- 昵称 -->
				<view class="ifo">
					<view class="nickname">
						<text class="name">
							{{item.userInfo.username}}
						</text>
						<text class="level">
							LV.{{item.userInfo.level}}
						</text>

						<view class="archive" :class="{'no-archive': !archiveBagName}" @click="change">
							{{archiveBagName || '点击新建档案'}}
							<u-icon name="arrow-right"></u-icon>
						</view>
					</view>
					<view class="tag" v-if="label">
						<!-- {{item.userInfo.intro}} -->
						{{label}}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "topic-item",
		data() {
			return {
				isFollow: false,
				status: 0
			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			archiveBagName: {
				type: String,
				default: () => ("")
			},
			label: {
				type: String,
				default: () => ("")
			}
		},
		methods: {
			change() {
				// 如果没有档案名称，则跳转到新建档案页面
				if (!this.archiveBagName || this.archiveBagName.trim() === '') {
					uni.navigateTo({
						url: '/personal/archive/edit/edit'
					});
				} else {
					// 有档案名称，触发选择档案事件
					this.$emit('change')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.userBox {
		margin: 0;
		padding: 0;

		&>view {
			margin-top: 20rpx;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.user {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.ifo {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: flex-start;
				gap: 10rpx;

				.nickname {
					display: flex;
					align-items: center;
					position: relative;

					.name {
						font-weight: 600;
						font-size: 24rpx;
						color: #1B1B26;
						line-height: 24rpx;
						text-align: left;
						font-style: normal;
						margin-right: 23rpx;
						max-width: 100rpx;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}

					.level {
						width: 44rpx;
						height: 24rpx;
						background: linear-gradient(172deg, #FFEBB6 0%, #FFC449 100%);
						border-radius: 4rpx;
						font-weight: 600;
						font-size: 16rpx;
						color: #946400;
						line-height: 24rpx;
						text-align: center;
					}

					.unread-dot {
						width: 12rpx;
						height: 12rpx;
						background-color: #ff0000;
						border-radius: 50%;
						border: 2rpx solid #ffffff;
						margin-left: 20rpx;
					}
				}

				.tag {
					width: 86rpx;
					height: 44rpx;
					background: #FFFFFF;
					border-radius: 8rpx;
					font-size: 22rpx;
					line-height: 44rpx;
					text-align: center;
					color: #6986FD;
				}
			}
		}

		.archive {
			font-size: 24rpx;
			color: #6976FD;
			line-height: 32rpx;
			width: 400rpx;
			text-align: right;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			margin-left: 20rpx;
		}
	}
</style>