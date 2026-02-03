<template>
	<view class="activity-item" @click.stop="goDetail">
		<view class="header">
			<!-- 活动信息 -->
			<view class="activity">
				<!-- 封面 -->
				<view class="img">
					<u-image :src="item.coverUrl" width="180rpx" height="124rpx" border-radius="10rpx"></u-image>
				</view>
				<!-- 活动 -->
				<view class="ifo">
					<view class="activity-name">
						<text class="name">
							{{ item.title }}
						</text>
					</view>
					<view class="progress">
						{{item.enrollCount}} / {{item.userCount}}
					</view>
				</view>
			</view>
			<!-- 展开和关闭 -->
			<view class="open" @click="getList">
				<u-icon name="arrow-down" size="24" color="#95959D" v-if="!isOpen"></u-icon>
				<u-icon name="arrow-up" size="24" color="#95959D" v-else></u-icon>
			</view>
		</view>
		<!-- 展开的内容 -->
		<view class="content" v-if="isOpen">
			<view class="loaidng" v-if="isLoading">
				<u-loading mode="circle"></u-loading>
			</view>
			<view class="item" v-for="item in list" v-else>
				<view class="avatar">
					<u-avatar :src="item.avatar" size="100"></u-avatar>
				</view>
				<view class="info">
					<view class="nickname">
						{{item.username}}
					</view>
					<view class="enroll">
						{{ item.isEnroll ? '已报名' : '未报名' }}
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
				isOpen: false,
				list: [],
				isLoading: false,
			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
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
			getList() {
				this.isOpen = !this.isOpen;
				if (this.isOpen) {
					this.isLoading = false;
					this.$H.get('userCoin/meActivity/detail', {
						pageNum: 1,
						pageSize: 9999,
						id:this.item.id
					})
					.then(res => {
						this.list = res.rows;
					}).finally(() => {
						// this.isLoading = false;
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.activity-item {
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

		.activity {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.ifo {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: flex-start;
				gap: 10rpx;

				.activity-name {
					display: flex;
					align-items: center;
					width: 90%;
					.name {
						font-weight: 600;
						font-size: 32rpx;
						color: #1B1B26;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						overflow: hidden;
						text-overflow: ellipsis;
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
		.loaidng {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 40rpx;
		}
		.item {
			display: flex;
			align-items: center;
			margin-top: 40rpx;

			.avatar {
				width: 180rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.info {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: flex-start;
				.nickname {
					font-weight: 600;
					font-size: 32rpx;
					color: #1B1B26;
				}
				.enroll {
					font-weight: 400;
					font-size: 24rpx;
					color: #6986FD;
				}
			}
		}
	}
</style>