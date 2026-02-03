<!-- z-paging聊天输入框 -->

<template>
	<view class="chat-input-bar-container">
		<view class="top-buttons-container" v-if="showResult">
			<view :class="{ 'chat-input-send': true, 'chat-input-send-disabled': length <= 10 || disabled }"
				@click="getResult">
				<text class="chat-input-send-text">开始解析</text>
			</view>
			<view class="chat-input-send" @click="resetInput">
				<text class="chat-input-send-text">重置</text>
			</view>
		</view>
		<view class="chat-input-bar">
			<!-- 语音/键盘切换图标-->
			<view class="emoji-container">
				<image class="emoji-img" :src="`/static/${chatType === 'voice' ? 'keyboard' : 'voice'}.png`"
					@click="switchChatType"></image>
			</view> 
			<view class="chat-input-container" :style="{ background: recording ? '#c7c6c6' : '#FFFFFF' }">
				<!-- :adjust-position="false"必须设置，防止键盘弹窗自动上顶，交由z-paging内部处理 -->
				<textarea v-if="chatType === 'keyboard'" :focus="focus" class="chat-input" v-model="msg"
					:adjust-position="false" :auto-height="true" placeholder="请输入内容" @confirm="sendClick"
					maxlength="1000" confirm-type="none" :show-confirm-bar="false" :cursor-spacing="15" />
				<view v-else class="voice-title" @touchstart.stop.prevent="startVoice"
					@touchmove.stop.prevent="moveVoice" @touchend.stop="endVoice" @touchcancel.stop="cancelVoice">
					{{ voiceTitle }}
				</view>
			</view>
			<!-- 表情图标（如果不需要切换表情面板则不用写） -->
			<view class="emoji-container">
				<image class="emoji-img" :src="`/static/${emojiType === 'keyboard' ? 'keyboard' : 'emoji'}.png`"
					@click="emojiChange"></image>
			</view>
			<view :class="{ 'chat-input-send': true, 'chat-input-send-disabled': !sendEnabled }" @click="sendClick">
				<text class="chat-input-send-text">发送</text>
			</view>
		</view>
		<!--  表情面板，这里使用height控制隐藏显示是为了有高度变化的动画效果（如果不需要切换表情面板则不用写） -->
		<view class="emoji-panel-container" :style="[{ height: emojiType === 'keyboard' ? '400rpx' : '0px' }]">
			<scroll-view scroll-y style="height: 100%;flex: 1;">
				<view class="emoji-panel">
					<text class="emoji-panel-text" v-for="(item, index) in emojisArr" :key="index"
						@click="emojiClick(item)">
						{{ item }}
					</text>
				</view>
			</scroll-view>
		</view>

		<!-- 语音动画 -->
		<view class="voice_an" v-if="recording">
			<view class="voice_an_icon">
				<view class="wave wave1" :class="{ 'wave-animation': downtime !== -1 }"></view>
				<view class="wave wave2" :class="{ 'wave-animation': downtime !== -1 }"></view>
				<view class="wave wave3" :class="{ 'wave-animation': downtime !== -1 }"></view>
				<view class="wave wave4" :class="{ 'wave-animation': downtime !== -1 }"></view>
				<view class="wave wave5" :class="{ 'wave-animation': downtime !== -1 }"></view>
				<view class="wave wave6" :class="{ 'wave-animation': downtime !== -1 }"></view>
				<view class="wave wave7" :class="{ 'wave-animation': downtime !== -1 }"></view>
			</view>
			<view class="text" v-if="downtime == -1">建立连接中，请稍等</view>
			<view class="text" v-else>
				{{ voiceIconText }}
				<text v-if="voiceIconText.includes('正在录音')">剩余{{ downtime }}秒</text>
			</view>
		</view>

		<!-- 语音转文字组件 -->
		<voice-to-word ref="yueAsrRefs" :options="optionsxf" @countDown="countDown" @result="resultMsg" @onStop="onStop"
			@onOpen="onOpen" @change="change" style="opacity: 0;"></voice-to-word>
	</view>
