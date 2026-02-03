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
							{{item.username}}
						</text>
						<text class="level">
							LV.{{item.level}}
						</text>
					</view>
				</view>
			</view>
			<!-- 关注 -->
			<view class="coin">
				<u-image src="@/static/my/coin.png" width="44rpx" height="44rpx"></u-image>
				{{item.balanceCount}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "topic-item",
		data() {
			return {
				isFollow: false
			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
		},
		computed: {
			isCurrentUser() {
				return this.$store.state.loginUserInfo.uid == this.item.userInfo.uid;
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
						console.log('事件发送: updateIsFollow', {uid: this.item.userInfo.uid, isFollow: true});
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
						console.log('事件发送: updateUserFollow', {uid: this.item.userInfo.uid, isFollow: false});
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
						font-size: 24rpx;
						color: #1B1B26;
						line-height: 24rpx;
						text-align: left;
						font-style: normal;
						margin-right: 23rpx;
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
				}

				.tag {
					font-size: 20rpx;
					color: #999;
				}
			}
		}

		.coin{
			display: flex;
			align-items: center;
			gap:10rpx;
			color:#95959D;
			font-size: 24rpx;
		}
	}
</style>