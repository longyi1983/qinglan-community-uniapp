<template>
	<view class="container">
		<my-navbar title="栖心港会员" :navBg="navBg" titleColor="white"></my-navbar>
		
		<!-- 用户会员状态信息 -->
		<view class="user-status" v-if="userInfo.username">
			<view class="user-info">
				<image mode="aspectFill" class="avatar" :src="userInfo.avatar"></image>
				<view class="info-text">
					<view class="welcome" v-if="userInfo.vip == 1">
						{{userInfo.username}}，尊贵的会员您好
					</view>
					<view class="welcome" v-else>
						{{userInfo.username}}，您还不是VIP会员
					</view>
					<view class="expire-time" v-if="userInfo.vip == 1">
						会员到期时间：{{userInfo.vipExpireTime}}
					</view>
					<view class="expire-time" v-else>
						开通会员享受专属特权
					</view>
				</view>
			</view>
		</view>
		
		<!-- 会员充值选项 -->
		<view class="item-choose">
			<view class="option-wrap">
				<view class="option-item" @click="activeIndex = index" :class="{'active':activeIndex == index}"
					v-for="(item,index) in vipList" :key="index">
					<text class="type-txt">{{item.name}}</text>
					<view class="price-box">
						<text class="vip-money">￥</text>
						<text class="num">{{item.price}}</text>
					</view>
					<view class="month-price">￥{{item.remark}}</view>
				</view>
			</view>
			<view class="pay-btn" v-if="userInfo.vip==0" @click="selectPay">确认协议并支付</view>
			<view class="pay-btn" v-else @click="selectPay">立即续费</view>
			<view class="agreement">
				<text>阅读并同意</text>
				<navigator url="/pages/user/protocol?type=app_vip_recharge_context">《VIP会员服务协议》</navigator>
			</view>

		</view>
		<!-- 会员权益 -->
		<view class="quanyi">
			<view class="b-head">会员权益</view>
			<view class="grid-wrap">
				<view class="vip-desc-item" v-for="(item,index) in benefitList" :key="item.id">
					<image mode="aspectFill" :src="item.icon"></image>
					<text class="title">{{item.title}}</text>
					<!-- <text class="sub">{{item.describes}}</text> -->
				</view>

				<!-- <view style="color: #fff;height: 30px;">
				</view> -->
			</view>
		</view>

		<!-- 支付选择弹框 -->
		<view>
			<!--:money：支付金额  show：是否显示 @cancel:取消  @success：确认支付 -->
			<payDialog :money="money" :show="payVisible" @cancel="cancelPayHandle" @success="successPayHandle">
			</payDialog>
		</view>

	</view>
</template>