</template>

<script>
import voiceToWord from '@/ai/components/voice-to-word/voice-to-word.vue';
export default {
	name: "chat-input-bar",
	components: {
		voiceToWord
	},
	props: {
		disabled: {
			type: Boolean,
			default: false
		},
		length: {
			type: Number,
			default: 0
		},
		showResult: {
			type: Boolean,
			default: true
		}
	},
	data() {
		let second = 60;
		return {
			msg: '',
			chatType: 'keyboard', // 当前输入类型：keyboard-键盘输入，voice-语音输入
			voiceTitle: '按住 说话',
			recording: false, // 是否正在录音
			isStopVoice: false, // 加锁 防止点击过快引起的当录音正在准备(还没有开始录音)的时候,却调用了stop方法但并不能阻止录音的问题
			canSend: true, // 是否可以发送
			PointY: 0, // 坐标位置
			voiceIconText: "正在录音...",

			// 语音转文字相关
			optionsxf: {
				receordingDuration: 120,
				APPID: 'a53f7e7d',
				API_SECRET: 'NjFjZTNjZTAwNzkyYWMxMTZhNDFiYjcx',
				API_KEY: '009746aded79367ab274a1a767a191a3',
				maxReconnectAttempts: 3, // 最大重连次数
				reconnectInterval: 2000, // 重连间隔（毫秒）
				connectionTimeout: 10000 // 连接超时时间（毫秒）
			},
			downtime: -1, //默认-1
			downed: false,
			second: 60,

			// 表情数组（如果不需要切换表情面板则不用写）
			emojisArr: ['😊', '😁', '😀', '😃', '😣', '😞', '😩', '😫', '😲', '😟', '😦', '😜', '😳', '😋', '😥', '😰',
				'🤠', '😎', '😇', '😉', '😭', '😈', '😕', '😏', '😘', '😤', '😡', '😅', '😬', '😺', '😻', '😽',
				'😼', '🙈', '🙉', '🙊', '🔥', '👍', '👎', '👌', '✌️', '🙏', '💪', '👻'
			],
			// 当前input focus（如果不需要切换表情面板则不用写）
			focus: false,
			// 当前表情/键盘点击后的切换类型，为空字符串代表展示表情logo但是不展示不展示表情面板（如果不需要切换表情面板则不用写）
			emojiType: '',
		};
	},
	computed: {
		sendEnabled() {
			return !this.disabled && this.msg.trim().length;
		}
	},
	mounted() {
		// #ifdef APP
		plus.android.requestPermissions(["android.permission.RECORD_AUDIO"], (e) => { }, (e) => { })
		// #endif
	},
	methods: {
		resetInput() {
			uni.showModal({
				title: '提示',
				content: '重置会回退至上页，当前会话清空，是否继续？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateBack()
					}
				}
			})
		},
		getResult() {
			if (this.length <= 5 || this.disabled) {
				uni.showToast({
					title: '为解析结果更准确\n请再对话一些内容',
					icon: 'none',
					duration: 2000
				});
				return;
			}
			this.$emit('getResult', this.msg);
		},
		// 切换语音/键盘输入
		switchChatType() {
			// #ifdef APP-PLUS || H5 || MP-WEIXIN
			this.chatType = this.chatType === 'keyboard' ? 'voice' : 'keyboard';
			if (this.chatType === 'keyboard') {
				this.focus = true;
			} else {
				this.focus = false;
				uni.hideKeyboard();
			}
			// #endif

			// #ifndef APP-PLUS || H5 || MP-WEIXIN
			uni.showToast({
				title: '语音模式请下载APP进行体验',
				icon: 'none'
			});
			// #endif
		},
		// 开始录音
		startVoice(e) {
			if (this.disabled) {
				uni.showToast({
					title: 'AI正在思考中，请稍后...',
					icon: 'none'
				});
				return;
			}
			this.recording = true;
			this.isStopVoice = false;
			this.canSend = true;
			this.voiceIconText = "正在录音..."
			this.PointY = e.touches[0].clientY;
			this.downed = true;
			this._triggerAsr('start');
		},
		// 移动手指
		moveVoice(e) {
			const PointY = e.touches[0].clientY
			const slideY = this.PointY - PointY;
			if (slideY > uni.upx2px(120)) {
				this.canSend = false;
				this.voiceIconText = '松开手指 取消发送'
			} else if (slideY > uni.upx2px(60)) {
				this.canSend = true;
				this.voiceIconText = '手指上滑 取消发送'
			} else {
				this.voiceIconText = '正在录音...'
			}
		},
		// 结束录音
		endVoice() {
			this.isStopVoice = true;
			this.voiceTitle = '按住 说话'
			this._triggerAsr('end');
		},
		// 取消录音
		cancelVoice() {
			this.voiceTitle = '按住 说话';
			this.msg = '';
			this.canSend = false;
			this._triggerAsr('end');
		},
		// 兼容各端调用ASR子组件方法
		_triggerAsr(action) {
			const ref = this.$refs.yueAsrRefs;
			if (!ref) return;
			if (typeof ref[action] === 'function') {
				ref[action]();
				return;
			}
			if (ref.$vm && typeof ref.$vm[action] === 'function') {
				ref.$vm[action]();
				return;
			}
		},
		// 更新了键盘高度（如果不需要切换表情面板则不用写）
		updateKeyboardHeightChange(res) {
			if (res.height > 0) {
				// 键盘展开，将emojiType设置为emoji
				this.emojiType = 'emoji';
			}
		},
		// 用户尝试隐藏键盘，此时如果表情面板在展示中，应当隐藏表情面板，如果是键盘在展示中不用处理，z-paging内部已经处理（如果不需要切换表情面板则不用写）
		hidedKeyboard() {
			if (this.emojiType === 'keyboard') {
				this.emojiType = '';
			}
		},
		// 点击了切换表情面板/键盘（如果不需要切换表情面板则不用写）
		emojiChange() {
			this.$emit('emojiTypeChange', this.emojiType);
			if (this.emojiType === 'keyboard') {
				// 点击了键盘，展示键盘
				this.focus = true;
				this.chatType = 'keyboard';
			} else {
				// 点击了切换表情面板
				this.focus = false;
				// 隐藏键盘
				uni.hideKeyboard();
			}
			this.emojiType = (!this.emojiType || this.emojiType === 'emoji') ? 'keyboard' : 'emoji';
		},
		// 点击了某个表情，将其插入输入内容中（如果不需要切换表情面板则不用写）
		emojiClick(text) {
			this.msg += text;
		},

		// 点击了发送按钮
		sendClick() {
			if (!this.sendEnabled) return;
			this.$emit('send', this.msg, 'characters');
			this.msg = '';
		},

		// 语音转文字相关方法
		resumeUi() {
			console.log('resumeUi', this.msg);
			this.downed = false;
			this.downtime = -1;
			this.recording = false;
			// 仅在未取消且有内容时发送，避免重复或误发送
			if (this.canSend && this.msg && this.msg.trim().length) {
				this.$emit('send', this.msg, 'voice');
			}
			this.msg = '';
		},
		countDown(e) {
			console.log('countDown', e);
			this.downtime = e;
			this.$emit('asrCountDown', e);
		},
		onStop(e) {
			console.log('onStop', e);
			this.resumeUi();
			this.$emit('asrStop', e);
		},
		onOpen(e) {
			console.log('onOpen', e);
			this.$emit('asrOpen', e);
		},
		change(e) {
			console.log('change', e);
			this.$emit('asrChange', e);
		},
		resultMsg(e) {
			this.msg = e;
			console.log('resultMsg', e);
			this.$emit('asrResult', e);
		}
	}
}
</script>

