import Vue from 'vue'
import Vuex from 'vuex'
import $store from '@/store/index.js';
import stringUtil from '@/utils/stringUtil.js';
import request from '@/utils/request.js'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: uni.getStorageSync("hasLogin"),
		sessionKey: uni.getStorageSync("sessionKey"),
		messegeNum: [],

		systemConfig: uni.getStorageSync('system_config') || {
			vibrate: true, //是否开启手机震动
			bell: true, ///是否开启铃声通知
		},
		onlineArray: [],
		isSocketOpen: false, //是否连接websocket
		isOhCardSocketOpen: false, //是否连接ohcard websocket
		token: uni.getStorageSync('token') || '',
		loginUserInfo: uni.getStorageSync('userInfo') || {},
		personMessage: [], //好友聊天记录
		lastUpdateSession: {
			id: '',
			count: 0
		},
		editingGroupInfo: null,
		friendList: [],
		friendListShow: [],
		sessionList: [], //会话列表
		groupList: [],
		totalUnread: {
			message: 0,
			notice: 0
		},
		chattingUserInfo: null,
		chattingGroupInfo: null,
		noticeList: [],
		loading: false,
		// ai相关
		aiHistory:[],
		isAnswering:false,
		aiDataList:[],
		currentAiInfo: {}, // 当前选中的AI角色信息
		bottom:0,
		loginId:''
	},
	mutations: {
		login(state, userInfo) {
			state.hasLogin = uni.getStorageSync("hasLogin");
			state.sessionKey = uni.getStorageSync("sessionKey");
		},
		logout(state) {
			state.hasLogin = false;
			state.sessionKey = null;
		},
		_setFriendList(state, list) {
			state.friendList = list
		},
		switch_loading(state, tf) {
			if (tf) {
				state.loading = tf;
			} else {
				state.loading = !state.loading
			}
		}
	},
	getters: {
		messegeNum: state => {
			return state.messegeNum
		},
		onlineArray: state => {
			return state.onlineArray
		},
		lastUpdateSession: state => {
			return state.lastUpdateSession
		},
		personMessage: state => {
			return state.personMessage
		},
		noticeList: state => {
			return state.noticeList
		},
		totalUnread: state => {
			return state.totalUnread
		},
		groupList: state => {
			return state.groupList
		},
		sessionList: state => {
			return state.sessionList
		},
		friendListShow: state => {
			return state.friendListShow
		},
		friendList: state => {
			return state.friendList;
		},
		systemConfig: state => {
			return state.systemConfig;
		},
		isSocketOpen: state => {
			return state.isSocketOpen;
		},
		title: state => {
			return state.title
		},
		messageList: state => {
			return state.messageList
		},
		loginUserInfo: state => {
			return state.loginUserInfo
		},
		chattingUserInfo: state => {
			return state.chattingUserInfo
		},
		chattingGroupInfo: state => {
			return state.chattingGroupInfo
		},


	},
	actions: {
		
		initSessionList() {
			$store.state.totalUnread.message = 0
			$store.state.sessionList = [];
			for (let i = 0; i < $store.state.friendList.length; i++) {
				let session = {
					type: 'person',
					avatar: $store.state.friendList[i].avatar,
					sessionId: $store.state.friendList[i].session_id,
					name: $store.state.friendList[i].notation,
					lastMessage: $store.state.friendList[i].last_message,
					isHidden: $store.state.friendList[i].is_hidden,
					unread: $store.state.friendList[i].unread,
					updateTime: $store.state.friendList[i].update_time,
					chattingUserId: $store.state.friendList[i].friend_id
				}
				$store.state.totalUnread.message += session.unread
				$store.state.sessionList.push(session)
			}
			// console.log('init',$store.state.sessionList)
			$store.dispatch('sortSessionList')
		},
		//统计所有的未读消息
		countUnreadMessage() {
			$store.state.totalUnread.message = 0
			for (let i = 0; i < $store.state.sessionList.length; i++) {
				$store.state.totalUnread.message += $store.state.sessionList[i].unread;
			}
		},
		///按照时间顺序排序session
		sortSessionList() {
			for (let i = 0; i < $store.state.sessionList.length; i++) {
				for (let j = i + 1; j < $store.state.sessionList.length; j++) {
					if ($store.state.sessionList[j].updateTime > $store.state.sessionList[i].updateTime) {
						let t = $store.state.sessionList[i]
						$store.state.sessionList[i] = $store.state.sessionList[j]
						$store.state.sessionList[j] = t
					}
				}
			}
			// console.log('按照时间顺序排序session:',$store.state.sessionList)
		},
		//获取通知消息
		getNoticeList() {
			request.get('notice/list').then(res => {
				if (res.code == 0) {
					$store.state.totalUnread.notice = res.data.count
					$store.state.noticeList = res.data.noticeList
				}
			})
		},
		//设置好友会话消息的session_id
		initFriendSessionId() {
			for (let i = 0; i < $store.state.friendList.length; i++) {
				let session = {
					sessionId: $store.state.friendList[i].session_id,
					pageNum: 1,
					pageSize: 20,
					hasNextPage: false,
					lastMessageId: 0, ///用来防止加载历史消息时出问题
					list: []
				}
				$store.state.personMessage.push(session)
			}

		},


		getFriendList() {
			request.get('friend/list').then(res => {
				if (res.code == 0) {
					$store.state.friendList = res.data
					this.dispatch('initSessionList')
					this.dispatch('initFriendListShow');
					this.dispatch('initFriendSessionId');
				}
			})
		},
		initFriendListShow() {
			$store.state.friendListShow = []
			for (let i = 0; i <= 28; i++) {
				let t = []
				$store.state.friendListShow.push(t)
			}
			for (let i = 0; i < $store.state.friendList.length; i++) {
				//console.log(this.getters.friendList[i])
				let t = {
					id: $store.state.friendList[i].friend_id,
					name: $store.state.friendList[i].notation,
					url: $store.state.friendList[i].avatar
				}
				let num = stringUtil.getFirstLetter($store.state.friendList[i].notation).charCodeAt(0)
				if (num >= 65 && num <= 90) {
					$store.getters.friendListShow[num - 63].push(t)
				} else {
					$store.state.friendListShow[1].push(t)
				}

			}
		},
		clearUnread(context, param) {
			request.post('chat/clearUnread', param).then(res => {
				if (res.code == 0) {
					// console.log('已清除未读标记')
				}
			})
		},

	}


})

export default store