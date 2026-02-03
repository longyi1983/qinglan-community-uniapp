<template>
	<view v-if="open">
		<view class="recharge-head">
			<text class="title">我的余额（元）</text>
			<view class="money">
				<text>
					￥
					<text class="num">{{ now_money || 0 }}</text>
				</text>
			</view>
		</view>
		<view class="recharge">
			<view class="recharge-box">
				<view class="selectItem acea-row row-between">
					<view class="select-box select-box-color acea-row row-center-wrapper row-column"
						:class="activePic === index ? 'select-box-color-active' : ''" v-for="(item, index) in picList"
						:key="index" @click="picCharge(index, item)">
						<view class="pic-number-pic">
							<text>
								{{ item.price }}
								<text class="pic-number">元</text>
							</text>
						</view>
						<view class="pic-number" v-if="item.givePrice > 0">赠送：{{ item.givePrice }} 元</view>
					</view>
				</view>
				<view class="pay-btn" @click="recharge">立即充值</view>
				<view class="tip">提醒：充值后不支持退款哦</view>
			</view>
		</view>
	</view>
</template>
<script>
	import wxMpUtil from "@/utils/wxMpUtil.js"
	import config from '@/utils/config.js';
	export default {
		name: "Recharge",
		components: {},
		props: {},
		data: function() {
			return {
				active: 0,
				from: '',
				money: "",
				now_money: "",
				picList: [],
				activePic: 0,
				numberPic: "",
				paid_price: "",
				rechar_id: 0,
				fromPaidPost: false,
				open:true
			};
		},

		mounted: function() {
			this.checkOpen();
			this.getRecharge();
			this.getUserInfo();
		},
		onLoad(options) {
			// #ifdef H5
			if(config.wxh5Login){
				wxMpUtil.checkAndSaveWxMpOpenid(options.code, "/pages/pay/pay")
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
			if (options.from) {
				if (options.from == 'paidpost') {
					this.fromPaidPost = true
				}
			}
		},
		methods: {
			checkOpen(){
				this.$H.get('system/rechargeIsOpen').then(res => {
					if(res.code==0){
						this.open = res.result;
						if(!res.result){
							this.$f.toast("模块未开启")
							setTimeout(function() {
								uni.switchTab({
									url: '/pages/index/index'
								});
							}, 1500);
						}
					}
				});
			},
			getUserInfo() {
				this.$H.get('user/userInfo').then(res => {
					this.userInfo = res.result;
					this.now_money = this.userInfo.money;
				});
			},
			/**
			 * 充值额度选择
			 */
			getRecharge() {
				this.$H.get('user/recharge/list').then(res => {
					this.picList = res.result;
					if (this.picList[0]) {
						this.rechar_id = this.picList[0].id;
						this.paid_price = this.picList[0].price;
						this.numberPic = this.picList[0].givePrice;
					}
				});

			},
			/**
			 * 选择金额
			 */
			picCharge(idx, item) {
				this.activePic = idx;
				if (idx == this.picList.length) {
					this.rechar_id = 0;
					this.paid_price = "";
					this.numberPic = "";
				} else {
					this.money = "";
					this.rechar_id = item.id;
					this.paid_price = item.price;
					this.numberPic = item.givePrice;
				}
			},
			recharge: function() {
				let that = this,
					price = Number(this.money);
				if (this.picList.length == this.activePic && price === 0) {
					uni.showToast({
						title: "请输入您要充值的金额",
						icon: "none",
						duration: 2000,
					});
					return;
				} else if (this.picList.length == this.activePic && price < 0.01) {
					uni.showToast({
						title: "充值金额不能低于0.01",
						icon: "none",
						duration: 2000,
					});
					return;
				} else if (this.picList.length == this.activePic && price > 99999) {
					uni.showToast({
						title: "充值金额不能大于99999",
						icon: "none",
						duration: 2000,
					});
					return;
				}
				let prices = "",
					paid_price = "";
				if (price) {
					prices = price;
					paid_price = 0;
				} else {
					prices = that.numberPic;
					paid_price = that.paid_price;
				}
				uni.showLoading({
					mask: true,
					title: '支付中...',
				})
				// #ifdef MP-WEIXIN
				this.$H.post('/user/recharge', {
						price: paid_price,
						from: 'weixin',
						paidPrice: prices,
						recharId: that.rechar_id,
					})
					.then((res) => {
						uni.hideLoading()

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
								if (that.fromPaidPost) {
									uni.navigateBack()
								} else {
									uni.navigateTo({
										url: '/pages/account/account'
									})
								}
							},
							fail: function(err) {
								uni.showToast({
									icon: 'none',
									title: '支付取消'
								})
								uni.navigateTo({
									url: '/pages/account/account'
								})
							}
						})
					})
					.catch((err) => {
						console.log(err);
						uni.showToast({
							title: err.msg,
							icon: "none",
							duration: 2000,
						});
					});
				// #endif
				// #ifdef APP-PLUS
				this.$H.post('/user/rechargeByApp', {
						price: paid_price,
						from: 'app',
						paidPrice: prices,
						recharId: that.rechar_id,
					})
					.then((res) => {
						uni.hideLoading()
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
								if (that.fromPaidPost) {
									uni.navigateBack()
								} else {
									uni.navigateTo({
										url: '/pages/account/account'
									})
								}
							},
							fail: function(err) {
								console.log(err)
								uni.showToast({
									icon: 'none',
									title: '支付取消'
								})
							}
						})

					})
					.catch((err) => {
						console.log(err);
						uni.showToast({
							title: err.msg,
							icon: "none",
							duration: 2000,
						});
					});
				// #endif
				// #ifdef H5
				let ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					this.$H.post('/user/rechargeByWXH5', {
							price: paid_price,
							from: 'weixin',
							paidPrice: prices,
							recharId: that.rechar_id,
						})
						.then((res) => {
							uni.hideLoading()
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
										if (that.fromPaidPost) {
											uni.navigateBack()
										} else {
											uni.navigateTo({
												url: '/pages/account/account'
											})
										}
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

						}).catch(err => {
							uni.hideLoading()
							uni.showToast({
								title: '支付失败',
								icon: 'none'
							})
							uni.navigateTo({
								url: '/pages/account/account'
							})
						})
				} else {
					this.$H.post('/user/rechargeByH5', {
							price: paid_price,
							from: 'weixin',
							paidPrice: prices,
							recharId: that.rechar_id,
						})
						.then((res) => {
							uni.hideLoading()
							console.log("h5:" + res.data)
							location.replace(res.data.mwebUrl)
							// window.location.replace(url)
						}).catch(err => {
							uni.hideLoading()
							uni.showToast({
								title: '支付失败',
								icon: 'none'
							})
							uni.navigateTo({
								url: '/pages/account/account'
							})
						})

				}
				// #endif
			},
		},
	};