<style lang="scss" scoped>
.top-buttons-container {
	display: flex;
	flex-direction: row;
	// justify-content: space-between;
	align-items: center;
	padding: 10rpx 20rpx;
	background-color: $background;
	gap: 10rpx;
}

.chat-input-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	// border-top: solid 1px #f5f5f5;
	background-color: $background;
	padding: 10rpx 20rpx;
}

.chat-input-container {
	flex: 1;
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	padding: 15rpx;
	background-color: white;
	border-radius: 10rpx;
}

.chat-input {
	flex: 1;
	font-size: 28rpx;
	height: 54rpx;
	min-height: 54rpx;
	max-height: calc(40rpx * 4 + 24rpx);
	padding: 12rpx 0 20rpx 0;
	line-height: 40rpx;
	width: 100%;
	box-sizing: border-box;
	overflow-y: auto;

	/* iOS 微信小程序特殊适配 */
	/* #ifdef MP-WEIXIN */
	padding-bottom: 24rpx;
	/* #endif */
}

.voice-title {
	flex: 1;
	height: 54rpx;
	line-height: 54rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
}

.emoji-container {
	width: 54rpx;
	height: 54rpx;
	margin: 10rpx 0rpx 10rpx 20rpx;
}

.emoji-img {
	width: 54rpx;
	height: 54rpx;
}

