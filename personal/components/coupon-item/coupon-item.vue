<template>
	<view class="coupon-item">
		<view class="coupon-content">
			<view class="coupon-left">
				<view class="discount-info">
					<view class="discount-amount" v-if="item.discountType === 2">
						<text class="currency">¥</text>
						<text class="amount">{{ item.reductionAmount }}</text>
					</view>
					<view class="discount-percent" v-else-if="item.discountType === 1">
						<text class="percent">{{ item.discountPercentage }}</text>
						<text class="percent-symbol">折</text>
					</view>
				</view>
				<view class="coupon-name">{{ item.couponName }}</view>
				<view class="coupon-desc">
					<text v-if="item.discountType === 2">满{{ item.minAmount }}元可用</text>
					<text v-else>全场通用</text>
				</view>
			</view>
			<view class="coupon-right">
				<view class="time-info">
				<view class="time-text"><text class="clock">⏱</text>{{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}</view>
				<view class="remaining" v-if="!owned">剩余{{ item.remainingQuantity }}张</view>
				</view>
			<view class="status-badge" v-if="owned && item.status" :class="statusClassName">
				{{ statusTextValue }}
			</view>
			<view class="toggle-rules" @click="toggleRules">
				<text class="toggle-text">使用规则</text>
				<text class="arrow" :class="{ open: showRules }">▼</text>
			</view>
			<view v-if="!owned" class="action-btn" @click="receiveCoupon" :class="{ 'disabled': item.remainingQuantity <= 0 || item.isReceived, 'received': item.isReceived }">
				<view class="btn-content">
					<text v-if="item.isReceived" class="check-icon">✓</text>
					<text class="btn-text">{{ item.isReceived ? '已领取' : (item.remainingQuantity > 0 ? '立即领取' : '已抢完') }}</text>
				</view>
			</view>
			</view>
		</view>
		<view class="rules-below" v-if="showRules">
			<view class="rule">优惠券可用于购买会员、购买量表、进行聊愈、进行评估</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "coupon-item",
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			owned: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				showRules: false,
			}
		},
		computed: {
			statusTextValue() {
				const s = Number(this.item && this.item.status)
				switch (s) {
					case 1: return '可用'
					case 2: return '已使用'
					case 3: return '已过期'
					case 4: return '无效'
					default: return ''
				}
			},
			statusClassName() {
				const s = Number(this.item && this.item.status)
				switch (s) {
					case 1: return 'ok'
					case 2: return 'used'
					case 3: return 'expired'
					case 4: return 'invalid'
					default: return ''
				}
			}
		},
		methods: {
			formatTime(timeStr) {
				if (!timeStr) return '';
				const date = new Date(timeStr);
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${month}-${day}`;
			},
			toggleRules() {
				this.showRules = !this.showRules;
			},
			receiveCoupon() {
				// 检查是否已经领取或已抢完
				if (this.item.remainingQuantity <= 0 || this.item.isReceived) return;
				
				uni.showLoading({
					title: '领取中...'
				});
				
				this.$H.get(`coupon/seckill/${this.item.id}`)
					.then(res => {
						uni.hideLoading();
						if (res.code === 200) {
							uni.showToast({
								title: '领取成功',
								icon: 'success'
							});
							// 更新剩余数量和领取状态
							this.item.remainingQuantity--;
							this.item.isReceived = true;
							// 触发父组件刷新
							this.$emit('refresh');
						} else {
							uni.showToast({
								title: res.msg || '领取失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						uni.hideLoading();
						uni.showToast({
							title: '网络错误',
							icon: 'none'
						});
					});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.coupon-item {
		background: #FFFFFF;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
		position: relative;
	}

	.coupon-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 8rpx;
		height: 100%;
		background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
	}

	.coupon-content {
		display: flex;
		padding: 30rpx;
		align-items: center;
	}

	.coupon-left {
		flex: 1;
		margin-right: 20rpx;
	}

	.discount-info {
		margin-bottom: 15rpx;
	}

	.discount-amount {
		display: flex;
		align-items: baseline;
		color: #ff6b6b;
	}

	.currency {
		font-size: 24rpx;
		font-weight: bold;
	}

	.amount {
		font-size: 48rpx;
		font-weight: bold;
		margin-left: 5rpx;
	}

	.discount-percent {
		display: flex;
		align-items: baseline;
		color: #ff6b6b;
	}

	.percent {
		font-size: 48rpx;
		font-weight: bold;
	}

	.percent-symbol {
		font-size: 24rpx;
		font-weight: bold;
		margin-left: 5rpx;
	}

	.coupon-name {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.coupon-desc {
		font-size: 24rpx;
		color: #666;
	}

	.coupon-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		min-width: 200rpx;
	}

	.time-info {
		margin-bottom: 20rpx;
		text-align: right;
	}

	.time-text {
		font-size: 26rpx;
		font-weight: 600;
		color: #444;
		margin-bottom: 8rpx;
		background: #f1f3f5;
		padding: 8rpx 14rpx;
		border-radius: 999rpx;
		display: inline-flex;
		align-items: center;
		gap: 8rpx;
	}

	.clock {
		font-size: 26rpx;
	}

	.toggle-rules {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12rpx;
		margin-bottom: 16rpx;
		color: #666;
		font-size: 24rpx;
	}

	.toggle-text {
		color: #666;
	}

	.arrow {
		transition: transform 0.2s ease;
	}

	.arrow.open {
		transform: rotate(180deg);
	}

	.rules-below {
		background: #f7f7f9;
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		margin-top: 8rpx;
		color: #555;
		font-size: 24rpx;
		line-height: 1.6;
	}

	.status-badge {
		align-self: flex-end;
		margin: 8rpx 0;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		font-size: 22rpx;
		font-weight: 600;
	}

	.status-badge.ok {
		background: #e8fff3;
		color: #0a8f55;
	}

	.status-badge.used {
		background: #f3f3f3;
		color: #9a9a9a;
	}

	.status-badge.expired {
		background: #fff1f0;
		color: #d4380d;
	}

	.status-badge.invalid {
		background: #fff7e6;
		color: #ad6800;
	}

	.remaining {
		font-size: 22rpx;
		color: #ff6b6b;
	}

	.action-btn {
		background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
		color: #fff;
		padding: 16rpx 32rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		text-align: center;
		min-width: 120rpx;
		transition: all 0.3s ease;
	}

	.action-btn.disabled {
		background: #ccc;
		color: #999;
	}

	.action-btn.received {
		background: linear-gradient(135deg, #28a745, #34ce57);
		color: #fff;
		border: 1rpx solid #28a745;
	}

	.btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.check-icon {
		font-size: 20rpx;
		font-weight: bold;
	}

	.btn-text {
		flex: 1;
		text-align: center;
	}

	.action-btn:not(.disabled):not(.received):active {
		transform: scale(0.95);
	}
</style>
