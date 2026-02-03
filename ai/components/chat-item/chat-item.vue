<!-- z-paging聊天item -->

<template>
	<view class="chat-item">
		<text class="chat-time" v-if="item.time && item.time.length">
			{{ item.time }}
		</text>
		<view :class="{ 'chat-container': true, 'chat-location-me': item.isMe }">
			<view class="chat-icon-container">
				<image class="chat-icon" :src="item.icon" mode="aspectFill" />
			</view>
			<view class="chat-content-container">
				<text :class="{ 'chat-user-name': true, 'chat-location-me': item.isMe }">
					{{ item.name }}
				</text>
				<view class="chat-text-container-super" :style="[{ justifyContent: item.isMe ? 'flex-end' : 'flex-start' }]">
					<!-- 重试图标（仅在用户消息且AI回复失败时显示） -->
					<view v-if="item.isMe && item.aiStatus === 'fail'" class="retry-icon-container"
						@click="handleRetry">
						<view v-if="isRetrying" class="retry-loading-icon">
							<view class="retry-spinner-icon"></view>
						</view>
						<view v-else class="retry-icon">
							<u-icon name="reload" color="white" size="28"></u-icon>
						</view>
					</view>

					<view :class="{ 'chat-text-container': true, 'chat-text-container-me': item.isMe }">
						<text :class="{ 'chat-text': true, 'chat-text-me': item.isMe }">{{ item.content }}</text>
					</view>
				</view>

				<!-- 状态显示 -->
				<view class="status-container">
					<!-- AI消息的思考中状态 -->
					<view v-if="!item.isMe && item.status === 'pending'" class="status-pending">
						<view class="loading-container">
							<view class="loading-dot loading-dot-1"></view>
							<view class="loading-dot loading-dot-2"></view>
							<view class="loading-dot loading-dot-3"></view>
						</view>
						<!-- <text class="status-text">思考中...</text> -->
					</view>
					<!-- {{item.aiStatus}} -->
					<!-- 用户消息AI回复失败时的网络提示 -->
					<view v-if="item.isMe && item.aiStatus === 'fail'" class="network-error-tip">
						<text class="network-tip-text">请检查网络后重试</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: "chat-item",
	props: {
		item: {
			type: Object,
			default: function () {
				return {
					time: '',
					icon: '',
					name: '',
					content: '',
					isMe: false
				}
			}
		}
	},
	data() {
		return {
			isRetrying: false
		};
	},
	methods: {
		handleRetry() {
			if (this.isRetrying) return;

			this.isRetrying = true;

			// 重置重试状态
			setTimeout(() => {
				this.isRetrying = false;
			}, 1200);

			this.$emit('resend');
		}
	}
}
</script>

<style scoped>
.chat-item {
	display: flex;
	flex-direction: column;
	padding: 20rpx;
}

.chat-time {
	padding: 4rpx 0rpx;
	text-align: center;
	font-size: 22rpx;
	color: #aaaaaa;
}

.chat-container {
	display: flex;
	flex-direction: row;
}

.chat-location-me {
	flex-direction: row-reverse;
	text-align: right;
}

.chat-icon-container {
	margin-top: 12rpx;
}

.chat-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background-color: #eeeeee;
}

.chat-content-container {
	margin: 0rpx 15rpx;
}

.chat-user-name {
	font-size: 26rpx;
	color: #888888;
}

.chat-text-container {
	text-align: left;
	background-color: #FFFFFF;
	color: #21252D;
	border-radius: 8rpx;
	padding: 10rpx 15rpx;
	margin-top: 10rpx;
	/* #ifndef APP-NVUE */
	max-width: 500rpx;
	/* #endif */
}

.chat-text-container-me {
	background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
}

.chat-text-container-super {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.chat-text {
	font-size: 28rpx;
	word-break: break-word;
	overflow-wrap: break-word;
	white-space: normal;
	/* #ifdef APP-NVUE */
	max-width: 500rpx;
	/* #endif */
}

.chat-text-me {
	color: white;
}

/* 重试图标容器 */
.retry-icon-container {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	margin-right: 16rpx;
	cursor: pointer;
	/* 确保垂直居中对齐 */
	align-self: center;
}

.retry-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48rpx;
	height: 48rpx;
	background-color: #ff9500;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.retry-icon:active {
	transform: scale(0.9);
	background-color: #e6850e;
}

.retry-loading-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48rpx;
	height: 48rpx;
	background-color: #ccc;
	border-radius: 50%;
}

.retry-spinner-icon {
	width: 24rpx;
	height: 24rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
	border-top: 4rpx solid white;
	border-radius: 50%;
	animation: retry-spin 1s linear infinite;
}

@keyframes retry-spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

/* 状态容器 */
.status-container {
	margin-top: 12rpx;
}

/* AI思考中状态 */
.status-pending {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.loading-container {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.loading-dot {
	width: 6rpx;
	height: 6rpx;
	border-radius: 50%;
	background-color: #7691FF;
	animation: loading-bounce 1.4s infinite both;
}

.loading-dot-1 {
	animation-delay: -0.32s;
}

.loading-dot-2 {
	animation-delay: -0.16s;
}

.loading-dot-3 {
	animation-delay: 0s;
}

@keyframes loading-bounce {

	0%,
	80%,
	100% {
		transform: scale(0.8);
		opacity: 0.5;
	}

	40% {
		transform: scale(1);
		opacity: 1;
	}
}

.status-text {
	color: #999;
	font-size: 24rpx;
}

/* 用户消息网络错误提示 */
.network-error-tip {
	text-align: right;
	margin-top: 8rpx;
}

.network-tip-text {
	color: #999;
	font-size: 24rpx;
}
</style>