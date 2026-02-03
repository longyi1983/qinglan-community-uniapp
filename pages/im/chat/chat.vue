<template>
	<view>
		<view>
			<messageBox ref="messageBox"></messageBox>
		</view>

		<view>
			<inputBox @sendMessage="handleMessage" @bottomHeight="handleBottomHeight"
				@keyboradHeight="handleKeyboradHeight" ref="inputBox"></inputBox>
		</view>

	</view>
</template>

<script>
	import timeUtil from '@/utils/timeUtil.js';
	import inputBox from '@/components/inputBox/inputBox.vue';
	import {
		mapActions,
		mapGetters
	} from 'vuex';
	import $store from '@/store/index.js';
	import websocket from '@/utils/websocket.js';
	export default {
		components: {
			inputBox: inputBox
		},
		data() {
			return {
				emoji: '',
				index: 0,
			}
		},
		onUnload() {
			$store.state.chattingUserInfo = null
		},
		computed: {
			...mapGetters(['loginUserInfo', 'chattingUserInfo', 'personMessage', 'onlineArray'])
		},
		onNavigationBarButtonTap(e) {
			if (e.index === 0) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + $store.state.chattingUserInfo.chattingUserId
				})
			}
		},
		watch: {
			onlineArray() {
				this.showOnline()
			}
		},
		onPageScroll(h) {
			if (h.scrollTop == 0) {
				this.$refs.messageBox.getHistoryMsg()
			}
		},
		onLoad() {
			if (this.chattingUserInfo == null) {
				uni.switchTab({
					url: '/pages/index/index'
				})
				return
			}
			//重新获取连接websocket
			// if (!$store.state.isSocketOpen) {
			// 	websocket.initConnect()
			// } else {
			// 	console.log('本人正常在线')
			// }
			///清空消息未读
			this.clearUnread()
			this.showOnline()
		},
		onShow() {
			// #ifndef APP
			// if (!$store.state.isSocketOpen) {
			// 	websocket.initConnect()
			// } else {
			// 	console.log('连线正常')
			// }
			// #endif
			//处理偶尔取不到值得问题
			if(!this.loginUserInfo.uid){
				this.getUserInfo()
			}
		},
		methods: {
			showOnline() {
				let tip = this.onlineArray.indexOf(this.chattingUserInfo.chattingUserId) === -1 ? '离线' : '在线'
				uni.setNavigationBarTitle({
					title: this.chattingUserInfo.name + '(' + tip + ')'
				})
			},

			clearUnread() {
				this.$H.post('chat/clearUnread', {
					myId: this.loginUserInfo.uid,
					friendId: this.chattingUserInfo.chattingUserId
				}).then(res => {
					if (res.code == 0) {
						for (let i = 0; i < $store.state.sessionList.length; i++) {
							if ($store.state.sessionList[i].sessionId == this.chattingUserInfo.sessionId) {
								$store.state.sessionList[i].unread = 0
								break
							}
						}
						$store.dispatch('countUnreadMessage')
					}
				})
			},
			handleMessage(message) {
				let m = {
					senderId: this.loginUserInfo.uid,
					receiverId: this.chattingUserInfo.chattingUserId,
					sendTime: message.time,
					content: message.content,
					messageType: message.type,
					sessionId: this.chattingUserInfo.sessionId
				}
				let msg = {
					type: 'person-message',
					data: m
				}
				let _this = this
				uni.sendSocketMessage({
					data: JSON.stringify(msg),
					fail() {
						uni.closeSocket()
						websocket.initConnect()
						setTimeout(function() {
							_this.retrySend(message);
						}, 1500);
					},
					success() {
						
					}
				})
			},
			//尝试重新发送
			retrySend(message) {
				
				let m = {
					senderId: this.loginUserInfo.uid,
					receiverId: this.chattingUserInfo.chattingUserId,
					sendTime: message.time,
					content: message.content,
					messageType: message.type,
					sessionId: this.chattingUserInfo.sessionId
				}
				let msg = {
					type: 'person-message',
					data: m
				}
				let _this = this
				uni.sendSocketMessage({
					data: JSON.stringify(msg),
					fail() {
						uni.showToast({
							title: '发送失败,请重新发送',
							icon: 'none'
						})
					},
					success() {}
				})
			},
			handleBottomHeight(height) {
				this.$refs.messageBox.setBottomHeigth(height)
			},
			handleKeyboradHeight(height) {

				this.$refs.messageBox.setKeyboardHeight(height)
			},
			getUserInfo() {
				this.$H.get("user/userInfo").then(res => {
					$store.state.loginUserInfo = res.result;
					uni.setStorageSync("userInfo", res.result)
				})
			},
		},

	}
</script>

<style lang="scss">
	
</style>