</script>

<style scoped lang="scss">
	.recharge-head {
		width: 100%;
		height: 350rpx;
		// background-color: #aaaaff;
		background: linear-gradient(135deg, #a1c4fd, #aaaaff);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.title {
			font-size: 28rpx;
			color: #fff;
			margin-top: -38rpx;
			margin-bottom: 30rpx;
		}

		.money {
			font-size: 32rpx;
			color: #fff;
		}

		.num {
			font-size: 78rpx;
			color: #fff;
		}
	}

	.recharge {
		border-radius: 10rpx;
		width: 100%;
		background-color: #fff;
		margin: 20rpx auto 0 auto;
		padding: 30rpx;
		border-top-right-radius: 35rpx;
		border-top-left-radius: 35rpx;
		
		margin-top: -45rpx;
		box-sizing: border-box;
		.recharge-box {
			.money {
				margin-top: 0.6 * 100rpx;
				padding-bottom: 0.2 * 100rpx;
				border-bottom: 1px dashed #ddd;
				text-align: center;

				span {
					font-size: 0.56 * 100rpx;
					color: #333;
					font-weight: bold;
				}

				input {
					display: inline-block;
					width: 3 * 100rpx;
					font-size: 0.84 * 100rpx;
					text-align: center;
					color: #282828;
					font-weight: bold;
					padding-right: 0.7 * 100rpx;

					&::placeholder {
						color: #ddd;
					}

					&::-webkit-input-placeholder {
						color: #ddd;
					}

					&:-moz-placeholder {
						color: #ddd;
					}

					&::-moz-placeholder {
						color: #ddd;
					}

					&:-ms-input-placeholder {
						color: #ddd;
					}
				}
			}

			.pay-btn {
				display: block;
				width: 100%;
				height: 86rpx;
				margin: 50rpx auto 0 auto;
				line-height: 0.86 * 100rpx;
				text-align: center;
				color: #fff;
				border-radius: 50rpx;
				font-size: 30rpx;
				font-weight: bold;
				background: linear-gradient(180deg, #a1c4fd, #aaaaff);
			}
		}
	}

	.selectItem {
		margin-bottom: 30rpx;
		margin-top: 30rpx;
		display: flex;
		justify-content: space-between;

		.select-box {
			width: 32%;
			height: auto;
			border-radius: 20rpx;
			margin-top: 21rpx;
			padding: 20rpx 0;
		}
	}
	
	.select-box-color {
		background-color: #f4f4f4;
		color: #656565;
	}

	.select-box-color-active {
		background-color: #aaaaff !important;
		color: #fff !important;
	}

	.pic-number {
		font-size: 22rpx;
	}

	.pic-number-pic {
		font-size: 38rpx;
		margin-right: 10rpx;
		text-align: center;
	}
	.tip {
		display: flex;
		justify-content: center;
		font-size: 28rpx;
		color: #7e7e7e;
		font-weight: 800;
		margin-top: 20rpx;
	}
	
</style>