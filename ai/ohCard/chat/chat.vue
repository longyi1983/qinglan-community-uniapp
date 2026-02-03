<template>
	<view class="box">
		<z-paging ref="paging" v-model="dataList" use-chat-record-mode safe-area-inset-bottom bottom-bg-color="#f8f8f8"
			empty-view-text="有什么可以帮忙的？" @query="queryList" @keyboardHeightChange="keyboardHeightChange"
			@hidedKeyboard="hidedKeyboard" class="container">
			<template #top>
				<my-navbar :title="name[mode]" :navBg="navBg"></my-navbar>
			</template>
			<!-- 付费提示（仅提示，不隐藏其他元素） -->
			<view v-if="needPayment" class="pay-tip" style="transform: scaleY(-1);">
				<view class="pay-tip-inner">
					<view class="left">
						<u-icon name="lock" color="#7691FF" size="24"></u-icon>
						<text class="txt">该功能为付费内容，支付后即可使用</text>
						<text class="duration" v-if="paymentData && paymentData.duration">（{{ paymentData.duration }}{{
							paymentData.unit || '分钟' }}）</text>
					</view>
					<view class="right" @click="paymentData ? goToPayForAI(paymentData) : null">去支付</view>
				</view>
			</view>
			<view v-for="(item, index) in dataList" :key="index" style="position: relative;">
				<view style="transform: scaleY(-1);">
					<chat-item :item="item" @resend="resendMessage(index)" />
				</view>
			</view>
			<!-- OH卡模式 -->
			<view class="imgContainer" style="transform: scaleY(-1)" v-if="mode == 'OH'">
				<view class="background-card">
					<image class="background-image" :src="wordCard"></image>
				</view>
				<view class="foreground-card">
					<image class="foreground-image" :src="pictureCard"></image>
				</view>
			</view>
			<!-- 聊愈模式 -->
			<view class="type-container" style="transform: scaleY(-1)" v-if="mode == 'CC'">
				<view class="sheep">
					<u-image :src="cc" width="200rpx" height="301rpx"></u-image>
				</view>
				<view class="desc">
					<view class="name">
						<view class="">
							<image src="@/static/scale/arrow.png" mode=""></image>
						</view>
						Hi！我是{{ aiInfo.name || '聊愈师' }}
					</view>
					<view class="detail">
						我来自多普勒-22b星球，和我来聊天吧！
					</view>
				</view>
			</view>
			<!-- 探梦模式 -->
			<view class="type-container" style="transform: scaleY(-1)" v-if="mode == 'ED'">
				<view class="sheep">
					<u-image :src="ed" width="200rpx" height="301rpx"></u-image>
				</view>
				<view class="desc">
					<view class="name">
						<view class="">
							<image src="@/static/scale/arrow.png" mode=""></image>
						</view>
						Hi！我是探梦师跳跳
					</view>
					<view class="detail">
						我来自多普勒-22b星球，和我来聊天吧！
					</view>
				</view>
			</view>

			<!-- 底部聊天输入框 -->
			<template #bottom>
				<chat-input-bar :disabled="isAnswering" ref="inputBar" :length="dataList.length" @send="doSend"
					@getResult="getResult" @asrOpen="onAsrOpen" @asrStop="onAsrStop" @asrCountDown="onAsrCountDown"
					@asrResult="onAsrResult" />
			</template>
		</z-paging>
		<!-- 语音聊天悬浮按钮 
		<view class="voice-fab" @click="openVoiceDialog">
			<image class="voice-fab-icon" src="@/ai/static/phone.png"></image>
		</view>
		-->
		<!-- 语音聊天弹窗（沉浸式） -->
		<view v-if="showVoiceDialog" class="vr-mask" @click.self="cancelVR">
			<!-- 装饰性背景粒子 -->
			<view class="vr-particles">
				<view v-for="n in 20" :key="n" class="vr-particle" :style="{
					left: Math.random() * 100 + '%',
					animationDelay: (n * 1.5) + 's',
					animationDuration: (3 + Math.random() * 2) + 's'
				}">
				</view>
			</view>

			<view class="vr-wrap">
				<!-- OH卡模式 -->
				<view class="imgContainer vr-content-card" v-if="mode == 'OH'">
					<view class="background-card">
						<image class="background-image" :src="wordCard"></image>
					</view>
					<view class="foreground-card">
						<image class="foreground-image" :src="pictureCard"></image>
					</view>
				</view>
				<!-- 聊愈模式 -->
				<view class="type-container vr-content-card" v-if="mode == 'CC'">
					<view class="sheep">
						<u-image :src="cc" width="200rpx" height="301rpx"></u-image>
					</view>
					<view class="desc">
						<view class="name">
							<view class="">
								<image src="@/static/scale/arrow.png" mode=""></image>
							</view>
							Hi！我是{{ aiInfo.name || '聊愈师' }}
						</view>
						<view class="detail">
							我来自多普勒-22b星球，和我来聊天吧！
						</view>
					</view>
				</view>
				<!-- 探梦模式 -->
				<view class="type-container vr-content-card" v-if="mode == 'ED'">
					<view class="sheep">
						<u-image :src="ed" width="200rpx" height="301rpx"></u-image>
					</view>
					<view class="desc">
						<view class="name">
							<view class="">
								<image src="@/static/scale/arrow.png" mode=""></image>
							</view>
							Hi！我是探梦师跳跳
						</view>
						<view class="detail">
							我来自多普勒-22b星球，和我来聊天吧！
						</view>
					</view>
				</view>

				<view class="vr-orb" @click="toggleRecordFromInputBar" v-if="false">
					<view class="vr-orb-core" :class="{ glow: (vrRecording || isSpeaking || isAnswering) }"></view>
				</view>
				<view class="vr-dots" :class="{ active: (vrRecording || isSpeaking || isAnswering) }">
					<view v-for="n in 16" :key="n" class="vr-dot"
						:style="{ animationDelay: (n * 0.06) + 's', opacity: (vrRecording || isSpeaking || isAnswering) ? 1 : .4 }">
					</view>
				</view>
				<view class="vr-tip">{{ statusText }}</view>
				<view class="vr-actions">
					<view class="vr-btn vr-toggle" @click.stop="toggleRecordFromInputBar">
						<view v-if="vrRecording" class="icon-pause">
							<view></view>
							<view></view>
						</view>
						<image v-else class="icon-play" src="/static/phone.png"></image>
					</view>
					<view class="vr-btn vr-cancel" @click.stop="cancelVR"><text>×</text></view>
				</view>
			</view>
		</view>

		<!-- 角色选择弹窗 (CC模式和OH模式) -->
		<view v-if="showRolePicker" class="role-picker-mask" @click.self>
			<view class="role-picker">
				<view class="role-title">选择AI角色</view>
				<view class="role-guide-text">
					您是第一次使用这个功能，请选择一个您喜欢的{{ mode === 'CC' ? '聊愈师' : '引导师' }}吧！
				</view>
				<swiper class="role-swiper" :current="roleSwiperCurrent" previous-margin="120rpx" next-margin="150rpx"
					@change="onRoleSwiperChange">
					<swiper-item v-for="(bot, idx) in aiRoleList" :key="idx">
						<view class="role-item" @click.stop="selectRole(bot)">
							<image class="role-logo" :src="bot.logo"></image>
							<view class="role-name">{{ bot.name }}</view>
							<view class="role-desc">{{ bot.desc }}</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</view>

		<video-help :url="`https://ceping.qinglan.cn/uniapp/new/video/ai-${mode}.mp4`"
			:offset="{ top: '360rpx', right: '20rpx' }" />
	</view>
</template>

<script>
import {
	mapState
} from 'vuex';
import scrollMixin from '@/mixins/scrollMixin.js';
import config from '@/utils/config.js';
import chatItem from '@/ai/components/chat-item/chat-item.vue';
import chatInputBar from '@/ai/components/chat-input-bar/chat-input-bar.vue';
import voiceToWord from '@/ai/components/voice-to-word/voice-to-word.vue';
import ai from '@/utils/aiWebsocket.js'
// ws相关
let headerTimer = null;
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectAttempts = 0;
let reconnectTimer = null;
let isEventBound = false;
let isReconnecting = false;
let isInitiating = false;
let socketAi = null;
import card from './card.json';

