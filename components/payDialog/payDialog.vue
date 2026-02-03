<template>
	<view :class="'pop-up ' + (show ? 'show' : 'hide')">
		<view @tap="close" class="pop-up-mask" v-if="show"></view>
		<view :class="'pop-box ' + (isPartDetails ? 'pb' : '')">
			<view class="pop-box-title">选择支付方式</view>
			<view @tap="close" class="iconfont iconclose pop-box-close">
				关闭
			</view>
			<view class="pop-box-select" @tap.stop.prevent="changeSelect" data-choose="1" :class="choose == 1 ? 'choose-it' : ''">
				<u-icon name="weixin-circle-fill" color="#00aa00" size="48"></u-icon>
				<view class="decs-select">微信支付</view>
			</view>
			<view class="pop-box-select" @tap.stop.prevent="changeSelect" data-choose="2" :class="choose == 2 ? 'choose-it' : ''">
				<u-icon name="rmb-circle-fill" color="#ffaa00"  size="48"></u-icon>
				<view class="decs-select">青蓝币支付</view>
			</view>
			
			<!-- 优惠券选择区域 -->
			<view class="coupon-section" v-if="choose == 1">
				<view class="coupon-header">
					<text class="coupon-title">优惠券</text>
					<view class="coupon-select" @tap="showCouponList">
						<text v-if="selectedCoupon && selectedCoupon.coupon">{{ selectedCoupon.coupon.couponName }}</text>
						<text v-else>选择优惠券</text>
						<u-icon name="arrow-right" size="24" color="#999"></u-icon>
					</view>
				</view>
				<view class="coupon-discount" v-if="couponDiscount > 0">
					<text>优惠金额：</text>
					<text class="discount-amount">-¥{{ couponDiscount.toFixed(2) }}</text>
				</view>
			</view>
			
			<view class="pop-box-tips">
				<text>合计需要支付：</text>
				<text class="pop-box-tips-red">{{ choose == 2 ? (finalAmount * 100) + '个' : finalAmount + '元' }}</text>
			</view>
			<view class="pop-box-agreement">
				<image @tap="selectHandle" class="pop-box-agreement-icon"
				:src="$IMG + '/img/full-gou.png'" v-if="select"></image>
				<image @tap="selectHandle" class="pop-box-agreement-icon"
					:src="$IMG + '/img/empty-gou.png'" v-else></image>
				<view>本人同意此协议</view>
				<view @tap="jumpToAgreement" class="pop-box-agreement-text">《会员开通协议》
				</view>
			</view>
			<view @tap="payHandle" class="pop-box-button">确认支付</view>
		</view>
		
		<!-- 优惠券列表弹框 -->
		<view class="coupon-popup" v-if="showCouponPopup">
			<view class="coupon-popup-mask" @tap="closeCouponList"></view>
			<view class="coupon-popup-content">
				<view class="coupon-popup-header">
					<text class="coupon-popup-title">选择优惠券</text>
					<view class="coupon-popup-close" @tap="closeCouponList">
						<u-icon name="close" size="24"></u-icon>
					</view>
				</view>
				<view class="coupon-list">
					<view class="coupon-item" @tap="selectCoupon(null)">
						<text class="no-coupon">不使用优惠券</text>
					</view>
					<view class="coupon-item" v-for="item in couponList" :key="item.id" 
						@tap="isCouponAvailable(item) ? selectCoupon(item) : null" 
						:class="{ 'unavailable': !isCouponAvailable(item) }"
						v-if="item.coupon">
						<view class="coupon-content">
							<view class="coupon-left">
								<view class="discount-info">
									<view class="discount-amount" v-if="item.coupon.discountType === 2">
										<text class="currency">¥</text>
										<text class="amount">{{ item.coupon.reductionAmount }}</text>
									</view>
									<view class="discount-percent" v-else-if="item.coupon.discountType === 1">
										<text class="percent">{{ item.coupon.discountPercentage }}</text>
										<text class="percent-symbol">折</text>
									</view>
								</view>
								<view class="coupon-name">{{ item.coupon.couponName }}</view>
								<view class="coupon-desc">
									<text v-if="item.coupon.discountType === 2">满{{ item.coupon.minAmount }}元可用</text>
									<text v-else>全场通用</text>
								</view>
							</view>
							<view class="coupon-right">
								<view class="time-info">
									<view class="time-text">{{ formatTime(item.coupon.startTime) }} - {{ formatTime(item.coupon.endTime) }}</view>
								</view>
								<view class="coupon-status" v-if="!isCouponAvailable(item)">
									<text class="unavailable-text">不可用</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				$IMG: this.$IMG,
				select: true,
				choose: 1,
				showCouponPopup: false,
				couponList: [],
				selectedCoupon: null,
				couponDiscount: 0
			};
		},
		props: {
			show: {
				type: Boolean,
				default: false
			},
			money: {
				type: [String, Number],
				default: 0.01
			},
			//  解决iOS底部适配问题
			isPartDetails: {
				type: Boolean,
				default: true
			}
		},
		computed: {
			finalAmount() {
				if (this.choose == 2) {
					// 青蓝币支付不使用优惠券
					return this.money;
				} else if (this.choose == 1) {
					// 微信支付使用优惠券 - 使用精确计算
					const result = parseFloat(this.money) - this.couponDiscount;
					return Math.max(0, this.roundToTwo(result));
				}
				return this.money;
			}
		},
		watch: {
			show(newVal) {
				if (newVal) {
					this.loadCouponList();
				}
			},
			choose(newVal) {
				if (newVal == 1) {
					// 切换到微信支付时重新计算优惠金额
					this.calculateDiscount();
				} else if (newVal == 2) {
					// 切换到青蓝币支付时清除优惠券选择
					this.selectedCoupon = null;
					this.couponDiscount = 0;
				}
			}
		},
		methods: {
			changeSelect(value){
				this.choose=value.currentTarget.dataset.choose
			},
			close: function() {
				this.$emit("cancel")
			},
			payHandle: function() {
				if(!this.select){
					this.$u.toast('请先勾选协议框')
					return;
				}
				this.$emit("success", {
					payType: this.choose,
					couponId: this.selectedCoupon ? this.selectedCoupon.id : null
				})
			},
			jumpToAgreement: function() {
				this.$f.jump("/pages/user/protocol?type=app_vip_recharge_context")
			},
			selectHandle: function() {
				this.select = !this.select;
			},
			// 加载优惠券列表
			loadCouponList() {
				this.$H.get("UserCouponRecord/list", {
					status: 1,
					pageSize: 100,
					pageNum: 1
				}).then(res => {
					if (res.code === 200) {
						this.couponList = res.rows || [];
					}
				}).catch(err => {
					console.log('获取优惠券列表失败:', err);
				});
			},
			// 显示优惠券列表
			showCouponList() {
				this.showCouponPopup = true;
			},
			// 关闭优惠券列表
			closeCouponList() {
				this.showCouponPopup = false;
			},
			// 选择优惠券
			selectCoupon(coupon) {
				this.selectedCoupon = coupon;
				this.calculateDiscount();
				this.closeCouponList();
			},
			// 计算优惠金额
			calculateDiscount() {
				if (!this.selectedCoupon || !this.selectedCoupon.coupon) {
					this.couponDiscount = 0;
					return;
				}
				
				const coupon = this.selectedCoupon.coupon;
				const orderAmount = parseFloat(this.money);
				
				// 检查是否满足使用条件
				if (coupon.discountType === 2 && orderAmount < coupon.minAmount) {
					this.couponDiscount = 0;
					return;
				}
				
				// 计算优惠金额
				if (coupon.discountType === 1) {
					// 折扣券 - 使用精确计算避免浮点数精度问题
					const discountRate = coupon.discountPercentage / 10;
					this.couponDiscount = this.roundToTwo(orderAmount * (1 - discountRate));
				} else if (coupon.discountType === 2) {
					// 满减券
					this.couponDiscount = parseFloat(coupon.reductionAmount);
				}
				
				// 优惠金额不能超过订单金额
				this.couponDiscount = Math.min(this.couponDiscount, orderAmount);
			},
			// 精确到两位小数的四舍五入
			roundToTwo(num) {
				return Math.round((num + Number.EPSILON) * 100) / 100;
			},
			// 检查优惠券是否可用
			isCouponAvailable(coupon) {
				// 检查coupon和coupon.coupon是否存在
				if (!coupon || !coupon.coupon) {
					return false;
				}
				
				const orderAmount = parseFloat(this.money);
				const couponData = coupon.coupon;
				
				// 检查最低消费金额
				if (couponData.discountType === 2 && orderAmount < couponData.minAmount) {
					return false;
				}
				
				// 检查有效期
				const now = new Date();
				const startTime = new Date(couponData.startTime);
				const endTime = new Date(couponData.endTime);
				
				return now >= startTime && now <= endTime;
			},
			// 格式化时间
			formatTime(timeStr) {
				if (!timeStr) return '';
				const date = new Date(timeStr);
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${month}-${day}`;
			}
		}
	};
</script>
<style lang="scss">
	.decs-select{
		margin-left: 30rpx;
		font-size: 34rpx;
	}
	.pop-up.show .pop-box {
		transform: translate(0, 0);
	}

	.pop-up.hide .pop-box {
		transform: translate(0, 100%);
	}

	.pop-up .pop-up-mask {
		top: 0;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		z-index: 998;
	}

	.pop-box,
	.pop-up .pop-up-mask {
		position: fixed;
		left: 0;
		width: 100%;
	}

	.pop-box {
		background: white;
		border-radius: 24rpx 24rpx 0 0;
		padding: 10px 20px;
		bottom: 0;
		transition: all 0.2s ease;
		overflow: hidden;
		z-index: 1001;
	}

	.pb {
		// 解决ios底部小黑线
		padding-bottom: calc(env(safe-area-inset-bottom) + 32rpx);
	}

	.pop-box .pop-box-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #000;
	}

	.pop-box .pop-box-close {
		position: absolute;
		right: 32rpx;
		top: 24rpx;
		color: #9c9c9c;
		font-size: 32rpx;
	}

	.pop-box-select {
		margin-top: 40rpx;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		padding-left: 26rpx;
		color: #000;
		background-color: #f9f9f9;
		font-size: 32rpx;
		font-weight: 500;
		padding-right: 34rpx;
	}

	.choose-it{
		border: 1px solid #fa3426;
	}
	

	.pop-box-tips {
		color: #9c9c9c;
		font-size: 28rpx;
		margin-top: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pop-box-tips-red {
		color: #fa5555;
		font-weight: 700;
	}

	.pop-box-button {
		height: 96rpx;
		background: #00aa00;
		font-size: 24rpx;
		justify-content: center;
		color: #fff;
		font-size: 32rpx;
		font-weight: 500;
		border-radius: 24rpx;
		margin-top: 64rpx;
		margin-bottom: 32px;
	}

	.pop-box-agreement,
	.pop-box-button {
		display: flex;
		align-items: center;
	}

	.pop-box-agreement {
		justify-content: flex-start;
		margin-top: 48rpx;
		color: #aeb2bb;
		font-size: 24rpx;
	}

	.pop-box-agreement-icon {
		width: 28rpx;
		height: 28rpx;
		display: block;
		margin-right: 16rpx;
	}

	.pop-box-agreement-text {
		color: #111e38;
		font-size: 24rpx;
	}
	
	// 优惠券相关样式
	.coupon-section {
		margin-top: 30rpx;
		
		.coupon-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15rpx;
			
			.coupon-title {
				font-size: 28rpx;
				color: #333;
				font-weight: 600;
			}
			
			.coupon-select {
				display: flex;
				align-items: center;
				color: #666;
				font-size: 26rpx;
				padding: 8rpx 16rpx;
				background: #f8f9fa;
				border-radius: 20rpx;
				border: 1rpx solid #e9ecef;
				transition: all 0.3s ease;
				
				&:active {
					background: #e9ecef;
					transform: scale(0.98);
				}
				
				text {
					margin-right: 8rpx;
					max-width: 200rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}
		
		.coupon-discount {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 24rpx;
			background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
			border-radius: 16rpx;
			border: 1rpx solid #fed7d7;
			font-size: 26rpx;
			color: #666;
			margin-top: 12rpx;
			animation: fadeIn 0.3s ease;
			
			.discount-amount {
				color: #ff6b6b;
				font-weight: bold;
				font-size: 28rpx;
			}
		}
	}
	
	// 优惠券弹框样式
	.coupon-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2000;
		
		.coupon-popup-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.6);
		}
		
		.coupon-popup-content {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			background: white;
			border-radius: 24rpx 24rpx 0 0;
			max-height: 80vh;
			overflow: hidden;
			animation: slideUp 0.3s ease-out;
			
			.coupon-popup-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx;
				border-bottom: 1px solid #f0f0f0;
				background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
				
				.coupon-popup-title {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
				}
				
				.coupon-popup-close {
					padding: 10rpx;
					border-radius: 50%;
					background: #f8f9fa;
					transition: all 0.3s ease;
					
					&:active {
						background: #e9ecef;
						transform: scale(0.9);
					}
				}
			}
			
			.coupon-list {
				max-height: 60vh;
				overflow-y: auto;
				padding: 20rpx;
				
				.coupon-item {
					background: #FFFFFF;
					border-radius: 20rpx;
					margin-bottom: 20rpx;
					box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
					overflow: hidden;
					position: relative;
					transition: all 0.3s ease;
					
					&:not(.unavailable):active {
						transform: scale(0.98);
						box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
					}
					
					&.unavailable {
						opacity: 0.6;
						background: #f8f9fa;
					}
					
					// 左侧彩色边条 - 与coupon-item组件保持一致
					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 0;
						width: 8rpx;
						height: 100%;
						background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
						z-index: 1;
					}
					
					&.unavailable::before {
						background: linear-gradient(135deg, #ccc, #ddd);
					}
					
					.no-coupon {
						display: block;
						padding: 30rpx;
						text-align: center;
						font-size: 28rpx;
						color: #666;
						background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
						border-radius: 20rpx;
						border: 2rpx dashed #dee2e6;
						transition: all 0.3s ease;
						
						&:active {
							background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
							transform: scale(0.98);
						}
					}
					
					.coupon-content {
						display: flex;
						padding: 30rpx;
						align-items: center;
						position: relative;
						z-index: 2;
						
						.coupon-left {
							flex: 1;
							margin-right: 20rpx;
							
							.discount-info {
								margin-bottom: 15rpx;
								
								.discount-amount {
									display: flex;
									align-items: baseline;
									color: #ff6b6b;
									
									.currency {
										font-size: 24rpx;
										font-weight: bold;
									}
									
									.amount {
										font-size: 48rpx;
										font-weight: bold;
										margin-left: 5rpx;
									}
								}
								
								.discount-percent {
									display: flex;
									align-items: baseline;
									color: #ff6b6b;
									
									.percent {
										font-size: 48rpx;
										font-weight: bold;
									}
									
									.percent-symbol {
										font-size: 24rpx;
										font-weight: bold;
										margin-left: 5rpx;
									}
								}
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
						}
						
						.coupon-right {
							display: flex;
							flex-direction: column;
							align-items: flex-end;
							min-width: 200rpx;
							
							.time-info {
								margin-bottom: 20rpx;
								text-align: right;
								
								.time-text {
									font-size: 22rpx;
									color: #999;
									margin-bottom: 8rpx;
								}
							}
							
							.coupon-status {
								.unavailable-text {
									font-size: 24rpx;
									color: #ff6b6b;
									padding: 8rpx 16rpx;
									background: rgba(255, 107, 107, 0.1);
									border-radius: 16rpx;
									border: 1rpx solid rgba(255, 107, 107, 0.2);
								}
							}
						}
					}
				}
			}
		}
	}
	
	// 动画效果
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>