.chat-input-send {
	background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
	margin: 10rpx 10rpx 10rpx 20rpx;
	border-radius: 10rpx;
	width: 120rpx;
	height: 60rpx;
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	justify-content: center;
	align-items: center;
}

.chat-input-send-disabled {
	background: #bbbbbb;
}

.chat-input-send-text {
	color: white;
	font-size: 26rpx;
}

.emoji-panel-container {
	background-color: #f8f8f8;
	overflow: hidden;
	transition-property: height;
	transition-duration: 0.15s;
	/* #ifndef APP-NVUE */
	will-change: height;
	/* #endif */
}

.emoji-panel {
	font-size: 30rpx;
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	flex-wrap: wrap;
	padding-right: 10rpx;
	padding-left: 15rpx;
	padding-bottom: 10rpx;
}

.emoji-panel-text {
	font-size: 50rpx;
	margin-left: 15rpx;
	margin-top: 20rpx;
}

.button {
	width: 144rpx;
	height: 60rpx;
	background: #E8E8EE;
	border-radius: 10rpx;
	margin-left: 20rpx;
}

.voice_an {
	width: 300rpx;
	height: 300rpx;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -55%);
	background-color: rgba(41, 41, 41, 0.7);
	color: white;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	border-radius: 10rpx;

	.text {
		padding-top: 30rpx;
	}

	.voice_an_icon {
		width: 200rpx;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 50rpx 0;
	}

	.wave {
		width: 6rpx;
		height: 100%;
		margin: 0 5rpx;
		border-radius: 50rpx;
		background-color: #fff;
		opacity: 0.6;
		transform: scaleY(0.2);
	}

	.wave-animation {
		&.wave1 {
			animation: wave 1s ease-in-out infinite;
		}

		&.wave2 {
			animation: wave 1s ease-in-out infinite 0.1s;
		}

		&.wave3 {
			animation: wave 1s ease-in-out infinite 0.2s;
		}

		&.wave4 {
			animation: wave 1s ease-in-out infinite 0.3s;
		}

		&.wave5 {
			animation: wave 1s ease-in-out infinite 0.4s;
		}

		&.wave6 {
			animation: wave 1s ease-in-out infinite 0.5s;
		}

		&.wave7 {
			animation: wave 1s ease-in-out infinite 0.6s;
		}
	}
}

@keyframes wave {

	0%,
	100% {
		transform: scaleY(0.2);
	}

	50% {
		transform: scaleY(1);
	}
}

.down-ui {
	position: absolute;
	top: -80rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 240rpx;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 28rpx;

	.status-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.pulse-animation {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 40rpx;
		background: rgba(255, 255, 255, 0.2);
		animation: pulse 1.5s infinite;
	}

	.status-text {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 8rpx;

		.countdown {
			color: #fff;
			font-weight: bold;
		}
	}
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}

	50% {
		transform: scale(1.1);
		opacity: 0.4;
	}

	100% {
		transform: scale(1);
		opacity: 0.8;
	}
}
</style>