<script>
	import payDialog from "@/components/payDialog/payDialog.vue"
	import wxMpUtil from "@/utils/wxMpUtil.js"
	import config from '@/utils/config.js'
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				$IMG: this.$IMG,
				payVisible: false,
				userInfo: {},
				activeIndex: 0,
				vipList: [],
				orderId: 0,
				renameCount: 0,
				integralNum: 0,
				topicNum: 0,
				type: "",
				money: '',
				benefitList: []
			};
		},
		components: {
			payDialog
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(options) {
			this.getIsOpen();
			this.getUserInfo();
			this.getVipList();
			this.getVipConfig();
			this.getVipBenefitList();
			// #ifdef H5
			if (config.wxh5Login) {
				wxMpUtil.checkAndSaveWxMpOpenid(options.code, "/main/my/vip/vip")
				let ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					if (typeof WeixinJSBridge == "undefined") {
						if (document.addEventListener) {
							document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
						} else if (document.attachEvent) {
							document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
							document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
						}
					}
				}
			}
			// #endif
		},
		methods: {
			getVipBenefitList() {
				this.$H.get("vipbenefit/getList").then(res => {
					this.benefitList = res.result
				})
			},
			getIsOpen() {
				this.$H.get('system/vipShow').then(res => {
					if (res.vipShow == '1') {
						this.$u.toast("会员模块未开启");
						setTimeout(function() {
							uni.switchTab({
								url: '/main/index/index'
							});
						}, 1000);
					}
				});
			},
			getVipConfig() {
				this.$H.get("vip/vipConfig").then(res => {
					this.renameCount = res.renameCount;
					this.integralNum = res.integralNum;
					this.topicNum = res.topicNum;
				})
			},
			selectPay() {
				this.payVisible = true
				this.money = this.vipList[this.activeIndex].price
			},
			//余额支付
			yuePay(couponId = null) {
				let that = this;
				let scene = 1;
				if (this.userInfo.vip == 0) {
					scene = 0
				}
				this.type = "yue"
				uni.showLoading({
					mask: true,
					title: "支付中"
				})
				
				// 构建请求参数
				let params = {
					vipId: this.vipList[this.activeIndex].id,
					payType: this.type
				};
				
				// 如果选择了优惠券，添加优惠券ID参数
				if (couponId) {
					params.couponId = couponId;
				}
				
				this.$H.get(`userCoin/payVip/${this.vipList[this.activeIndex].id}`, params)
				.then(res => {
					if (res.code == 200) {
						that.getUserInfo();
						let content = '';
						if (couponId) {
							content = scene == 0 ? '青蓝币支付成功（已使用优惠券），欢迎您成为会员' : '青蓝币支付成功（已使用优惠券），欢迎您续费会员';
						} else {
							content = scene == 0 ? '青蓝币支付成功，欢迎您成为会员' : '青蓝币支付成功，欢迎您续费会员';
						}
						
						uni.showModal({
							title: '提示',
							content: content,
							showCancel: false,
							success: function(res) {
								if (res.confirm) {}
							}
						});
					} else {
						uni.showToast({
							title: res.msg || '支付失败',
							icon: 'none'
						});
					}
					uni.hideLoading();
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: '支付失败',
						icon: 'none'
					});
				})
			},
			//微信支付
			onPay(couponId = null) {
				let that = this;
				uni.showLoading({
					mask: true,
					title: "处理中"
				})
				// #ifdef APP-PLUS
				this.type = "app"
				// #endif
				// #ifdef H5
				let ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					this.type = "wxh5"
				} else {
					this.type = "h5"
				}
				// #endif
				// #ifdef MP-WEIXIN
				this.type = "weixin"
				// #endif
				// 构建请求参数
				let rechargeParams = {
					vipId: this.vipList[this.activeIndex].id,
					payType: this.type
				};
				
				// 如果选择了优惠券，添加优惠券ID参数
				if (couponId) {
					rechargeParams.userCouponRecordId = couponId;
				}
				
				this.$H.post("vip/rechargeVip", rechargeParams).then(res => {
					that.orderId = res.result
					if (res.code == 0) {
						this.$H.post("vip/pay", {
							orderId: that.orderId,
							payType: that.type
						}).then(res => {
							uni.hideLoading()
							// console.log("miniprogram:" + res.data)
							// #ifdef MP-WEIXIN
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: res.data.timeStamp,
								nonceStr: res.data.nonceStr,
								package: res.data.package,
								signType: res.data.signType,
								paySign: res.data.paySign,
								success: function(payRes) {
									uni.showToast({
										icon: 'none',
										title: '支付成功'
									})
									that.getUserInfo();

								},
								fail: function(err) {
									uni.showToast({
										icon: 'none',
										title: '支付取消'
									})
									// #ifdef H5
									uni.navigateTo({
										url: '/main/my/vip/vip'
									})
									// #endif

								}
							})
							// #endif

							// #ifdef APP-PLUS
							let str = res.data.package
							var index = str.lastIndexOf("\=");
							str = str.substring(index + 1, str.length);
							var obj = {
								appid: res.data.appId,
								noncestr: res.data.nonceStr,
								package: 'Sign=WXPay',
								prepayid: str,
								timestamp: res.data.timeStamp,
								sign: res.data.paySign,
								partnerid: res.data.partnerId
							}
							uni.requestPayment({
								provider: 'wxpay',
								orderInfo: obj,
								success: function(payRes) {
									uni.showToast({
										icon: 'none',
										title: '支付成功'
									})
									that.getUserInfo();

								},
								fail: function(err) {
									console.log('支付失败:' + JSON.stringify(err));
									uni.showToast({
										icon: 'none',
										title: '支付取消'
									})
								}
							})
							// #endif

							// #ifdef H5
							let ua = navigator.userAgent.toLowerCase();
							if (ua.match(/MicroMessenger/i) == "micromessenger") {
								WeixinJSBridge.invoke(
									'getBrandWCPayRequest', {
										appId: res.data.appId,
										timeStamp: res.data.timeStamp,
										nonceStr: res.data.nonceStr,
										package: res.data.package,
										signType: res.data.signType,
										paySign: res.data.paySign
									},
									function(res) {
										if (res.err_msg == "get_brand_wcpay_request:ok") {
											uni.showToast({
												icon: 'none',
												title: '支付成功'
											})
											that.getUserInfo();
										} else if (res.err_msg == "get_brand_wcpay_request:cancel") {
											uni.showToast({
												icon: 'none',
												title: '支付取消'
											})
										} else {
											uni.showToast({
												icon: 'none',
												title: '支付失败'
											})
										}
									});
							} else {
								location.replace(res.data.mwebUrl)
							}
							// #endif

						}).catch((err) => {
							console.log(err);
							uni.showToast({
								title: err.msg,
								icon: "none",
								duration: 2000,
							});
							// #ifdef H5
							uni.navigateTo({
								url: '/main/my/vip/vip'
							})
							// #endif
						});
					}
					uni.hideLoading();
				})
			},
			getVipList() {
				this.$H.get("vip/vipList").then(res => {
					this.vipList = res.result;
				})
			},
			getUserInfo() {
				this.$H.get('user/userInfo').then(res => {
					this.userInfo = res.result;
					uni.setStorageSync("userInfo", res.result)
				});
			},

			successPayHandle: function(payData) {
				if (payData.payType == 1) {
					// 微信支付使用优惠券
					this.onPay(payData.couponId);
					this.payVisible = false;
				} else if (payData.payType == 2) {
					// 青蓝币支付不使用优惠券
					this.yuePay();
					this.payVisible = false;
				} else {
					this.$u.toast("请选择支付方式")
				}
			},
			cancelPayHandle: function() {
				this.payVisible = false;
			},

		}
	}
