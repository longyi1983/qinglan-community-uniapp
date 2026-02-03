<template>
	<view>
		<block v-for="(item, index) in userList" :key="index">
			<user-info :item="{'isFollow':item.hasFollow,'userInfo':item}"></user-info>
		</block>
		<!-- 加载状态 -->
		<block v-if="loadStatus != 'none'">
			<block v-if="list.length === 0 && loadStatus == 'nomore'"><u-empty margin-top="100" text="暂无用户"
					mode="favor"></u-empty></block>
			<block v-else><u-loadmore margin-bottom="50" margin-top="50" :status="loadStatus" /></block>
		</block>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	import $store from '@/store/index.js';

	export default {
		props: {
			list: Array,
			loadStatus: String
		},
		computed: {
			...mapGetters(['sessionList'])
		},
		data() {
			return {
				$IMG: this.$IMG,
				userList: [],
				customStyle: {
					backgroundColor: 'black',
					color: 'white'
				}
			};
		},
		watch: {
			list() {
				this.userList = this.list;
			}
		},
		methods: {

			follow(index, uid) {
				// 获取当前用户信息
				const currentUser = uni.getStorageSync('userInfo');

				this.$H.post('user/addFollow', {
					id: uid,
					data: {
						senderId: Number(currentUser.uid),
						senderName: currentUser.username,
						senderAvatar: currentUser.avatar,
						receiverId: Number(uid),
						notation: this.userList[index].username,
						applyMessage: "你好,我是" + currentUser.username
					}
				}).then(res => {
					if (res.code == 0) {
						this.userList[index].hasFollow = 2;
					}
				});
			},
			cancelFollow(index, uid) {
				// 获取当前用户信息
				const currentUser = uni.getStorageSync('userInfo');

				this.$H
					.post('user/cancelFollow', {
						id: uid,
						data: {
							senderId: currentUser.uid,
							senderName: currentUser.username,
							senderAvatar: currentUser.avatar,
							receiverId: uid,
							notation: this.userList[index].username,
							applyMessage: "你好,我是" + currentUser.username
						}
					})
					.then(res => {
						if (res.code === 0) {
							this.userList[index].hasFollow = 0;
						}
					});
			},
			gotoChat(user) {
				// 阻止事件冒泡，避免导航到用户主页
				for (let i = 0; i < this.sessionList.length; i++) {
					if (this.sessionList[i].chattingUserId == user.uid) {
						$store.state.chattingUserInfo = this.sessionList[i];
						break;
					}
				}

				// 如果没有找到现有的会话，可以创建一个新的会话信息对象
				if (!$store.state.chattingUserInfo || $store.state.chattingUserInfo.chattingUserId != user.uid) {
					$store.state.chattingUserInfo = {
						name: user.username,
						avatar: user.avatar,
						chattingUserId: user.uid
					};
				}

				this.$H.post('chat/list', {
					sessionId: $store.state.chattingUserInfo.sessionId || '',
					pageNum: 1,
					pageSize: 20
				}).then(res => {
					if (res.code == 0) {
						let data = res.data;
						for (let i = 0; i < $store.state.personMessage.length; i++) {
							if ($store.state.personMessage[i].sessionId == data.sessionId) {
								let current = Number(data.pageInfo.current);
								let total = Number(data.pageInfo.total);
								let size = Number(data.pageInfo.size);
								$store.state.personMessage[i].lastMessageId = data.pageInfo.records
									.length != 0 ? data.pageInfo.records[0].id : 0;
								$store.state.personMessage[i].list = data.pageInfo.records.reverse();
								$store.state.personMessage[i].pageNum = current;
								$store.state.personMessage[i].hasNextPage = current * size < total;
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
	};
</script>

<style lang="scss" scoped>
	.member-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #f5f5f5;
		background-color: #ffffff;

		&:last-child {
			border-bottom: 0;
		}

	}

	.member-item .icon-nv {
		color: #ff4d94;
	}

	.member-item .icon-nan {
		color: #0091ff;
	}

	.member-item .avatar {
		margin-right: 20rpx;
	}

	.member-item .user .name {
		margin-right: 20rpx;
	}

	.member-item .user .iconfont {
		font-size: 12px;
	}

	/* #ifndef MP */
	.member-item .btn-gz {
		margin-right: 20rpx;
	}

	/* #endif */
	/* #ifdef MP */
	.member-item .btn-gz {
		margin-left: auto;
	}

	/* #endif */
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
		padding: 5rpx 10rpx;
	}
</style>