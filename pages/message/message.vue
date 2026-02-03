<template>
	<view>
		<u-subsection v-if="socialOpen" :list="list" :current="pageCurrent" @change="pageTabChange" button-color="#ffffff" active-color="#0a0a0f"></u-subsection>
		<view v-if="pageCurrent == 0">
			<!-- 消息列表 -->
			<view class="message-container">
				<view class="block">
					<view @click="$f.jump('/pages/message/list?type=1')" class="message-line">
						<view class="message-info">
							<view class="message-icon">
								<u-icon name="thumb-up-fill" color="#010101" size="60"></u-icon>
							</view>
							<view class="message-text">
								<view>
									<text>点赞</text>
									<text v-if="msgNum.thumbCount>0">{{msgNum.thumbCount}}</text>
								</view>
								<view v-if="msgNum.thumbCount>0">你有{{msgNum.thumbCount}}条消息未读</view>
								<view v-else>暂无新消息</view>
							</view>
						</view>
						<view class="message-act">
							<u-icon name="arrow-right" color="#2f2f2f" size="36"></u-icon>
						</view>
					</view>

					<view @click="$f.jump('/pages/message/list?type=3')" class="message-line">
						<view class="message-info">
							<view class="message-icon">
								<u-icon name="file-text-fill" color="#010101" size="60"></u-icon>
							</view>
							<view class="message-text">
								<view>
									<text>评论</text>
									<text v-if="msgNum.comment>0">{{msgNum.comment}}</text>
								</view>
								<view v-if="msgNum.comment>0">你有{{msgNum.comment}}条消息未读</view>
								<view v-else>暂无新消息</view>
							</view>
						</view>
						<view class="message-act">
							<u-icon name="arrow-right" color="#2f2f2f" size="36"></u-icon>
						</view>
					</view>
					<view @click="$f.jump('/pages/message/list?type=2')" class="message-line">
						<view class="message-info">
							<view class="message-icon">
								<u-icon name="account-fill" color="#010101" size="60"></u-icon>
							</view>
							<view class="message-text">
								<view>
									<text>粉丝</text>
									<text v-if="msgNum.follow>0">{{msgNum.follow}}</text>
								</view>
								<view v-if="msgNum.follow>0">你有{{msgNum.follow}}条消息未读</view>
								<view v-else>暂无新消息</view>
							</view>
						</view>
						<view class="message-act">
							<u-icon name="arrow-right" color="#2f2f2f" size="36"></u-icon>
						</view>
					</view>
					<u-line color="#4c4c4c" border-style="dotted"></u-line>
					<view @click="goNotice" class="message-line" v-if="socialOpen">
						<view class="message-info">
							<view class="message-icon">
								<u-icon name="plus-people-fill" color="#010101" size="60"></u-icon>
							</view>
							<view class="message-text">
								<view>
									<text>新的朋友</text>
									<text v-if="totalUnread.notice>0">{{totalUnread.notice}}</text>
								</view>
								<view v-if="totalUnread.notice>0">你有{{totalUnread.notice}}条新朋友申请通知未处理</view>
								<view v-else>暂无新消息</view>
							</view>
						</view>
						<view class="message-act">
							<u-icon name="arrow-right" color="#2f2f2f" size="36"></u-icon>
						</view>
					</view>
					<view @click="goSys" class="message-line" @longpress="onPressArticle()">
						<view class="message-info">
							<view class="message-icon">
								<u-icon name="bell-fill" color="#010101" size="60"></u-icon>
							</view>
							<view class="message-text">
								<view>
									<text>系统通知</text>
									<text v-if="msgNum.systemUnreadCount>0">{{msgNum.systemUnreadCount}}</text>
								</view>
								<view v-if="msgNum.systemUnreadCount>0">你有{{msgNum.systemUnreadCount}}条系统通知未读</view>
								<view v-else>暂无新消息</view>
							</view>
						</view>
						<view class="message-act">
							<u-icon name="arrow-right" color="#2f2f2f" size="36"></u-icon>
						</view>
					</view>
					<view @click="goChatList" class="message-line" v-if="socialOpen">
						<view class="message-info">
							<view class="message-icon">
								<u-icon name="chat-fill" color="#010101" size="60"></u-icon>
							</view>
							<view class="message-text">
								<view>
									<text>私信列表</text>
									<text v-if="totalUnread.message>0">{{totalUnread.message}}</text>
								</view>
								<view v-if="totalUnread.message>0">你有{{totalUnread.message}}条私信未读</view>
								<view v-else>暂无新消息</view>
							</view>
						</view>
						<view class="message-act">
							<u-icon name="arrow-right" color="#2f2f2f" size="36"></u-icon>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="pageCurrent == 1">
			<u-index-list :indexList="indexList" :scrollTop="scrollTop">
				<template v-for="(item, index) in friendListShow">
					<view :key="index">
						<u-index-anchor v-if="item.length!==0" :use-slot="true"><text
								class="anchor-text">{{indexList[index]}}</text></u-index-anchor>
						<view class="list" v-for="(item1, index1) in item" :key="index1">
							<view class="list__item" @tap="gotoFriendInfo(item1.id)">
								<image class="list__item__avatar" :src="item1.url"></image>
								<text
									style="margin-left:30rpx;font-size: 36rpx;color: #2c2c2c;font-weight: 520;">{{item1.name}}</text>
								<view style="margin-left: auto;margin-right: 40rpx;" @click.stop="showFriend(item1.id)">
									<u-icon name="more-dot-fill" color="#b3b3b3"></u-icon>
								</view>
							</view>
							<u-line></u-line>
						</view>
					</view>
				</template>
			</u-index-list>
			<block v-if="friendList.length == 0">
				<view class="msg-empty">
					<image class="img" mode="widthFix" src="../static/empty.png"></image>
					<text class="txt">暂无好友哦~</text>
				</view>
			</block>
			<view class="count-desc" v-if="friendList.length > 0">
				<text class="list__footer">共{{friendList.length}}位好友</text>
			</view>
		</view>
		<!-- 删除系统消息弹窗 -->
		<u-action-sheet :list="sheetList" v-model="showSheet" @click="onSheetItem"></u-action-sheet>
		<!-- tabbar -->
		<lf-tabbar :active="3" :count="messegeNum"></lf-tabbar>
		<!-- 发布弹窗 -->
		<u-popup v-model="showPlusPost" mode="center" border-radius="20" width="80%">
			<view class="share-type">
				<view @click="toPost(1)" class="type-item">
					<u-icon class="icon" size="40" name="photo" color="#aaaaff"></u-icon>
					<text>发布帖子</text>
				</view>
				<view @click="toPost(2)" class="type-item" v-if="isOpen==1">
					<u-icon class="icon" size="40" name="play-circle-fill" color="#aa55ff"></u-icon>
					<text>发布视频</text>
				</view>
				<view @click="toPost(4)" class="type-item">
					<u-icon class="icon" size="36" name="order" color="#e34b00"></u-icon>
					<text>发布长文</text>
				</view>
				<view @click="toPost(3)" class="type-item">
					<image class="icon" src="../static/h_1.png"></image>
					<text>发布投票</text>
				</view>
			</view>
		</u-popup>
		<!-- 弹窗 -->
		<u-popup v-model="showFriendPop" mode="center" border-radius="20" width="80%">
			<view class="share-type">
				<view @click="gotoChat" class="type-item">
					<u-icon class="icon" size="40" name="email-fill"></u-icon>
					<text>发送私信</text>
				</view>
				<view @click="doDeleteFriend" class="type-item">
					<u-icon class="icon" size="40" name="trash-fill"></u-icon>
					<text>删除好友</text>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	const indexList = () => {
		const indexList = []
		const charCodeOfA = 'A'.charCodeAt(0)
		indexList.push("↑")
		indexList.push("☆")
		for (let i = 0; i < 26; i++) {
			indexList.push(String.fromCharCode(charCodeOfA + i))
		}
		indexList.push('#')
		return indexList
	}
	import uIndexList from '@/uview-ui/components/u-index-list/u-index-list.vue';
	import {
		mapGetters
	} from 'vuex';
	import $store from '@/store/index.js';
	import websocket from '@/utils/websocket.js';
	export default {
		data() {
			return {
				isOpen: getApp().globalData.isOpen,
				showPlusPost: false,
				showSheet: false,
				showChatSheet: false,
				sheetList: [{
					text: '删除',
					color: 'red'
				}],
				msgNum: {
					thumbCount: 0,
					follow: 0,
					comment: 0,
					systemUnreadCount: 0,
					articleMsgList: [],
					chatMsgList: [],
				},
				checkedMsgId: '',
				checkedIndex: '',
				checkedMsgUid: '',
				adminInfo: {
					username: '系统通知',
					avatar: 'https://demo.linfeng.tech/resource/images/sys.png',
					uid: 1
				},
				pageTab: [{
						name: '消息'
					},
					{
						name: '好友'
					}
				],
				pageCurrent: 0,
				indexList: indexList(),
				scrollTop: 0,
				showFriendPop: false,
				currentFriendId: '',
				selectUser: {},
				socialOpen: false,
				list: [{
						name: '消息'
					},
					{
						name: '好友'
					}
				]
			};
		},
		components: {
			uIndexList: uIndexList
		},
		computed: {
			...mapGetters(['loginUserInfo', 'isSocketOpen', 'friendListShow', 'friendList', 'totalUnread', 'messegeNum',
				'sessionList'
			])
		},
		onLoad() {
			this.checkOpen();
			
			// if (!$store.state.isSocketOpen && uni.getStorageSync('hasLogin')) {
			// 	websocket.initConnect()
			// }
		},
		onShow() {
			if (uni.getStorageSync('userInfo').uid) {
				this.getMsgNum();
			}
			//重新获取连接websocket
			if (!$store.state.isSocketOpen && uni.getStorageSync('hasLogin')) {
				// websocket.initConnect()
				// $store.dispatch('getFriendList')
				// $store.dispatch('getNoticeList')
				console.log('message.vue: WebSocket未连接，等待App.vue中的连接');
			}
		},
		onPullDownRefresh() {
			this.getMsgNum();
			uni.stopPullDownRefresh();
		},
		methods: {
			//查询好友聊天模块是否开启
			checkOpen() {
				this.$H.get('system/socialOpen').then(res => {
					if (res.code == 0) {
						this.socialOpen = res.result;
						// this.socialOpen = false
						
					}
				});
			},
			pageTabChange(index) {
				this.pageCurrent = index
			},
			goSys() {
				if (uni.getStorageSync('hasLogin')) {
					this.$f.jump('/pages/system/system')
				} else {
					this.$f.toast('请先登录哦')
				}
			},
			goChatList() {
				if (uni.getStorageSync('hasLogin')) {
					this.$f.jump('/pages/im/chat-list/chat-list')
				} else {
					this.$f.toast('请先登录哦')
				}
			},
			goNotice() {
				if (uni.getStorageSync('hasLogin')) {
					this.$f.jump('/pages/im/notice-list/notice-list')
				} else {
					this.$f.toast('请先登录哦')
				}
			},
			// 更新阅读状态
			articleMsgState(id) {
				this.$H.post('message/articleMsgState', {
					id: id
				});
			},
			// 长按图文消息
			onPressArticle() {
				this.showSheet = true;
			},
			// 删除系统消息
			onSheetItem(index) {
				if (index == 0) {
					this.$H
						.post('message/delSystemMsg').then(res => {
							if (res.code == 0) {
								this.msgNum.systemUnreadCount = 0
							}
						});
				}
			},

			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + this.$store.state.totalUnread.notice + res
						.result.allCount
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
				});
			},
			gotoFriendInfo(id) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + id
				})
			},
			onPageScroll(e) {
				this.scrollTop = e.scrollTop;
			},
			toPlus() {
				this.showPlusPost = true;
			},
			toPost(i) {
				this.showPlusPost = false;
				if (i == 3) {
					this.$f.jump('/pages/vote/vote')
				} else if (i == 4) {
					this.$f.jump('/subpages/content/article/add')
				} else {
					this.$f.jump('/pages/post/add?type=' + i)
				}
			},
			showFriend(uid) {
				this.showFriendPop = true
				this.currentFriendId = uid
				this.$H.post('user/userInfoById', {
					uid: uid
				}).then(res => {
					this.selectUser = res.result;
				})
			},
			doDeleteFriend() {
				if (!uni.getStorageSync('hasLogin')) {
					this.$f.toast('请先登录哦')
					return
				}
				this.showFriendPop = false
				var that = this;
				uni.showModal({
					title: '提示',
					content: '确定删除该好友吗？',
					success: function(res) {
						if (res.confirm) {
							that.$H.post('friend/deleteFriend', {
								id: that.currentFriendId
							}).then(res => {
								if (res.code == 0) {
									this.showFriendPop = false
									that.$f.toast("操作成功")
									//获取好友列表
									$store.dispatch('getFriendList');
								}
							});
						} else if (res.cancel) {

						}
					}
				});
			},
			//跳转聊天页面
			gotoChat() {
				if (!uni.getStorageSync('hasLogin')) {
					this.$f.toast('请先登录哦')
					return
				}
				for (let i = 0; i < this.sessionList.length; i++) {
					if (this.sessionList[i].chattingUserId == this.selectUser.uid) {
						$store.state.chattingUserInfo = this.sessionList[i]
						break;
					}
				}
				this.$H.post('chat/list', {
					sessionId: $store.state.chattingUserInfo.sessionId,
					pageNum: 1,
					pageSize: 20
				}).then(res => {
					if (res.code == 0) {
						let data = res.data
						for (let i = 0; i < $store.state.personMessage.length; i++) {
							if ($store.state.personMessage[i].sessionId == data.sessionId) {
								let current = Number(data.pageInfo.current)
								let total = Number(data.pageInfo.total)
								let size = Number(data.pageInfo.size)
								$store.state.personMessage[i].lastMessageId = data.pageInfo.records
									.length != 0 ? data.pageInfo.records[0].id : 0
								$store.state.personMessage[i].list = data.pageInfo.records.reverse()
								$store.state.personMessage[i].pageNum = current
								$store.state.personMessage[i].hasNextPage = current * size < total
								break;
							}
						}
						this.showFriendPop = false
						uni.navigateTo({
							url: '/pages/im/chat/chat'
						})
					} else {
						uni.showToast({
							icon: 'none',
							mask: '消息加载失败'
						})
					}
				})
			},
		}
	};
