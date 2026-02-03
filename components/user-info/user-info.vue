<template>
	<view class="userBox" @click.stop="goDetail">
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
						<view class="unread-dot" v-if="status == 0 && message"></view>
					</view>
					<view class="tag">
						{{item.userInfo.intro}}
					</view>
				</view>
			</view>
			<!-- 关注 -->
			<view class="alreadyFollow" v-if="isFollow && !isCurrentUser && !message" @click.stop="cancelFollow">
				已关注
			</view>
			<view class="follow" v-else-if="!isCurrentUser && !isFollow" @click.stop="follow">
				关注
			</view>
			<view class="follow" v-else-if="!isCurrentUser && message" @click.stop="gotoChat">
				发私信
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
			message: {
				type: Boolean,
				default: false
			}
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
					this.status = newVal.status;
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			follow() {
				this.setRead();
				
				// 获取当前用户信息
				const currentUser = uni.getStorageSync('userInfo');

				this.$H.post('user/addFollow', {
					id: this.item.userInfo.uid,
					data: {
						senderId: Number(currentUser.uid),
						senderName: currentUser.username,
						senderAvatar: currentUser.avatar,
						receiverId: Number(this.item.userInfo.uid),
						notation: this.item.userInfo.username,
						applyMessage: "你好,我是" + currentUser.username
					}
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
			setRead() {
				// 如果是消息页面，调用已读接口
				if (this.message && this.item.mid) {
					this.$H.post('message/readMessage', {
						mid: this.item.mid
					}).then(res => {
						this.status = 1;
					});
				}
			},
			cancelFollow() {
				// 获取当前用户信息
				const currentUser = uni.getStorageSync('userInfo');

				this.$H.post('user/cancelFollow', {
					id: this.item.userInfo.uid,
					data: {
						senderId: Number(currentUser.uid),
						senderName: currentUser.username,
						senderAvatar: currentUser.avatar,
						receiverId: Number(this.item.userInfo.uid),
						notation: this.item.userInfo.username,
						applyMessage: "你好,我是" + currentUser.username
					}
				}).then(res => {
					if (res.code === 0) {
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
				this.status = 1;
				uni.navigateTo({
					url: '/pages/user/home?uid=' + this.item.userInfo.uid
				})
			},
			gotoChat() {
				this.setRead();

				// 阻止事件冒泡，避免导航到用户主页
				for (let i = 0; i < this.$store.state.sessionList.length; i++) {
					if (this.$store.state.sessionList[i].chattingUserId == this.item.userInfo.uid) {
						this.$store.state.chattingUserInfo = this.$store.state.sessionList[i];
						break;
					}
				}

				// 如果没有找到现有的会话，可以创建一个新的会话信息对象
				if (!this.$store.state.chattingUserInfo || this.$store.state.chattingUserInfo.chattingUserId != this.item
					.userInfo.uid) {
					this.$store.state.chattingUserInfo = {
						name: this.item.userInfo.username,
						avatar: this.item.userInfo.avatar,
						chattingUserId: this.item.userInfo.uid
					};
				}

				this.$H.post('chat/list', {
					sessionId: this.$store.state.chattingUserInfo.sessionId || '',
					pageNum: 1,
					pageSize: 20
				}).then(res => {
					if (res.code == 0) {
						let data = res.data;
						for (let i = 0; i < this.$store.state.personMessage.length; i++) {
							if (this.$store.state.personMessage[i].sessionId == data.sessionId) {
								let current = Number(data.pageInfo.current);
								let total = Number(data.pageInfo.total);
								let size = Number(data.pageInfo.size);
								this.$store.state.personMessage[i].lastMessageId = data.pageInfo.records
									.length != 0 ? data.pageInfo.records[0].id : 0;
								this.$store.state.personMessage[i].list = data.pageInfo.records.reverse();
								this.$store.state.personMessage[i].pageNum = current;
								this.$store.state.personMessage[i].hasNextPage = current * size < total;
								break;
							}
						}
						uni.navigateTo({
							url: '/pages/im/chat/chat'
						});
					} else {
						uni.showToast({
							icon: 'none',
							title: '消息加载失败'
						});
					}
				});
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
					font-size: 20rpx;
					color: #999;
				}
			}
		}

		.follow {
			width: 120rpx;
			height: 52rpx;
			line-height: 52rpx;
			background: #F0F3FF;
			border-radius: 8rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #6986FD;
			text-align: center;
			font-style: normal;
		}

		.alreadyFollow {
			width: 120rpx;
			height: 52rpx;
			line-height: 52rpx;
			border-radius: 8rpx;
			border: 1rpx solid #BFBFC6;
			font-weight: 400;
			font-size: 24rpx;
			color: #BFBFC6;
			text-align: center;
			transform:rotateZ(360deg);
		}
	}
</style>