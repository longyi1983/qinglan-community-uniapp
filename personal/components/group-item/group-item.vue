<template>
	<view class="userBox" @click.stop="goDetail">
		<view class="header">
			<!-- 用户信息 -->
			<view class="user">
				<!-- 头像 -->
				<view class="avatar">
					<u-avatar :src="item.avatar" :size="80"></u-avatar>
				</view>
				<!-- 昵称 -->
				<view class="ifo">
					<view class="nickname">
						<text class="name">
							{{ item.username }}
						</text>
					</view>
					<view class="progress">
						<view>
							<u-line-progress :percent="progress" :height="12" active-color="#6986FD"
								inactive-color="#E7ECFF" :show-percent="false"></u-line-progress>
						</view>
						<text>{{ progress }}%</text>
					</view>
				</view>
			</view>
			<!-- 展开和关闭 -->
			<view class="open" @click="isOpen = !isOpen">
				<u-icon name="arrow-down" size="24" color="#95959D" v-if="!isOpen"></u-icon>
				<u-icon name="arrow-up" size="24" color="#95959D" v-else></u-icon>
			</view>
		</view>
		<!-- 展开的内容 -->
		<view class="content" v-if="isOpen">
			<view class="item" v-for="item in item.taskRewardsMap.dayTask">
				<view class="left">
					<view class="title">
						<text>{{ item.award }}</text>
					</view>
					<view class="progress">
						<u-line-progress :percent="Math.min(item.completeNumUser / item.completeNum * 100, 100)" :height="12"
							active-color="#6986FD" inactive-color="#E7ECFF" :show-percent="false"></u-line-progress>
						<text>{{ Math.min(item.completeNumUser/ item.completeNum * 100, 100) }}%</text>
					</view>
				</view>
				<view class="right">
					已完成{{item.completeNumUser}}，
					<text v-if="item.isComplete">已全部完成</text>
					<text v-else>未完成{{(item.completeNum - item.completeNumUser)}}</text>
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
				isOpen: false,
			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
		},
		computed: {
			progress() {
				if (!this.item.taskRewardsMap?.dayTask?.length) return 0;
				const completedTasks = this.item.taskRewardsMap.dayTask.filter(task => task.isComplete).length;
				return Math.round((completedTasks / this.item.taskRewardsMap.dayTask.length) * 100);
			}
		},
		watch: {
			item: {
				handler(newVal) {
					this.isFollow = newVal.isFollow;
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			follow() {
				this.$H.post('user/addFollow', {
					id: this.item.userInfo.uid
				}).then(res => {
					if (res.code == 0) {
						this.isFollow = true;
						// 发送关注状态改变事件
						uni.$emit('updateUserFollow', {
							uid: this.item.userInfo.uid,
							isFollow: true
						});
						console.log('事件发送: updateIsFollow', {
							uid: this.item.userInfo.uid,
							isFollow: true
						});
					} else {
						this.$u.toast(res.msg);
					}
				})
			},
			cancelFollow() {
				this.$H.post('user/cancelFollow', {
					id: this.item.userInfo.uid
				}).then(res => {
					if (res.code == 0) {
						this.isFollow = false;
						// 发送取消关注状态改变事件
						uni.$emit('updateUserFollow', {
							uid: this.item.userInfo.uid,
							isFollow: false
						});
						console.log('事件发送: updateUserFollow', {
							uid: this.item.userInfo.uid,
							isFollow: false
						});
					}
				})
			},
			goDetail() {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + this.item.userInfo.uid
				})
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

					.name {
						font-weight: 600;
						font-size: 32rpx;
						color: #1B1B26;
					}
				}

				.progress {
					width: 400rpx;
					display: flex;
					align-items: center;
					gap: 10rpx;
					font-weight: 400;
					font-size: 24rpx;
					color: #6986FD;

					view {
						width: 100rpx;
					}
				}
			}
		}

		.open {
			display: flex;
			align-items: center;
			gap: 10rpx;
			color: #95959D;
			font-size: 24rpx;
		}
	}

	.content {
		margin-left: 100rpx;

		.item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 40rpx;

			.left {
				.title {
					font-weight: 600;
					font-size: 32rpx;
					color: #1B1B26;
				}

				.progress {
					width: 300rpx;
					display: flex;
					align-items: center;
					gap: 10rpx;
					font-weight: 400;
					font-size: 24rpx;
					color: #6986FD;

					view {
						width: 100rpx;
					}
				}
			}

			.right {
				font-weight: 400;
				font-size: 24rpx;
				color: #6986FD;
			}
		}
	}
</style>