export default {
	mixins: [scrollMixin],
	components: {
		chatItem,
		chatInputBar,
		voiceToWord
	},
	data() {
		return {
			archiveId: "",
			sheep: this.$f.geturl("/uniapp/new/scale/sheep.png"),
			cc: this.$f.geturl("/uniapp/new/ai/ai-cc.png"),
			ed: this.$f.geturl("/uniapp/new/ai/ai-ed.png"),
			dataList: [],
			askMsg: '',
			// isAnswering: false,
			isEventBound: false,
			userInfo: {},
			history: [],
			aiInfo: {},
			pictureCard: "",
			wordCard: "",
			hasGotResult: false,
			mode: 'OH',
			options: {},
			// CC角色选择
			showRolePicker: false,
			aiRoleList: [],
			roleSwiperCurrent: 0,
			pendingConfig: null,
			pendingContinue: false,
			savedContinueData: null,
			// 发送防抖：防止短时间内相同内容重复发送
			lastSentKey: '',
			lastSentAt: 0,
			name: {
				OH: "爱卡模式", //OH卡
				ED: "探梦", //探梦
				CC: "聊愈", //疗愈师
				CBT: "AI CBT", //CBT
			},
			timeoutMap: new Map(), // 保存AI消息的超时定时器
			globalTimeoutTimer: null, // 全局超时监控定时器
			baseTimeout: 8000, // 基础超时时间（8秒）
			maxTimeout: 15000, // 最大超时时间（15秒）
			timeoutMultiplier: 1, // 超时时间倍数（根据网络状况调整）
			maxRetryCount: 1, // 最大重试次数（改为1次）
			enableRetry: true, // 是否启用重试功能
			processedMessageIds: new Set(), // 防止重复处理的消息ID集合
			hasShownParseTip: false, // 是否已弹出解析提示
			// 语音弹窗
			showVoiceDialog: false,
			vrRecording: false,
			vrText: '',
			vrDowntime: -1,
			// 付费提示
			needPayment: false,
			paymentData: null,
			// 返回确认标志
			confirmedBack: false,
			optionsxf: {
				receordingDuration: 120,
				APPID: 'a53f7e7d',
				API_SECRET: 'NjFjZTNjZTAwNzkyYWMxMTZhNDFiYjcx',
				API_KEY: '009746aded79367ab274a1a767a191a3'
			}
		}
	},
	computed: {
		...mapState(['isAnswering']),
		isSpeaking() {
			return ai.isPlaying;
		},
		onRoleSwiperChange(e) {
			this.roleSwiperCurrent = e && e.detail ? e.detail.current : 0;
		},
		descText() {
			return this.isSpeaking ? 'AI 正在讲话，点击“打断”可停止播放' : '请按住下方按钮开始说话，松开结束'
		},
		statusText() {
			if (this.vrRecording) {
				return this.vrDowntime > 0 ? `你可以开始说话（剩余${this.vrDowntime}s）` : '建立连接中…';
			}
			if (this.isAnswering || this.isSpeaking) {
				return '思考中';
			}
			return '点击左侧开始按钮，链接成功后即可开始对话';
		}
	},
	watch: {
		'dataList.length': function (newLen) {
			this.checkShowParseTip();
		},
		isAnswering: function (newVal) {
			this.checkShowParseTip();
		},
		'dataList': {
			handler(newVal) {
				console.log('dataList', newVal)
				this.$store.state.aiDataList = newVal;
			},
			deep: true,
			immediate: true
		},
	},
	//onBackPress在微信小程序中不生效 所以单独放到onUnload处理
	onBackPress(options) {
		// #ifdef APP-PLUS || H5
		// 如果已经确认返回，直接允许返回
		if (this.confirmedBack) {
			this.confirmedBack = false; // 重置标志
			this.saveChatData();
			return false; // 允许返回
		}
		
		if (this.isAnswering) {
			uni.showToast({
				title: 'AI正在思考中，请稍后...',
				icon: 'none'
			});
			return true; // 阻止返回
		} else {
			// 显示确认提示
			uni.showModal({
				title: '提示',
				content: '确定要返回吗？',
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						// 用户确认返回，设置标志并再次触发返回
						this.confirmedBack = true;
						// 延迟一下确保标志已设置，然后触发返回
						setTimeout(() => {
							uni.navigateBack();
						}, 100);
					}
				}
			});
			// 阻止默认返回行为，等待用户确认
			return true;
		}
		// #endif
	},
	async onLoad(option) {
		this.options = option;
		this.vrRecording = false;
		this.init(option)
		if (option.archiveId) this.archiveId = option.archiveId;
	},
	mounted() {
		// 注册重置超时倍数的函数到store中
		this.$store.state.resetTimeoutMultiplier = this.resetTimeoutMultiplier.bind(this);
		// 注册doAnswer方法到store中，供aiWebsocket调用
		this.$store.state.chatDoAnswer = this.doAnswer.bind(this);
		// 注册刷新指定消息超时定时器的方法，供aiWebsocket在流式到达时调用
		this.$store.state.refreshMessageTimeout = this.refreshMessageTimeout.bind(this);
	},
	onShow() {
		// 页面显示时检查是否有超时的消息
		setTimeout(() => {
			this.debugPendingMessages();
			this.logAllMessagesStatus();
		}, 1000);
		// 静默校验是否仍需付费（用户可能从支付页返回未完成支付）
		// this.silentPaymentCheck();
	},
	methods: {
		// 生成全局唯一ID（UUID v4，跨端可用，避免时间戳冲突）
		generateMessageId() {
			const getRandomBytes = (len) => {
				try {
					// H5/部分APP环境
					if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
						const arr = new Uint8Array(len);
						crypto.getRandomValues(arr);
						return arr;
					}
				} catch (e) { }
				// 兜底：Math.random
				const arr = new Uint8Array(len);
				for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 256);
				return arr;
			};
			const bytes = getRandomBytes(16);
			// 版本与变体位
			bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
			bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
			const hex = Array.from(bytes).map(b => (b + 0x100).toString(16).substr(1)).join('');
			return (
				hex.slice(0, 8) + '-' +
				hex.slice(8, 12) + '-' +
				hex.slice(12, 16) + '-' +
				hex.slice(16, 20) + '-' +
				hex.slice(20)
			);
		},
		// 是否存在未完成的AI消息（防止重复push与重复send）
		hasPendingAiMessage() {
			try {
				return this.dataList && this.dataList.some(item => !item.isMe && item.status === 'pending');
			} catch (e) {
				return false;
			}
		},
		toggleRecordFromInputBar() {
			if (this.isAnswering) {
				uni.showToast({
					title: 'AI正在思考中，请稍后...',
					icon: 'none'
				});
				return;
			}
			const input = this.$refs.inputBar;
			if (!input) return;
			const call = (act) => {
				const ref = input.$refs && input.$refs.yueAsrRefs;
				if (!ref) return false;
				if (typeof ref[act] === 'function') {
					ref[act]();
					return true;
				}
				if (ref.$vm && typeof ref.$vm[act] === 'function') {
					ref.$vm[act]();
					return true;
				}
				return false;
			};
			if (this.vrRecording) {
				this.vrRecording = false;
				this.vrDowntime = -1;
				call('end');
			} else {
				this.vrRecording = true;
				this.vrDowntime = -1;
				call('start');
			}
		},
		cancelVR() {
			const input = this.$refs.inputBar;
			if (!input) return;
			const call = (act) => {
				const ref = input.$refs && input.$refs.yueAsrRefs;
				if (!ref) return false;
				if (typeof ref[act] === 'function') {
					ref[act]();
					return true;
				}
				if (ref.$vm && typeof ref.$vm[act] === 'function') {
					ref.$vm[act]();
					return true;
				}
				return false;
			};
			if (this.vrRecording) {
				this.vrRecording = false;
				this.vrDowntime = -1;
				call('end');
			}
			this.endVoiceDialog();
			this.closeVoiceDialog();
		},
		// 语音弹窗逻辑
		openVoiceDialog() {
			this.showVoiceDialog = true;
			this.vrRecording = false;
			this.vrText = '';
			this.vrDowntime = -1;
			// 确保子组件已挂载
			this.$nextTick(() => { });
		},
		closeVoiceDialog() {
			this.showVoiceDialog = false;
		},
		interruptAi() {
			try {
				ai.cleanupAudioQueue();
			} catch (e) { }
			this.$store.state.isAnswering = false;
		},
		_toggleAsr(action) {
			const invoke = () => {
				const ref = this.$refs.yueAsrVoiceDlg;
				if (!ref) return;
				try {
					if (typeof ref[action] === 'function') {
						ref[action]();
						return;
					}
					if (ref.$vm && typeof ref.$vm[action] === 'function') {
						ref.$vm[action]();
						return;
					}
				} catch (err) {
					console.warn('asr invoke fail, will retry on nextTick', err);
				}
			};
			invoke();
			// 兜底：若首次未成功（可能因尚未挂载），下一帧再试
			this.$nextTick(() => invoke());
		},
		startVoiceDialog() {
			this.vrRecording = true;
			this.vrDowntime = -1;
			this._toggleAsr('start');
		},
		endVoiceDialog() {
			this.vrRecording = false;
			this._toggleAsr('end');
		},
		toggleVrByClick() {
			if (this.vrRecording) {
				this.endVoiceDialog();
			} else {
				this.startVoiceDialog();
			}
		},
		onVrOpen() { },
		onVrStop() { },
		onVrChange() { },
		onVrCountDown(sec) {
			this.vrDowntime = sec;
		},
		onVrResult(text) {
			this.vrText = text || '';
		},
		// 监听底部 chat-input-bar 的ASR事件，驱动沉浸式提示与波浪
		onAsrOpen() {
			// 只有在语音弹窗显示时才设置为true，避免初始化时自动触发
			if (this.showVoiceDialog) {
				this.vrRecording = true;
			}
		},
		onAsrStop() {
			this.vrRecording = false;
			this.vrDowntime = -1;
		},
		onAsrCountDown(sec) {
			this.vrDowntime = sec;
		},
		onAsrResult(text) {
			this.vrText = text || '';
		},
		sendVoiceText() {
			if (!this.vrText.trim().length) return;
			this.doSend(this.vrText, 'characters');
			this.closeVoiceDialog();
			this.vrText = '';
		},
		checkShowParseTip() {
			if (this.dataList.length > 10 && !this.isAnswering && !this.hasShownParseTip) {
				uni.showToast({
					title: '可以点击“开始解析”进行详细解读啦~',
					icon: 'none',
					duration: 2500
				});
				this.hasShownParseTip = true;
			} else if (this.dataList.length <= 10) {
				this.hasShownParseTip = false;
			}
		},
		// 清理指定消息的超时定时器
		clearMessageTimeout(aiMsgId) {
			if (this.timeoutMap.has(aiMsgId)) {
				clearTimeout(this.timeoutMap.get(aiMsgId));
				this.timeoutMap.delete(aiMsgId);
			}
		},

		// 清理所有超时定时器
		clearAllTimeouts() {
			for (const [aiMsgId, timeoutId] of this.timeoutMap) {
				clearTimeout(timeoutId);
			}
			this.timeoutMap.clear();

			if (this.globalTimeoutTimer) {
				clearInterval(this.globalTimeoutTimer);
				this.globalTimeoutTimer = null;
			}
		},

		// 启动全局超时监控
		startGlobalTimeoutMonitor() {
			if (this.globalTimeoutTimer) {
				clearInterval(this.globalTimeoutTimer);
			}

			this.globalTimeoutTimer = setInterval(() => {
				const now = Date.now();
				let hasTimeout = false;
				let pendingCount = 0;

				// 检查所有pending消息
				for (let i = 0; i < this.dataList.length; i++) {
					const item = this.dataList[i];
					if (!item.isMe && item.status === 'pending' && item.startTime) {
						pendingCount++;
						const elapsed = now - item.startTime;
						const timeout = this.getTimeoutForMessage(item);

						// 每5秒输出一次调试信息
						const retryCount = parseInt(item.retryCount) || 0;
						if (elapsed % 5000 < 1000) {
							console.log(
								`监控中: 消息 ${item.id} 已耗时 ${elapsed}ms，超时时间 ${timeout}ms，重试次数 ${retryCount}`);
						}

						if (elapsed > timeout) {
							console.log(
								`消息 ${item.id} 超时，已耗时 ${elapsed}ms，超时时间 ${timeout}ms，当前重试次数: ${retryCount}`
							);
							// 检查是否已经处理过，防止重复处理
							const isProcessed = this.isMessageProcessed(item.id);
							console.log(
								`消息 ${item.id} 是否已处理: ${isProcessed}, processedMessageIds size: ${this.processedMessageIds.size}`
							);
							if (!isProcessed) {
								console.log(`开始处理消息 ${item.id} 超时`);
								// 传递当前dataList中的最新对象，而不是循环中的item
								const currentItem = this.dataList[i];
								this.handleMessageTimeout(currentItem);
								hasTimeout = true;
							} else {
								console.log(`消息 ${item.id} 已经处理过，跳过全局超时处理`);
							}
						}
					}
				}

				// 如果没有pending消息，停止监控
				const hasPendingMessages = this.dataList.some(item => !item.isMe && item.status === 'pending');
				if (!hasPendingMessages) {
					console.log('没有pending消息，停止全局超时监控');
					this.stopGlobalTimeoutMonitor();
				}

				// 如果发生超时，增加超时倍数
				if (hasTimeout) {
					this.timeoutMultiplier = Math.min(this.timeoutMultiplier * 1.2, 3);
					console.log(`调整超时倍数到: ${this.timeoutMultiplier}`);
				}
			}, 1000); // 每秒检查一次
		},

		// 停止全局超时监控
		stopGlobalTimeoutMonitor() {
			if (this.globalTimeoutTimer) {
				clearInterval(this.globalTimeoutTimer);
				this.globalTimeoutTimer = null;
			}
		},

		// 获取消息的超时时间
		getTimeoutForMessage(item) {
			// 根据重试次数和网络状况调整超时时间
			const baseTimeout = this.baseTimeout * this.timeoutMultiplier;
			const retryMultiplier = 1 + (item.retryCount || 0) * 0.2; // 每次重试增加20%
			return Math.min(baseTimeout * retryMultiplier, this.maxTimeout);
		},

		// 处理消息超时
		handleMessageTimeout(item) {
			console.log(`=== 开始处理消息 ${item.id} 超时 ===`);
			const aiIdx = this.dataList.findIndex(msg => msg.id === item.id);
			if (aiIdx === -1) {
				console.log(`未找到消息 ${item.id}，无法处理超时`);
				return;
			}
			console.log(`找到消息 ${item.id} 在索引 ${aiIdx}，当前状态: ${this.dataList[aiIdx].status}`);

			// 若最近有流式数据到达，或当前仍在语音播放/排队中，则跳过超时并续期
			const nowTs = Date.now();
			const lastTs = this.dataList[aiIdx].lastUpdateTime || this.dataList[aiIdx].startTime || 0;
			const audioStatus = (ai && typeof ai.getAudioStatus === 'function') ? ai.getAudioStatus() : null;
			const isAudioBusy = this.isSpeaking || (audioStatus && (audioStatus.isPlaying || audioStatus.queueLength >
				0));
			if ((nowTs - lastTs) < this.baseTimeout || isAudioBusy) {
				console.log(`消息 ${item.id} 近期有更新或音频仍在进行，跳过本次超时并续期`);
				this.refreshMessageTimeout(item.id);
				return;
			}

			// 检查消息是否已经被处理过
			if (this.isMessageProcessed(item.id)) {
				console.log(`消息 ${item.id} 已经处理过，跳过重复处理`);
				return;
			}
			console.log(`消息 ${item.id} 未被处理过，继续处理流程`);

			// 检查消息当前状态
			if (this.dataList[aiIdx].status !== 'pending') {
				console.log(`消息 ${item.id} 状态已变为 ${this.dataList[aiIdx].status}，跳过处理`);
				return;
			}
			console.log(`消息 ${item.id} 状态为pending，可以继续处理`);

			// 清理该消息的定时器
			this.clearMessageTimeout(item.id);

			// 确保retryCount是数字
			const currentRetryCount = parseInt(item.retryCount) || 0;
			console.log(
				`消息 ${item.id} 当前重试次数: ${currentRetryCount}, 最大重试次数: ${this.maxRetryCount}, 重试功能: ${this.enableRetry ? '启用' : '禁用'}`
			);

			// 检查是否启用重试功能
			if (!this.enableRetry) {
				console.log(`重试功能已禁用，直接删除消息`);
				// 标记消息为已处理，防止重复处理
				this.markMessageAsProcessed(item.id);
				if (item.userMsgId) {
					this.markUserMessageFailed(item.userMsgId, item.id);
				} else {
					// 删除失败的AI消息而不是标记为失败
					console.log(`删除失败的AI消息 ${item.id}，索引: ${aiIdx}`);
					this.dataList.splice(aiIdx, 1);
					this.$store.state.isAnswering = false;
				}
				return;
			}

			if (currentRetryCount < this.maxRetryCount) {
				// 重试
				const newRetryCount = currentRetryCount + 1;
				console.log(`消息 ${item.id} 第 ${newRetryCount} 次重试，准备重新发送`);
				// 更新重试次数
				this.$set(this.dataList[aiIdx], 'retryCount', newRetryCount);
				// 确保状态仍然是pending
				this.$set(this.dataList[aiIdx], 'status', 'pending');
				this.trySendAIMessage(aiIdx, item.id, item.userMsgId, item.question);
				console.log(`消息 ${item.id} 重试请求已发送`);
			} else {
				// 达到最大重试次数，删除失败的AI消息
				console.log(`消息 ${item.id} 达到最大重试次数(${currentRetryCount})，准备删除消息`);
				// 标记消息为已处理，防止延迟响应和重复处理
				this.markMessageAsProcessed(item.id);
				console.log(`消息 ${item.id} 已标记为已处理`);
				if (item.userMsgId) {
					this.markUserMessageFailed(item.userMsgId, item.id);
				} else {
					// 删除失败的AI消息而不是标记为失败
					console.log(`删除失败的AI消息 ${item.id}，索引: ${aiIdx}`);
					this.dataList.splice(aiIdx, 1);
					this.$store.state.isAnswering = false;
				}
				console.log(`消息 ${item.id} 处理完成，消息已删除`);
			}
		},

		// 重置超时倍数（当成功收到回复时）
		resetTimeoutMultiplier() {
			this.timeoutMultiplier = 1;
			console.log('重置超时倍数到: 1');
		},

		// 检测网络状态
		checkNetworkStatus() {
			uni.getNetworkType({
				success: (res) => {
					console.log('当前网络类型:', res.networkType);
					// 根据网络类型调整超时倍数（降低倍数以减少等待时间）
					switch (res.networkType) {
						case 'wifi':
							this.timeoutMultiplier = 1;
							break;
						case '4g':
							this.timeoutMultiplier = 1.1;
							break;
						case '3g':
							this.timeoutMultiplier = 1.2;
							break;
						case '2g':
							this.timeoutMultiplier = 1.3;
							break;
						default:
							this.timeoutMultiplier = 1.1;
					}
					console.log(`根据网络类型调整超时倍数到: ${this.timeoutMultiplier}`);
				},
				fail: () => {
					console.log('获取网络类型失败，使用默认倍数');
					this.timeoutMultiplier = 1.1;
				}
			});
		},

		// 监听网络状态变化
		onNetworkStatusChange() {
			uni.onNetworkStatusChange((res) => {
				console.log('网络状态变化:', res);
				this.checkNetworkStatus();
			});
		},

		// 调试方法：显示当前pending消息状态
		debugPendingMessages() {
			const pendingMessages = this.dataList.filter(item => !item.isMe && item.status === 'pending');
			console.log('当前pending消息数量:', pendingMessages.length);
			pendingMessages.forEach((msg, index) => {
				const elapsed = Date.now() - (msg.startTime || 0);
				const timeout = this.getTimeoutForMessage(msg);
				console.log(
					`消息${index + 1}: ID=${msg.id}, 已耗时=${elapsed}ms, 超时时间=${timeout}ms, 重试次数=${msg.retryCount}`
				);
			});
		},

		// 手动触发超时检查（用于调试）
		manualTimeoutCheck() {
			console.log('手动触发超时检查');
			const now = Date.now();
			for (let i = 0; i < this.dataList.length; i++) {
				const item = this.dataList[i];
				if (!item.isMe && item.status === 'pending' && item.startTime) {
					const referenceTime = item.lastUpdateTime || item.startTime;
					const elapsed = now - referenceTime;
					const timeout = this.getTimeoutForMessage(item);
					console.log(`检查消息 ${item.id}: 已耗时 ${elapsed}ms，超时时间 ${timeout}ms`);
					if (elapsed > timeout) {
						console.log(`手动触发消息 ${item.id} 超时处理`);
						this.handleMessageTimeout(item);
					}
				}
			}
		},

		// 强制标记消息为失败（用于调试）
		forceMarkMessageAsFailed(aiMsgId) {
			console.log(`强制标记消息 ${aiMsgId} 为失败`);
			const aiIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			if (aiIdx !== -1) {
				const item = this.dataList[aiIdx];
				// 标记为已处理
				this.markMessageAsProcessed(item.id);
				if (item.userMsgId) {
					this.markUserMessageFailed(item.userMsgId, item.id);
				} else {
					// 删除失败的AI消息
					console.log(`强制删除失败的AI消息 ${aiMsgId}，索引: ${aiIdx}`);
					this.dataList.splice(aiIdx, 1);
					this.$store.state.isAnswering = false;
				}
				console.log(`消息 ${aiMsgId} 已强制删除`);
			} else {
				console.log(`未找到消息 ${aiMsgId}`);
			}
		},

		// 强制停止所有超时处理
		forceStopAllTimeouts() {
			console.log('强制停止所有超时处理');
			// 清理所有定时器
			this.clearAllTimeouts();
			// 删除所有pending的AI消息
			const pendingMessages = [];
			for (let i = this.dataList.length - 1; i >= 0; i--) {
				const item = this.dataList[i];
				if (!item.isMe && item.status === 'pending') {
					this.markMessageAsProcessed(item.id);
					pendingMessages.push(item.id);
					console.log(`强制删除消息 ${item.id}`);
					this.dataList.splice(i, 1);
				}
			}
			this.$store.state.isAnswering = false;
			console.log(`所有超时处理已停止，删除了 ${pendingMessages.length} 条消息`);
		},

		// 输出所有消息状态（用于调试）
		logAllMessagesStatus() {
			console.log('=== 所有消息状态 ===');
			this.dataList.forEach((item, index) => {
				const elapsed = item.startTime ? Date.now() - item.startTime : 0;
				const retryCount = parseInt(item.retryCount) || 0;
				console.log(
					`消息${index + 1}: ID=${item.id}, 状态=${item.status}, 是否用户=${item.isMe}, 重试次数=${retryCount}, 已耗时=${elapsed}ms`
				);
			});
			console.log('=== 状态输出结束 ===');
		},

		// 手动触发重试（用于调试）
		manualRetry(aiMsgId) {
			console.log(`手动触发消息 ${aiMsgId} 重试`);
			const aiIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			if (aiIdx !== -1) {
				const item = this.dataList[aiIdx];
				const currentRetryCount = parseInt(item.retryCount) || 0;
				if (currentRetryCount < this.maxRetryCount) {
					const newRetryCount = currentRetryCount + 1;
					console.log(`手动重试消息 ${aiMsgId}，第 ${newRetryCount} 次重试`);
					this.$set(this.dataList[aiIdx], 'retryCount', newRetryCount);
					this.$set(this.dataList[aiIdx], 'status', 'pending');
					this.trySendAIMessage(aiIdx, item.id, item.userMsgId, item.question);
				} else {
					console.log(`消息 ${aiMsgId} 已达到最大重试次数(${this.maxRetryCount})，无法手动重试`);
				}
			} else {
				console.log(`未找到消息 ${aiMsgId}`);
			}
		},

		// 切换重试功能开关
		toggleRetry() {
			this.enableRetry = !this.enableRetry;
			console.log(`重试功能已${this.enableRetry ? '启用' : '禁用'}`);
		},

		// 设置重试次数
		setRetryCount(count) {
			this.maxRetryCount = Math.max(0, Math.min(count, 3)); // 限制在0-3之间
			console.log(`最大重试次数已设置为: ${this.maxRetryCount}`);
		},

		// 清理失败的消息
		cleanupFailedMessages() {
			const failedMessages = this.dataList.filter(item => !item.isMe && item.status === 'fail');
			console.log(`清理 ${failedMessages.length} 条失败消息`);

			failedMessages.forEach(msg => {
				// 清理定时器
				this.clearMessageTimeout(msg.id);
				// 从数据列表中移除
				const index = this.dataList.findIndex(item => item.id === msg.id);
				if (index !== -1) {
					this.dataList.splice(index, 1);
				}
			});
		},

		// 检查消息是否已经被处理过
		isMessageProcessed(msgId) {
			return this.processedMessageIds.has(msgId);
		},

		// 标记消息为已处理
		markMessageAsProcessed(msgId) {
			this.processedMessageIds.add(msgId);
			// 清理过期的处理记录（保留最近100条）
			if (this.processedMessageIds.size > 100) {
				const array = Array.from(this.processedMessageIds);
				this.processedMessageIds.clear();
				array.slice(-50).forEach(id => this.processedMessageIds.add(id));
			}
		},

		// 检查是否为孤儿响应（没有对应的pending消息）
		isOrphanResponse(data) {
			const hasMatchingMessage = this.dataList.some(item =>
				!item.isMe &&
				item.status === 'pending' &&
				this.deepEqual(item.question, data.question)
			);
			return !hasMatchingMessage;
		},

		// 记录孤儿响应
		logOrphanResponse(data) {
			console.warn("检测到孤儿响应（可能是延迟到达的已失败请求响应）:", {
				question: data.question,
				content: data.content,
				isFinish: data.node_is_finish,
				currentPendingMessages: this.dataList.filter(item => !item.isMe && item.status === 'pending')
					.map(item => ({
						id: item.id,
						question: item.question,
						status: item.status
					}))
			});
		},

		async init(option) {
			this.userInfo = this.$store.state.loginUserInfo;
			this.$store.state.aiHistory = []
			// 模式与网络
			// 检测网络状态
			this.checkNetworkStatus();
			// 监听网络状态变化
			this.onNetworkStatusChange();
			let config = {
				mode: option.mode || 'OH'
			}
			this.mode = option.mode || 'OH';

			// 检查是否需要继续之前的对话
			if (option.continue === 'true') {
				const savedData = uni.getStorageSync('ohCardChatData-' + this.mode);
				if (savedData) {
					console.log('恢复保存的数据', savedData)
					setTimeout(() => {
						// 恢复保存的数据
						this.dataList = savedData.chatHistory;
						this.wordCard = savedData.wordCard;
						this.pictureCard = savedData.pictureCard;
						this.$store.state.aiDataList = savedData.chatHistory;
						this.$store.state.aiHistory = savedData.aiHistory || [];
						// CC模式和OH模式都延迟到选择后再连接
						if (this.mode === 'CC' || this.mode === 'OH') {
							this.savedContinueData = savedData;
							this.pendingContinue = true;
						} else {
							// 设置sessionId并直接连接
							ai.sessionId = savedData.sessionId;
							config.sessionId = savedData.sessionId;
							setTimeout(() => {
								if (!this.$store.state.isOhCardSocketOpenetOpen) {
									ai.initWebSocket(config)
								}
							}, 1000)
						}
					}, 500)
				} else {
					// 没有保存数据，等待角色选择后再初始化
				}
			}

			// CC模式和OH模式都需要角色选择
			if (this.mode === 'CC' || this.mode === 'OH') {
				this.pendingConfig = config;

				// 先异步加载AI角色列表，完成后再进行下一步
				await this.loadAiChoices();

				// 尝试读取本地缓存的AI角色
				const cachedRole = this.getCachedAiRole();
				if (cachedRole) {
					// 有缓存角色，直接使用
					console.log('使用缓存的AI角色:', cachedRole);
					this.aiInfo = cachedRole;
					// 更新store中的AI角色信息
					this.$store.state.currentAiInfo = cachedRole;
					if (this.mode === 'CC') {
						this.cc = cachedRole.logo;
					}
					//this.openVoiceDialog();
					// 继续初始化聊天
					if (this.pendingContinue && this.savedContinueData) {
						ai.sessionId = this.savedContinueData.sessionId;
						config.sessionId = this.savedContinueData.sessionId;
						setTimeout(() => {
							if (!this.$store.state.isOhCardSocketOpenetOpen) {
								ai.initWebSocket(config)
							}
						}, 1000)
					} else {
						this.initializeNewChat(config);
					}
				} else {
					// 没有缓存角色，显示角色选择器
					console.log('没有缓存角色，显示角色选择器');
					this.showRolePicker = true;
				}
			} else {
				// 其他模式走原有逻辑
				this.getAiInfo();
				this.openVoiceDialog();
				if (option.continue !== 'true') {
					this.initializeNewChat(config);
				}
			}
		},
		// 载入AI角色列表（从接口获取）
		async loadAiChoices() {
			try {
				console.log('开始获取AI角色列表...');
				const response = await this.$H.get('aiButton/findPage', {
					pageSize: 100
				});

				if (response.code === 200 && response.rows) {
					// 遍历返回的数据，转换字段名
					this.aiRoleList = response.rows.map(item => {
						return {
							...item,
							img: item.imgUrl || item.img, // imgUrl改为img
							logo: item.logoUrl || item.logo // logoUrl改为logo
						};
					});
					console.log('AI角色列表获取成功:', this.aiRoleList);
				} else {
					console.error('获取AI角色列表失败:', response);
					this.aiRoleList = [];
					uni.showToast({
						title: '获取AI角色失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('载入AI角色列表出错:', error);
				this.aiRoleList = [];
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				});
			}
		},
		// 获取本地缓存的AI角色 (支持不同模式隔离)
		getCachedAiRole() {
			try {
				const storageKey = `${this.mode.toLowerCase()}-ai-role`;
				const cachedRole = uni.getStorageSync(storageKey);
				if (cachedRole) {
					console.log(`读取到${this.mode}模式本地缓存的AI角色:`, cachedRole);
					return cachedRole;
				}
			} catch (e) {
				console.error('读取本地缓存AI角色失败:', e);
			}
			return null;
		},
		// 保存AI角色到本地缓存 (支持不同模式隔离)
		saveAiRoleToCache(role) {
			try {
				const storageKey = `${this.mode.toLowerCase()}-ai-role`;
				uni.setStorageSync(storageKey, role);
				console.log(`${this.mode}模式AI角色已保存到本地缓存:`, role);
			} catch (e) {
				console.error('保存AI角色到本地缓存失败:', e);
			}
		},
		// 清除本地缓存的AI角色 (支持不同模式隔离)
		clearCachedAiRole() {
			try {
				const storageKey = `${this.mode.toLowerCase()}-ai-role`;
				uni.removeStorageSync(storageKey);
				console.log(`已清除${this.mode}模式本地缓存的AI角色`);
			} catch (e) {
				console.error('清除本地缓存AI角色失败:', e);
			}
		},
		// 重新选择角色
		async reselectRole() {
			uni.showModal({
				title: '提示',
				content: '确定要重新选择AI角色吗？这将清除当前的角色设置。',
				success: async (res) => {
					if (res.confirm) {
						// 清除缓存
						this.clearCachedAiRole();
						// 重置当前角色信息
						this.aiInfo = {};
						if (this.mode === 'CC') {
							this.cc = this.$f.geturl("/uniapp/new/ai/ai-cc.png");
						}
						// 重新加载角色列表
						await this.loadAiChoices();
						// 显示角色选择器
						this.showRolePicker = true;
					}
				}
			});
		},
		// 选择角色后赋值并继续初始化
		selectRole(item) {
			if (!item) return;
			this.aiInfo = item;
			// 更新store中的AI角色信息
			this.$store.state.currentAiInfo = item;
			// CC模式大图使用json中的logo
			if (this.mode === 'CC') {
				this.cc = item.logo;
			}
			// 保存选择的角色到本地缓存
			this.saveAiRoleToCache(item);
			this.showRolePicker = false;
			this.startChatAfterSelection();
			this.openVoiceDialog();
		},
		startChatAfterSelection() {
			const config = this.pendingConfig || {
				mode: this.mode
			};
			// 若是继续会话则复用旧session
			if (this.pendingContinue && this.savedContinueData) {
				ai.sessionId = this.savedContinueData.sessionId;
				config.sessionId = this.savedContinueData.sessionId;
				setTimeout(() => {
					if (!this.$store.state.isOhCardSocketOpenetOpen) {
						ai.initWebSocket(config)
					}
				}, 1000)
			} else {
				this.initializeNewChat(config);
			}
		},
		initializeNewChat(config) {
			if (this.mode == 'OH') this.getImg();
			ai.getSessionId().then(() => {
				setTimeout(() => {
					// 不在这里添加空消息，让doAnswer方法来添加完整的消息
					// 添加图卡和字卡URL到配置中
					config.wordCard = this.wordCard;
					config.pictureCard = this.pictureCard;
					ai.initWebSocket(config)
				}, 1000)
			}).catch((error) => {
				// 处理获取sessionId失败的情况
				console.log('获取sessionId失败:', error);
				if (error && error.needPay && error.code === 666) {
					// 需要付费，记录提示并允许跳转
					this.needPayment = true;
					this.paymentData = error.payData || null;
					// 关闭语音弹窗与录制
					try {
						this.endVoiceDialog();
					} catch (e) { }
					this.closeVoiceDialog();
					// 可选：自动跳到支付
					this.goToPayForAI(error.payData);
				} else {
					// 其他错误
					uni.showToast({
						title: error.msg || '初始化失败，请重试',
						icon: 'none'
					});
				}
			});
		},
		// 静默检查是否已支付或仍需要付费
		silentPaymentCheck() {
			ai.getSessionId()
				.then(() => {
					// 已有权限，清除提示
					this.needPayment = false;
					this.paymentData = null;
				})
				.catch((error) => {
					if (error && error.needPay && error.code === 666) {
						this.needPayment = true;
						this.paymentData = error.payData || null;
						// 关闭语音弹窗与录制
						try {
							this.endVoiceDialog();
						} catch (e) { }
						this.closeVoiceDialog();
					}
				});
		},
		// 跳转到AI模式的支付页面
		goToPayForAI(payData) {
			const amount = payData.amount || 0;
			const productType = payData.productType || 2; // AI模式默认为2
			// 根据当前AI模式和页面路径构建productId
			const productId = (payData && payData.productId) ? payData.productId : (productType === 2 ? 2 : (this
				.mode || 'OH'));
			const duration = payData.duration || 0;
			const unit = payData.unit || '分钟';
			// 关闭语音弹窗与录制
			try {
				this.endVoiceDialog();
			} catch (e) { }
			this.closeVoiceDialog();

			const payUrl =
				`/main/pay/pay?price=${amount}&productType=${productType}&productId=${productId}&duration=${duration}&unit=${encodeURIComponent(unit)}&mode=${encodeURIComponent(this.mode || '')}`;
			console.log('跳转到AI支付页面:', payUrl);

			uni.navigateTo({
				url: payUrl,
			});
		},
		getResult(msg) {
			// 已经触发过结果，直接返回，避免重复
			if (this.hasGotResult) {
				return;
			}
			// 若存在未完成AI回复，禁止重复push与重复send
			if (this.isAnswering || this.hasPendingAiMessage()) {
				return;
			}
			// 清除本地缓存的所有数据
			uni.removeStorageSync('ohCardChatData');

			// 生成AI消息的唯一id
			const aiMsgId = this.generateMessageId();
			this.$refs.paging.addChatRecordData({
				time: '',
				icon: this.aiInfo.img,
				name: this.aiInfo.name,
				content: '',
				isMe: false,
				status: 'pending',
				question: msg + '<explain>',
				type: 'characters',
				id: aiMsgId,
				retryCount: 0,
				startTime: Date.now(),
				lastUpdateTime: Date.now()
			});
			const aiMsgIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			this.trySendAIMessage(aiMsgIdx, aiMsgId, null, msg + '<explain>', 'characters');

			this.hasGotResult = true;
			setTimeout(() => {
				uni.redirectTo({
					url: `/ai/ohCard/result/result?mode=${this.mode}&sessionId=${ai.getOldSessionId()}` +
						(this.archiveId ? `&archiveId=${this.archiveId}` : '')
				})
			}, 100)
		},
		initWebSocket() {
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
			if (!this.$store.state.token) {
				console.error('Token不存在，WebSocket无法连接');
				// 让用户登录
				uni.showModal({
					title: '提示',
					content: '请先登录',
					showCancel: false,
					success: () => {
						uni.navigateTo({
							url: '/pages/user/go-login'
						});
					}
				});

				return;
			}

			isInitiating = true;
			isReconnecting = false;

			// 确保之前的连接完全清理
			this.cleanup();

			// 建立新连接
			socketAi = uni.connectSocket({
				url: config.websocketOhCard + this.$store.state.token,
				success: res => {
					console.log('WebSocket连接请求成功1:', config.websocketOhCard + this.$store.state.token,
						res);
					this.isAnswering = false;
					setTimeout(() => {
						if (this.history.length == 0) {
							this.doAnswer("你好OH卡师，我抽到了一张图卡和一张字卡。");
						}
					}, 800)
				},
				fail: res => {
					console.error('WebSocket连接请求失败:', res);
					// 延迟一下再重连，避免立即重连
					setTimeout(() => {
						this.reconnect();
					}, 1000);
				}
			});

			// 只在首次调用时绑定事件监听器
			if (!isEventBound) {
				// console.log('首次绑定WebSocket事件监听器');

				socketAi.onOpen(() => {
					console.log('WebSocket打开成功');
					// this.$store.state.isOhCardSocketOpenetOpen = true;
					reconnectAttempts = 0;
					isReconnecting = false;
					isInitiating = false;
					this.sendHeader();
				});

				socketAi.onClose(() => {
					console.log('WebSocket连接已关闭');
					// this.$store.isOhCardSocketOpenrdSocketOpen = false;
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

				socketAi.onError((error) => {
					console.error('WebSocket连接错误:', error);
					// $isOhCardSocketOpenisOhCardSocketOpen = false;
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

				socketAi.onMessage((res) => {
					try {
						let data = JSON.parse(res.data);
						this.handleMessage(data);
					} catch (error) {
						console.error('消息解析错误:', error);
						console.error('原始消息内容:', res.data);
					}
				});

				this.isEventBound = true;
			}
		},
		//心跳检测
		sendHeader() {
			// 清理已存在的心跳定时器
			if (headerTimer) {
				clearInterval(headerTimer);
				headerTimer = null;
			}

			headerTimer = setInterval(() => {
				// 只在连接开启状态下发送心跳
				if (!this.$store.state.isOhCardSocketOpen) {
					clearInterval(headerTimer);
					headerTimer = null;
					return;
				}

				let message = {
					type: 'heartbeat',
					data: {}
				}
				socketAi.send({
					data: JSON.stringify(message),
					success: () => {
						console.log("发送心跳成功");
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
		reconnect() {
			console.log("开始重连", reconnectAttempts, MAX_RECONNECT_ATTEMPTS)
			// 先清理之前的定时器
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}

			// 重置状态
			isReconnecting = false;
			isInitiating = false;

			// if (reconnectAttempts = MAX_RECONNECT_ATTEMPTS) {
			// 	console.log('达到最大重连次数，重置所有状态');
			// 	reconnectAttempts = 0;
			// 	return;
			// }

			// 清理心跳定时器
			if (headerTimer) {
				clearInterval(headerTimer);
				headerTimer = null;
			}

			console.log(`准备第${reconnectAttempts + 1}次重连`);
			reconnectTimer = setTimeout(() => {
				reconnectAttempts++;
				this.initWebSocket();
			}, RECONNECT_INTERVAL);
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

			if (this.$store.state.isOhCardSocketOpen) {
				uni.closeSocket();
			}

			this.$store.state.isOhCardSocketOpen = false;
			isReconnecting = false;
			isInitiating = false;
		},
		getAiInfo() {
			this.$H.get('appusermenu/list', {
				code: 'oh-card-ai',
				status: 1
			})
				.then(res => {
					if (res.code == 200 && res.rows) {
						let arr = res.rows[0].appUserMenuList;
						let index = arr.findIndex(item => item.code == "oh-card-ai-" + this.mode) || 0;
						this.aiInfo = arr[index];
						// 更新store中的AI角色信息
						this.$store.state.currentAiInfo = arr[index];
					}
				});
		},
		getImg() {
			let wordIndex = uni.$u.random(1, card[this.options.cardType].zika);
			let imgIndex = uni.$u.random(1, card[this.options.cardType].tuka);
			this.wordCard = this.$f.geturl(
				`/uniapp/new/ai-card2/${this.options.cardType}/zika/zika_background01_${wordIndex}.png`
			);
			this.pictureCard = this.$f.geturl(
				`/uniapp/new/ai-card2/${this.options.cardType}/tuka/tuka_${imgIndex.toString().padStart(2, '0')}.jpg`
			);
		},
		queryList(pageNo, pageSize) {
			const params = {
				pageNo: pageNo,
				pageSize: pageSize,
			}
			this.$request.queryChatList(params).then(res => {
				this.$refs.paging.complete([]);
			}).catch(res => {
				this.$refs.paging.complete(false);
			})
		},
		keyboardHeightChange(res) {
			this.$refs.inputBar.updateKeyboardHeightChange(res);
		},
		hidedKeyboard() {
			this.$refs.inputBar.hidedKeyboard();
		},
		// 发送新消息
		doSend(msg, type) {
			// 若存在未完成AI回复，禁止重复push与重复send
			if (this.isAnswering || this.hasPendingAiMessage()) {
				return;
			}
			if (!msg || msg.trim() === '') {
				return;
			}
			// 防抖：同一内容+类型在1秒内不重复发送
			const now = Date.now();
			const key = `${(type || 'characters')}__${msg.trim()}`;
			if (this.lastSentKey === key && (now - this.lastSentAt) < 1000) {
				return;
			}
			this.lastSentKey = key;
			this.lastSentAt = now;
			this.askMsg = msg;
			// 生成用户消息的唯一id
			const userMsgId = this.generateMessageId();
			this.$refs.paging.addChatRecordData({
				time: '',
				icon: this.userInfo.avatar,
				name: this.userInfo.username,
				content: msg,
				isMe: true,
				status: 'success',
				id: userMsgId,
				aiStatus: 'pending' // 添加AI状态跟踪
			});
			// 生成AI消息的唯一id
			const aiMsgId = this.generateMessageId();
			this.$refs.paging.addChatRecordData({
				time: '',
				icon: this.aiInfo.img,
				name: this.aiInfo.name,
				content: '',
				isMe: false,
				status: 'pending',
				question: msg,
				type: type || 'characters',
				id: aiMsgId,
				retryCount: 0,
				userMsgId: userMsgId, // 关联用户消息ID
				startTime: Date.now(), // 添加开始时间
				lastUpdateTime: Date.now()
			});
			const aiMsgIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			this.trySendAIMessage(aiMsgIdx, aiMsgId, userMsgId, msg, type);

			// 启动全局超时监控
			this.startGlobalTimeoutMonitor();
		},
		// 封装自动重试逻辑
		trySendAIMessage(aiMsgIdx, aiMsgId, userMsgId, question, type) {
			// 清理之前的定时器
			this.clearMessageTimeout(aiMsgId);

			// 更新开始时间（重试时）
			if (aiMsgIdx !== -1) {
				this.$set(this.dataList[aiMsgIdx], 'startTime', Date.now());
				console.log(`消息 ${aiMsgId} 重试开始，重试次数: ${this.dataList[aiMsgIdx].retryCount}`);
			}

			// 设置新的超时定时器
			const currentItem = this.dataList[aiMsgIdx] || {
				retryCount: 0
			};
			const timeout = this.getTimeoutForMessage(currentItem);
			console.log(`消息 ${aiMsgId} 设置超时时间: ${timeout}ms`);

			const timeoutId = setTimeout(() => {
				const aiIdx = this.dataList.findIndex(item => item.id === aiMsgId);
				if (aiIdx !== -1 && this.dataList[aiIdx].status === 'pending') {
					// 若有lastUpdateTime且在窗口内有更新，则认为仍在流式，刷新定时器而不是触发重试
					const item = this.dataList[aiIdx];
					if (item.lastUpdateTime && Date.now() - item.lastUpdateTime < this.baseTimeout) {
						// 续期：重新设置定时器
						this.refreshMessageTimeout(aiMsgId);
						return;
					}
					console.log(`消息 ${aiMsgId} 超时，开始重试逻辑`);
					this.handleMessageTimeout(this.dataList[aiIdx]);
				}
				this.timeoutMap.delete(aiMsgId);
			}, timeout);

			this.timeoutMap.set(aiMsgId, timeoutId);

			// 优先使用消息上记录的type，避免重试时type丢失
			const finalType = (aiMsgIdx !== -1 && this.dataList[aiMsgIdx] && this.dataList[aiMsgIdx].type) ? this
				.dataList[aiMsgIdx].type : (type || 'characters');
			ai.doAnswer(question, finalType, this.options.cardType, this.wordCard, this.pictureCard, {
				onFail: () => {
					console.log(`消息 ${aiMsgId} 发送失败，触发重试逻辑`);
					this.clearMessageTimeout(aiMsgId);
					const aiIdx = this.dataList.findIndex(item => item.id === aiMsgId);
					if (aiIdx !== -1 && this.dataList[aiIdx].status === 'pending') {
						this.handleMessageTimeout(this.dataList[aiIdx]);
					}
				}
			});
		},
		// 刷新指定消息的超时定时器，并更新其lastUpdateTime
		refreshMessageTimeout(aiMsgId) {
			const aiIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			if (aiIdx === -1) return;
			this.$set(this.dataList[aiIdx], 'lastUpdateTime', Date.now());
			this.clearMessageTimeout(aiMsgId);
			const timeout = this.getTimeoutForMessage(this.dataList[aiIdx]);
			const timeoutId = setTimeout(() => {
				const idx = this.dataList.findIndex(m => m.id === aiMsgId);
				if (idx !== -1 && this.dataList[idx].status === 'pending') {
					// 再次检测是否仍在流式
					if (this.dataList[idx].lastUpdateTime && Date.now() - this.dataList[idx].lastUpdateTime <
						this.baseTimeout) {
						this.refreshMessageTimeout(aiMsgId);
						return;
					}
					this.handleMessageTimeout(this.dataList[idx]);
				}
				this.timeoutMap.delete(aiMsgId);
			}, timeout);
			this.timeoutMap.set(aiMsgId, timeoutId);
		},
		// 标记用户消息为失败状态
		markUserMessageFailed(userMsgId, aiMsgId) {
			console.log(`标记用户消息失败: userMsgId=${userMsgId}, aiMsgId=${aiMsgId}`);
			// 找到用户消息并标记AI响应为失败
			const userIdx = this.dataList.findIndex(item => item.id === userMsgId);
			if (userIdx !== -1) {
				// 用户消息本身保持成功状态，只有AI响应状态标记为失败
				this.$set(this.dataList[userIdx], 'status', 'success'); // 确保用户消息状态为成功
				this.$set(this.dataList[userIdx], 'aiStatus', 'fail');
				this.$set(this.dataList[userIdx], 'retryCount', this.maxRetryCount);
				this.$set(this.dataList[userIdx], 'failedAiMsgId', aiMsgId);
				console.log(`用户消息 ${userMsgId} AI响应已标记为失败，用户消息状态保持成功`);
			}
			// 处理失败的AI消息
			const aiIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			if (aiIdx !== -1) {
				// 清理该消息的定时器
				this.clearMessageTimeout(aiMsgId);
				// 删除失败的AI消息
				console.log(`删除失败的AI消息 ${aiMsgId}，索引: ${aiIdx}`);
				this.dataList.splice(aiIdx, 1);
			}
			this.$store.state.isAnswering = false;
			console.log(`消息失败处理完成，isAnswering设置为false`);
		},
		// 回复消息（主要用于初始化对话）
		doAnswer(msg, type = 'voice') {
			console.log(`doAnswer被调用，消息: "${msg}"`);
			// 若存在未完成AI回复，禁止重复push与重复send
			if (this.hasPendingAiMessage()) {
				console.log('存在未完成AI消息，跳过新的doAnswer');
				return;
			}
			this.history.push({
				"user": msg
			});
			this.$store.state.isAnswering = true;
			// 注意：这个方法主要用于初始化，不添加用户消息，直接添加AI消息
			const aiMsgId = this.generateMessageId();
			console.log(`添加初始AI消息，ID: ${aiMsgId}, question: "${msg}"`);
			this.$refs.paging.addChatRecordData({
				time: '',
				icon: this.aiInfo.img,
				name: this.aiInfo.name,
				content: '',
				isMe: false,
				status: 'pending',
				question: msg,
				type: type || 'voice',
				id: aiMsgId,
				retryCount: 0,
				startTime: Date.now(), // 添加开始时间
				lastUpdateTime: Date.now()
			});

			// 确保数据同步
			setTimeout(() => {
				console.log('当前dataList长度:', this.dataList.length);
				console.log('当前store.aiDataList长度:', this.$store.state.aiDataList.length);
				const aiMsgIdx = this.dataList.findIndex(item => item.id === aiMsgId);
				console.log(`找到AI消息索引: ${aiMsgIdx}`);
				if (aiMsgIdx !== -1) {
					this.trySendAIMessage(aiMsgIdx, aiMsgId, null, msg, type);
					// 启动全局超时监控
					this.startGlobalTimeoutMonitor();
				} else {
					console.error('未找到刚添加的AI消息，可能存在同步问题');
				}
			}, 100);
		},
		// 处理AI回复
		deepEqual(a, b) {
			// 简单深比较（只用于question字符串）
			return a === b;
		},
		handleMessage(data) {
			console.log("收到AI回复:", data);

			// 检查是否为孤儿响应
			if (this.isOrphanResponse(data)) {
				this.logOrphanResponse(data);
				return;
			}

			// 检查是否已经处理过这个响应
			const responseId = `${data.question}_${data.node_is_finish ? 'finish' : 'partial'}_${Date.now()}`;

			for (let i = 0; i < this.dataList.length; i++) {
				const item = this.dataList[i];
				// 只处理非用户消息、状态为pending、且问题匹配的消息
				if (!item.isMe && item.status === 'pending' && this.deepEqual(item.question, data.question)) {
					console.log(`找到匹配消息: ID=${item.id}, 状态=${item.status}`);

					// 检查消息是否已经被标记为处理完成
					if (this.isMessageProcessed(item.id) && data.node_is_finish) {
						console.log(`消息 ${item.id} 已经处理完成，忽略延迟响应`);
						break;
					}

					// 双重检查：确保消息状态仍然是pending和索引仍然有效（防止并发问题和消息删除）
					if (i >= this.dataList.length || !this.dataList[i] || this.dataList[i].status !== 'pending') {
						console.log(`消息 ${item.id} 已被删除或状态已变化，忽略响应`);
						break;
					}

					this.dataList[i].content = (this.dataList[i].content || '') + (data.content || '');
					// 记录流式更新时间以续期超时窗口
					this.$set(this.dataList[i], 'lastUpdateTime', Date.now());
					if (data.node_is_finish) {
						// 最终检查：确保消息在处理过程中没有被删除或标记为失败
						if (i < this.dataList.length && this.dataList[i] && this.dataList[i].status === 'pending') {
							console.log(`消息 ${item.id} 接收完成，标记为成功`);
							this.$set(this.dataList[i], 'status', 'success');
							// 标记消息为已处理
							this.markMessageAsProcessed(item.id);
							// 清理该消息的超时定时器
							this.clearMessageTimeout(item.id);
							this.isAnswering = false;
							// 重置超时倍数（成功收到回复）
							this.resetTimeoutMultiplier();
							// 标记关联的用户消息为成功
							if (item.userMsgId) {
								const userIdx = this.dataList.findIndex(userItem => userItem.id === item.userMsgId);
								if (userIdx !== -1) {
									this.$set(this.dataList[userIdx], 'aiStatus', 'success');
								}
							}
						} else {
							console.log(`消息 ${item.id} 已被删除或状态已变化，忽略完成响应`);
						}
					}
					break;
				}
			}
		},
		saveChatData() {
			console.log("保存数据", this.dataList, this.dataList.length > 0, !this.hasGotResult, this.dataList && this
				.dataList.length > 0 && !this.hasGotResult);
			if (this.dataList && this.dataList.length > 0 && this.hasGotResult) {
				const chatData = {
					chatHistory: this.dataList,
					wordCard: this.wordCard,
					pictureCard: this.pictureCard,
					sessionId: ai.getOldSessionId(),
					aiHistory: this.$store.state.aiHistory,
				};
				uni.setStorageSync('ohCardChatData-' + this.mode, chatData);
				console.log("保存数据成功", chatData);
			}
		},
		// 模拟生成流式数据，根据一个已知字符串每150毫秒返回一个字符
		async streamTextAsync(text, callback, interval = 150) {
			for (const char of text) {
				callback(char); // 逐个返回字符
				await new Promise(resolve => setTimeout(resolve, interval)); // 等待
			}
		},
		// 重发消息
		resendMessage(index) {
			const userItem = this.dataList[index];
			if (!userItem || !userItem.isMe || userItem.aiStatus !== 'fail') return;

			console.log(
				`重新发送消息: userMsgId=${userItem.id}, 原aiStatus=${userItem.aiStatus}, 原status=${userItem.status}`);

			// 确保用户消息本身的状态为成功（重新发送成功）
			this.$set(this.dataList[index], 'status', 'success');
			// 重发时将AI状态设为pending，等AI响应成功后再设为success
			this.$set(this.dataList[index], 'aiStatus', 'pending');
			this.$set(this.dataList[index], 'retryCount', 0);
			// 清除失败相关的标记
			if (this.dataList[index].failedAiMsgId) {
				this.$delete(this.dataList[index], 'failedAiMsgId');
			}

			console.log(
				`用户消息状态已更新 - status: ${this.dataList[index].status}, aiStatus: ${this.dataList[index].aiStatus}`);

			// 重新创建AI消息
			const aiMsgId = Date.now() + Math.random();
			this.$refs.paging.addChatRecordData({
				time: '',
				icon: this.aiInfo.img,
				name: this.aiInfo.name,
				content: '',
				isMe: false,
				status: 'pending',
				question: userItem.content,
				id: aiMsgId,
				retryCount: 0,
				userMsgId: userItem.id,
				startTime: Date.now() // 添加开始时间
			});

			const aiMsgIdx = this.dataList.findIndex(item => item.id === aiMsgId);
			// this.trySendAIMessage(aiMsgIdx, aiMsgId, userItem.id, userItem.content);

			// 启动全局超时监控
			// this.startGlobalTimeoutMonitor();
		}
	},
	onUnload() {
		// 退出页面时，强制停止并清理所有正在播放的语音
		this.interruptAi();
		// 保存所有相关数据到本地缓存
		this.saveChatData();
		// 清理所有定时器
		this.clearAllTimeouts();
		// 清理处理记录
		this.processedMessageIds.clear();
		console.log("卸载页面");
	}
}
</script>

<style lang="scss" scoped>
// 沉浸式语音UI
.vr-mask {
	position: fixed;
	inset: 0;
	background: linear-gradient(135deg,
			rgba(30, 35, 65, 0.95) 0%,
			rgba(45, 55, 85, 0.95) 25%,
			rgba(60, 70, 110, 0.95) 50%,
			rgba(75, 85, 135, 0.95) 75%,
			rgba(90, 100, 160, 0.95) 100%);
	backdrop-filter: blur(10rpx);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		backdrop-filter: blur(0);
	}

	to {
		opacity: 1;
		backdrop-filter: blur(10rpx);
	}
}

.vr-wrap {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	color: #fff;
	padding-top: 180rpx;
	background: radial-gradient(ellipse 800rpx 600rpx at center 30%,
			rgba(118, 145, 255, 0.15) 0%,
			rgba(118, 145, 255, 0.08) 50%,
			transparent 100%);
}

.vr-title {
	position: absolute;
	top: 80rpx;
	font-size: 40rpx;
	font-weight: 600;
	opacity: .9;
}

.vr-orb {
	width: 480rpx;
	height: 480rpx;
	border-radius: 50%;
	background: radial-gradient(50% 50% at 50% 50%, rgba(60, 80, 255, .65) 0%, rgba(20, 20, 40, .25) 70%, rgba(0, 0, 0, .0) 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.vr-orb-core {
	width: 320rpx;
	height: 320rpx;
	border-radius: 50%;
	background: radial-gradient(50% 50% at 50% 50%, #6ea7ff 0%, #2d65ff 50%, rgba(20, 20, 40, .8) 100%);
	filter: blur(2px);
	transition: transform .25s, box-shadow .25s;
}

.vr-orb-core.glow {
	transform: scale(1.05);
	box-shadow: 0 0 50rpx 10rpx rgba(80, 120, 255, .35), inset 0 0 50rpx rgba(255, 255, 255, .2);
}

.vr-dots {
	display: flex;
	gap: 18rpx;
	margin-top: 120rpx;
}

.vr-dots:not(.active) .vr-dot {
	animation: none !important;
}

.vr-dot {
	width: 12rpx;
	height: 12rpx;
	background: linear-gradient(135deg, #ffffff 0%, #e8f0ff 100%);
	border-radius: 50%;
	opacity: .7;
	animation: dotPulse 1.4s infinite ease-in-out;
	box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.3);
}

@keyframes dotPulse {

	0%,
	100% {
		transform: translateY(0) scale(1);
		opacity: .7;
		box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.3);
	}

	50% {
		transform: translateY(-12rpx) scale(1.2);
		opacity: 1;
		box-shadow: 0 0 20rpx rgba(255, 255, 255, 0.6);
	}
}

.vr-tip {
	margin-top: 40rpx;
	font-size: 30rpx;
	opacity: .95;
	text-align: center;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
	max-width: 600rpx;
	line-height: 1.4;
}

.vr-actions {
	position: absolute;
	bottom: 140rpx;
	display: flex;
	align-items: center;
	gap: 120rpx;
	padding: 20rpx 40rpx;
	background: rgba(255, 255, 255, 0.08);
	border-radius: 80rpx;
	backdrop-filter: blur(20rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.12);
}

.vr-btn {
	width: 140rpx;
	height: 140rpx;
	border-radius: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

.vr-btn::before {
	content: '';
	position: absolute;
	inset: 0;
	border-radius: 70rpx;
	padding: 2rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
	mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
	mask-composite: exclude;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.vr-btn:active::before {
	opacity: 1;
}

.vr-toggle {
	background: linear-gradient(135deg,
			rgba(118, 145, 255, 0.8) 0%,
			rgba(78, 120, 255, 0.9) 100%);
	border: 2rpx solid rgba(255, 255, 255, 0.25);
	box-shadow: 0 8rpx 32rpx rgba(118, 145, 255, 0.3),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.2);
}

.vr-toggle:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 16rpx rgba(118, 145, 255, 0.4),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
}

.vr-cancel {
	background: linear-gradient(135deg,
			rgba(255, 77, 90, 0.9) 0%,
			rgba(255, 45, 65, 1) 100%);
	border: 2rpx solid rgba(255, 255, 255, 0.25);
	box-shadow: 0 8rpx 32rpx rgba(255, 77, 90, 0.3),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.2);
}

.vr-cancel:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 16rpx rgba(255, 77, 90, 0.4),
		inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
}

.icon-pause {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.icon-pause view {
	width: 14rpx;
	height: 44rpx;
	background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
	border-radius: 6rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.icon-play {
	width: 48rpx;
	height: 48rpx;
	filter: drop-shadow(0 2rpx 8rpx rgba(0, 0, 0, 0.2));
}

/* 背景粒子效果 */
.vr-particles {
	position: absolute;
	inset: 0;
	pointer-events: none;
	overflow: hidden;
}

.vr-particle {
	position: absolute;
	bottom: 0;
	width: 6rpx;
	height: 6rpx;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 50%;
	box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.5);
	animation: particleFloat linear infinite;
}

@keyframes particleFloat {
	0% {
		transform: translateY(0) scale(0.5);
		opacity: 0;
	}

	10% {
		opacity: 1;
		transform: translateY(-100rpx) scale(1);
	}

	90% {
		opacity: 0.6;
		transform: translateY(-80vh) scale(0.8);
	}

	100% {
		transform: translateY(-100vh) scale(0.3);
		opacity: 0;
	}
}

/* 内容卡片样式增强 */
.vr-content-card {
	margin: 20rpx;
	animation: contentCardIn 0.5s ease-out;
}

@keyframes contentCardIn {
	from {
		opacity: 0;
		transform: translateY(40rpx) scale(0.9);
	}

	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.voice-fab {
	position: fixed;
	bottom: 180rpx;
	right: 40rpx;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50rpx;
	background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.voice-fab-icon {
	width: 54rpx;
	height: 54rpx;
}

.voice-dialog-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1001;
}

.voice-dialog {
	width: 86%;
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
}

.voice-dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 28rpx;
	border-bottom: 1px solid #f0f0f0;
}

.voice-dialog-title {
	font-size: 32rpx;
	font-weight: 600;
}

.voice-dialog-close {
	font-size: 40rpx;
	color: #999;
}

.voice-dialog-body {
	padding: 28rpx;
}

.voice-dialog-desc {
	margin-bottom: 16rpx;
	font-size: 26rpx;
	color: #666;
}

.voice-dialog-result {
	height: 200rpx;
	background: #f7f8fa;
	border-radius: 12rpx;
	padding: 20rpx;
}

.voice-dialog-result-text {
	font-size: 28rpx;
	color: #333;
}

.voice-record-area {
	margin-top: 24rpx;
	height: 220rpx;
	border-radius: 16rpx;
	background: #eef2ff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
}

.voice-record-mic {
	width: 72rpx;
	height: 72rpx;
	opacity: .9;
}

.voice-record-tip {
	margin-top: 14rpx;
	font-size: 26rpx;
	color: #556;
}

.voice-record-count {
	position: absolute;
	top: 16rpx;
	right: 20rpx;
	font-size: 24rpx;
	color: #556;
}

.voice-dialog-actions {
	margin-top: 24rpx;
	display: flex;
	justify-content: flex-end;
	gap: 20rpx;
}

.btn {
	min-width: 140rpx;
	height: 64rpx;
	border-radius: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 20rpx;
}

.btn-primary {
	background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
	color: #fff;
}

.btn-secondary {
	background: #f0f0f3;
	color: #333;
}

.disabled {
	opacity: .5;
}

// .container {
// 	position: relative;
// 	height: 100vh;
// 	background-color: $background;
// 	z-index: 1;
// 	padding: 0;
// 	margin: 0;
// }

// .container::before {
// 	content: '';
// 	position: absolute;
// 	top: 0;
// 	left: 0;
// 	width: 100%;
// 	height: 432rpx;
// 	z-index: -1;
// 	background-image: url('https://ceping.qinglan.cn/uniapp/new/index/1.png');
// 	background-size: cover;
// 	background-position: center;
// }

::v-deep .z-paging-content {
	position: relative;
	height: 100vh;
	background-color: $background;
	z-index: 1;
	padding: 0;
	margin: 0;
}

::v-deep .z-paging-content::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 432rpx;
	z-index: -1;
	background-image: url('https://ceping.qinglan.cn/uniapp/new/index/1.png');
	background-size: cover;
	background-position: center;
}

::v-deep .zp-page-bottom-container {
	background-color: $background !important;
}

.imgContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 400px;
	position: relative;
	margin-top: 20px;


	.background-card {
		height: 400px;
		width: 312px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 20px;
		overflow: hidden;
	}

	.foreground-card {
		height: 320px;
		width: 230.4px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		overflow: hidden;
		border: 2px solid #d05369;
		border-radius: 2px;
	}


	.background-card {
		z-index: 1;
	}

	.foreground-card {
		z-index: 2;
	}

	.background-image,
	.foreground-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.type-container {
	position: relative;

	.sheep {
		width: 200rpx;
		height: 255rpx;
		margin: 0 auto;
		z-index: -1;
		padding-top: 50rpx;
	}

	.desc {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 686rpx;
		height: 188rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		margin: 0 auto;
		margin-top: -20rpx;
		backdrop-filter: blur(30px);

		.name {
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			font-size: 52rpx;
			color: #1B1B26;

			view {
				margin-top: -40rpx;
				margin-right: 20rpx;
			}

			image {
				width: 40rpx;
				height: 32rpx;
			}
		}

		.detail {
			font-weight: 400;
			font-size: 28rpx;
			color: #5B5B6E;
		}
	}
}

/* 角色选择样式 */
.role-picker-mask {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, .5);
	z-index: 2100;
	display: flex;
	align-items: center;
	justify-content: center;
}

.role-picker {
	width: 86%;
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx 28rpx 12rpx;
}

.role-title {
	font-size: 34rpx;
	font-weight: 600;
	text-align: center;
	margin-bottom: 20rpx;
	color: #111;
}

.role-guide-text {
	font-size: 28rpx;
	color: #666;
	text-align: center;
	line-height: 1.5;
	margin-bottom: 28rpx;
	padding: 0 20rpx;
}

.role-swiper {
	width: 600rpx;
	height: 600rpx;
	margin-bottom: 12rpx;
}

.role-item {
	// background: #f7f8fa;
	border-radius: 20rpx;
	padding: 28rpx 20rpx;
	width: 300rpx;
	margin: 0 auto;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.role-logo {
	width: 200rpx;
	height: 300rpx;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
}

.role-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
}

.role-desc {
	font-size: 24rpx;
	color: #666;
	text-align: center;
	line-height: 1.4;
	margin-top: 8rpx;
	white-space: pre-wrap;
	word-break: break-word;
}

.role-reselect {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #f7f8fa;
	border-radius: 12rpx;
	text-align: center;
}

.role-reselect-text {
	font-size: 28rpx;
	color: #666;
}

/* 付费提示条 */
.pay-tip {
	padding: 0 24rpx;
	margin-top: 16rpx;
}

.pay-tip-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	background: #fff;
	border: 1rpx solid rgba(118, 145, 255, .25);
	border-radius: 16rpx;
	padding: 18rpx 20rpx;
	box-shadow: 0 6rpx 18rpx rgba(118, 145, 255, .08);
	flex-wrap: nowrap;
}

.pay-tip-inner .left {
	display: flex;
	align-items: center;
	gap: 12rpx;
	color: #556;
	font-size: 22rpx;
	flex: 1;
	min-width: 0;
}

.pay-tip-inner .left .txt {
	color: #1B1B26;
}

.pay-tip-inner .left .duration {
	color: #7691FF;
	margin-left: 4rpx;
}

.pay-tip-inner .right {
	padding: 12rpx 20rpx;
	background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
	color: #fff;
	border-radius: 12rpx;
	font-size: 26rpx;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	flex: 0 0 auto;
}
</style>