</script>
<style>
	page {
		background-color: #F5F5F5;
	}
</style>
<style lang="scss" scoped>
	.innerContainer {
		padding: $gap;
	}

	.container {
		position: relative;
		min-height: 100vh;
		background-color: #141C3D;
		z-index: 1;
		padding: 0;
		margin: 0;
	}

	.container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 432rpx;
		z-index: -1;
		background-image: url('https://ceping.qinglanxinqing.com/uniapp/new/index/background.png');
		background-size: cover;
		background-position: center;
	}

	// 用户会员状态信息
	.user-status {
		margin: 40rpx 30rpx;
		
		.user-info {
			display: flex;
			align-items: center;
			padding: 30rpx;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 20rpx;
			backdrop-filter: blur(10rpx);
			border: 1px solid rgba(255, 255, 255, 0.2);
			
			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				margin-right: 30rpx;
				flex-shrink: 0;
			}
			
			.info-text {
				flex: 1;
				
				.welcome {
					font-size: 32rpx;
					color: #FFF0CD;
					font-weight: 600;
					margin-bottom: 10rpx;
				}
				
				.expire-time {
					font-size: 26rpx;
					color: #B5B5CA;
					line-height: 1.4;
				}
			}
		}
	}

	.item-choose {
		margin: 30rpx;
		border-radius: 20rpx;

		.option-wrap {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-gap: 20rpx;

			.option-item {
				padding: $gap;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: space-between;
				position: relative;
				width: 220rpx;
				// height: 227rpx;
				background: linear-gradient(169deg, #3D4879 0%, #232C56 100%);
				border-radius: 16rpx;
				color: #B5B5CA;

				.price-box {
					font-size: 60rpx;
					color: #B5B5CA;

					.vip-money {
						font-size: 28rpx;
					}

					.num {
						font-size: 40rpx;
						font-weight: bold;
					}
				}

				.month-price {
					font-size: 20rpx;
					color: #B5B5CA;
					line-height: 28rpx;
					text-decoration-line: line-through;
				}

				.activi-txt {
					position: absolute;
					left: -1px;
					top: -1px;
					background-color: #fa5051;
					color: #fff;
					font-size: 20rpx;
					padding: 5rpx 10rpx;
					border-radius: 10rpx 0 10rpx 0;
				}
			}

			.active {
				background-color: #f5ebe2;
				border: 1px solid #dabca5;
				color: #FFF0CD;

				.month-price {
					color: #FFF0CD;
				}

				.price-box {
					color: #FFF0CD;
				}
			}
		}

		.pay-btn {
			width: 686rpx;
			height: 80rpx;
			line-height: 80rpx;
			background: linear-gradient(166deg, #FFEFC4 0%, #FFE3A7 100%, #FFE3A7 100%);
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #875400;
			text-align: center;
			margin: $gap 0;
		}
	}

	.agreement {
		font-size: 24rpx;
		color: #999;
		margin: 30rpx 0;

		navigator {
			display: inline-block;
			color: #2B85E4;
		}
	}

	// 权益
	.quanyi {
		margin: 80rpx 30rpx;
		border-radius: 20rpx;

		.b-head {
			font-weight: 600;
			font-size: 44rpx;
			color: #FFF0CD;
			line-height: 44rpx;
			text-align: left;
			font-style: normal;
			text-align: center;
			display: flex;
		}

		.b-head:before,
		.b-head:after {
			width: 208rpx;
			border: 3rpx solid;
			opacity: 0.5;
			border-image: linear-gradient(135deg, rgba(255, 240, 205, 0), rgba(255, 240, 205, 1)) 3 3;
			content: '';
			display: block;
			margin: 0 auto;
			margin-top: 20rpx;
			margin-bottom: 20rpx;
		}

		.b-head:after {
			border-image: linear-gradient(135deg, rgba(255, 240, 205, 1), rgba(255, 240, 205, 0)) 3 3;
		}

		.grid-wrap {
			background-color: #232C56;
			margin-top: 30rpx;
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-gap: 60rpx 20rpx;
			padding: $gap;
			border-radius: 16rpx;

			.vip-desc-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				image {
					width: 120rpx;
					height: 120rpx;
					margin-bottom: 10rpx;
				}

				.title {
					color: #B5B5CA;
					font-size: 24rpx;
				}

				.sub {
					color: #B5B5CA;
					font-size: 20rpx;
				}
			}
		}
	}
</style>