import $store from '@/store/index.js';
import noticeUtil from '@/utils/noticeUtil.js';
import timeUtil from '@/utils/timeUtil.js';
import config from '@/utils/config.js';
let headerTimer = null;
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;
let reconnectTimer = null;
let isEventBound = false;
let isReconnecting = false;
let isInitiating = false;

export default {

	//心跳检测
	sendHeader() {
		// 清理已存在的心跳定时器
		if (headerTimer) {
			clearInterval(headerTimer);
			headerTimer = null;
		}

		headerTimer = setInterval(() => {
			// 只在连接开启状态下发送心跳
			if (!$store.state.isSocketOpen) {
				clearInterval(headerTimer);
				headerTimer = null;
				return;
			}

			let message = {
				type: 'ping',
				data: {}
			}
			uni.sendSocketMessage({
				data: JSON.stringify(message),
				success: () => {
					// console.log("发送心跳成功");
				},
				fail: () => {
					console.log("发送心跳失败");
					clearInterval(headerTimer);
					headerTimer = null;
					this.reconnect();
				}
			});
		}, 10000);
	},
	//连接websocket
	initConnect() {
		// 确保清理之前的状态
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		if (isInitiating) {
			console.log('WebSocket正在连接中，跳过重复连接');
			return;
		}

		// 添加登录状态检查
		if (!$store.state.token) {
			console.error('Token不存在，WebSocket无法连接');
			return;
		}

		isInitiating = true;
		isReconnecting = false;

		// 确保之前的连接完全清理
		this.cleanup();

		// 只在首次调用时绑定事件监听器
		if (!isEventBound) {
			// console.log('首次绑定WebSocket事件监听器');

			uni.onSocketOpen(() => {
				console.log('WebSocket打开成功');
				$store.state.isSocketOpen = true;
				reconnectAttempts = 0;
				isReconnecting = false;
				isInitiating = false;
				this.sendHeader();
			});

			uni.onSocketClose(() => {
				console.log('WebSocket连接已关闭');
				$store.state.isSocketOpen = false;
				isInitiating = false;
				isReconnecting = false;

				if (headerTimer) {
					clearInterval(headerTimer);
					headerTimer = null;
				}

				// 延迟一下再重连，避免立即重连
				setTimeout(() => {
					this.reconnect();
				}, 1000);
			});

			uni.onSocketError((error) => {
				console.error('WebSocket连接错误:', error);
				$store.state.isSocketOpen = false;
				isInitiating = false;
				isReconnecting = false;

				if (headerTimer) {
					clearInterval(headerTimer);
					headerTimer = null;
				}

				// 延迟一下再重连，避免立即重连
				setTimeout(() => {
					this.reconnect();
				}, 1000);
			});

			uni.onSocketMessage((res) => {
				try {
					let data = JSON.parse(res.data);
					this.handleMessage(data);
				} catch (error) {
					console.error('消息解析错误:', error);
					console.error('原始消息内容:', res.data);
				}
			});

			isEventBound = true;
		}

		// 建立新连接
		uni.connectSocket({
			url: config.websocketUrl + $store.state.token,
			success: res => {},
			fail: res => {
				console.error('WebSocket连接请求失败:', res);
				isInitiating = false;
				isReconnecting = false;

				// 延迟一下再重连，避免立即重连
				setTimeout(() => {
					this.reconnect();
				}, 1000);
			}
		});
	},

	reconnect() {
		// 先清理之前的定时器
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		// 重置状态
		isReconnecting = false;
		isInitiating = false;

		if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			console.log('达到最大重连次数，重置所有状态');
			reconnectAttempts = 0;
			return;
		}

		// 清理心跳定时器
		if (headerTimer) {
			clearInterval(headerTimer);
			headerTimer = null;
		}

		console.log(`准备第${reconnectAttempts + 1}次重连`);
		reconnectTimer = setTimeout(() => {
			reconnectAttempts++;
			this.initConnect();
		}, RECONNECT_INTERVAL);
	},

	// 将消息处理逻辑拆分成单独的方法
	handleMessage(data) {
		console.log("获取到信息",data);
		switch (data.type) {
			case 'ping':
				break;
			case 'person-message':
				let message = data.data
				//消息加入消息历史列表
				for (let i = 0; i < $store.state.personMessage.length; i++) {
					if ($store.state.personMessage[i].sessionId == message.sessionId) {
						$store.state.personMessage[i].list.push(message)
						break
					}
				}
				//更新消息记录
				$store.state.lastUpdateSession = {
					id: message.sessionId,
					count: $store.state.lastUpdateSession.count + 1
				}
				//如果消息不是本人发的则响铃
				if (message.senderId != $store.state.loginUserInfo.uid) {
					if ($store.state.systemConfig.bell) {
						noticeUtil.playMessageAudio();
					}
					//#ifdef APP
					if ($store.state.systemConfig.vibrate) {
						uni.vibrateShort()
					}
					//#endif
				}
				for (let i = 0; i < $store.state.sessionList.length; i++) {
					if ($store.state.sessionList[i].sessionId == message.sessionId) {
						$store.state.sessionList[i].updateTime = message.updateTime
						switch (message.messageType) {
							case 'image':
								$store.state.sessionList[i].lastMessage = '【图片】';
								break;
							case 'file':
								$store.state.sessionList[i].lastMessage = '【文件】';
								break;
							case 'video':
								$store.state.sessionList[i].lastMessage = '【视频】';
								break;
							default:
								$store.state.sessionList[i].lastMessage = message.content;
						}
						//没有在这个对话 未读++
						if ($store.state.chattingUserInfo == null || $store.state.chattingUserInfo
							.sessionId != $store.state.sessionList[i].sessionId) {
							if (message.senderId != $store.state.loginUserInfo.uid)
								$store.state.sessionList[i].unread++;
						} else {
							//否则已读
							$store.dispatch('clearUnread', {
								myId: $store.state.loginUserInfo.uid,
								friendId: $store.state.chattingUserInfo.chattingUserId
							})
						}
						//需要把对话移到第一位
						let session = $store.state.sessionList.splice(i, 1);
						$store.state.sessionList = session.concat($store.state.sessionList)

						break;
					}
				}
				$store.dispatch('countUnreadMessage')
				break;
			case 'token-failed':
				uni.showToast({
					title: '身份验证已过期',
					icon: 'none'
				})
				uni.removeStorageSync("hasLogin");
				uni.removeStorageSync("token");
				uni.removeStorageSync("userInfo");
				setTimeout(() => {
					uni.redirectTo({
						url: 'pages/user/go-login'
					})
				}, 1000)
				break;
			case 'person-apply':
				console.log("你收到了一个好友请求")
				uni.showToast({
					icon: 'none',
					title: '你收到了一个好友请求'
				})
				$store.dispatch('getNoticeList');
				if ($store.state.systemConfig.bell) {
					noticeUtil.playSystemAudio();
				}
				//#ifdef APP
				if ($store.state.systemConfig.vibrate) {
					uni.vibrateShort()
				}
				//#endif
				break;
			case 'count':
				$store.state.onlineArray = data.data
				break;
			case 'person-apply-agree':
				console.log("刷新一遍好友列表")
				//刷新一遍好友列表
				$store.dispatch('getFriendList')
				let friend = data.data
				if (friend.myId == $store.state.loginUserInfo.uid) {
					$store.dispatch('getNoticeList')
					// uni.showToast({
					// 	title: '添加成功',
					// 	icon: 'success'
					// })
				}
				break;
			case 'notice-refresh':
				$store.dispatch('getNoticeList')
				uni.showToast({
					title: data.data,
					icon: 'none'
				})
				break;
			case 'person-withdraw':
				for (let i = 0; i < $store.state.personMessage.length; i++) {
					if ($store.state.personMessage[i].sessionId == data.data.sessionId) {
						for (let j = $store.state.personMessage[i].list.length - 1; j >= 0; j--) {
							if ($store.state.personMessage[i].list[j].id == data.data.messageId) {
								$store.state.personMessage[i].list[j].isWithdrawn = 1
								break
							}
						}
						break;
					}
				}
				break;

		}
	},


	// 清理方法
	cleanup() {
		if (headerTimer) {
			clearInterval(headerTimer);
			headerTimer = null;
		}

		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		if ($store.state.isSocketOpen) {
			uni.closeSocket();
		}

		$store.state.isSocketOpen = false;
		isReconnecting = false;
		isInitiating = false;
	}
}