</script>

<style lang="scss" scoped>
	@import url('@/static/css/navigate-bar.css');

	.msg-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 800rpx;

		.img {
			width: 200rpx;
			margin-top: 100rpx;
		}

		.txt {
			color: #999;
			font-size: 20rpx;
			margin-top: 20rpx;
		}
	}

	.list-cell {
		display: flex;
		box-sizing: border-box;
		width: 100%;
		padding: 10px 24rpx;
		overflow: hidden;
		color: #323233;
		font-size: 14px;
		line-height: 24px;
		background-color: #fff;
	}

	.list__item:active {
		background-color: #e8e8e8;
	}

	.list {

		&__item {
			// @include flex;
			padding: 10px 16px;
			align-items: center;
			display: flex;

			&__avatar {
				height: 45px;
				width: 45px;
				border-radius: 5px;
			}
		}

		&__footer {
			color: $u-tips-color;
			font-size: 14px;
			text-align: center;
			margin: 15px 0;
		}
	}

	.count-desc {
		height: 150rpx;
		text-align: center;
	}

	.search-wrap {
		// margin-left: 20rpx;
		margin-right: 27%;
	}

	.message-container {
		padding: 0 20rpx;
	}

	.message-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 0px;
		border-bottom: 1rpx solid #EEEEEE;
	}

	.message-line:last-of-type {
		border: none;
	}

	.message-info {
		display: flex;
		align-items: center;
	}

	.message-icon {
		height: 104rpx;
		line-height: 104rpx;
		text-align: center;
		width: 104rpx;
		border-radius: 50%;
		background: #f5f5f5;
	}

	.message-text {
		padding-left: 20rpx;
	}

	.message-text view:nth-child(1) {
		display: flex;
		align-items: center;
	}

	.message-text view:nth-child(1) text:nth-child(1) {
		font-size: 32rpx;
		font-weight: 600;
	}

	.message-text view:nth-child(1) text:nth-child(2) {
		font-size: 20rpx;
		font-weight: 300;
		color: #FFFFFF;
		height: 36rpx;
		line-height: 36rpx;
		border-radius: 18rpx;
		padding: 0 12rpx;
		background: #f34d15;
		margin-left: 12rpx;
	}

	.message-text view:nth-child(2) {
		font-size: 28rpx;
		font-weight: 400;
		color: #666666;
	}

	.share-type {
		padding: 50rpx 30rpx;

		.type-item {
			background-color: #F5F5F5;
			padding: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			.icon {
				width: 40rpx;
				height: 40rpx;
				margin-right: 20rpx;
			}

			&:nth-child(2) {
				margin: 20rpx 0;
			}

			&:nth-child(3) {
				margin: 20rpx 0;
			}
		}
	}
</style>