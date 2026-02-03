<template>
	<view>
		<view class="head">
			<view class="user-info">
				<image mode="aspectFill" class="avatar" :src="userInfo.avatar"></image>
				<view class="right" v-if="userInfo.vip==1">
					<view class="name">{{userInfo.username}},尊贵的会员您好</view>
					<text class="txt">您的会员到期时间为：{{userInfo.vipExpireTime}}</text>
				</view>
				<view class="right" v-else>
					<view class="name">{{userInfo.username}}</view>
					<text class="txt">您还不是VIP会员哦~</text>
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
					<view class="month-price">{{item.remark}}</view>
					<view class="month-price" style="background-color: #37414b;">限时优惠</view>
				</view>
			</view>
			<view class="agreement">
				<text>查看开通会员协议</text>
				<navigator url="/pages/user/protocol?type=app_vip_recharge_context">《会员服务协议》</navigator>
			</view>

			<view class="pay-btn" v-if="userInfo.vip==0" @click="selectPay">立即开通</view>
			<view class="pay-btn" v-else @click="selectPay">立即续费</view>

		</view>
		<!-- 会员权益 -->
		<view class="quanyi">
			<view class="b-head">会员权益</view>
			<view class="grid-wrap">
				<view class="vip-desc-item" v-for="(item,index) in benefitList" :key="item.id">
					<image mode="aspectFill" :src="item.icon"></image>
					<text class="title">{{item.title}}</text>
					<text class="sub">{{item.describes}}</text>
				</view>
				
				<view style="color: #fff;height: 30px;">
				</view>
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
	export default {
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
				benefitList:[]
			};
		},
		components: {
			payDialog
		},
		onLoad(options) {
			this.getIsOpen();
			this.getUserInfo();
			this.getVipList();
			this.getVipConfig();
			this.getVipBenefitList();
			// #ifdef H5
			if(config.wxh5Login){
				wxMpUtil.checkAndSaveWxMpOpenid(options.code, "/pages/user/vip/vip")
				let ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					if (typeof WeixinJSBridge == "undefined"){
					   if( document.addEventListener ){
						   document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
					   }else if (document.attachEvent){
						   document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
						   document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
					   }
					}
				}
			}
			// #endif
		},
		methods: {
			getVipBenefitList(){
				this.$H.get("vipbenefit/getList").then(res => {
					this.benefitList=res.result
				})
			},
			getIsOpen() {
				this.$H.get('system/vipShow').then(res => {
					if (res.vipShow == '1') {
						this.$u.toast("会员模块未开启");
						setTimeout(function() {
							uni.switchTab({
								url: '/pages/index/index'
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
			yuePay() {
				let that = this;
				let scene = 1;
				if(this.userInfo.vip==0){
					scene = 0
				}
				this.type = "yue"
				uni.showLoading({
					mask: true,
					title: "支付中"
				})
				this.$H.post("vip/rechargeVipByYue", {
					vipId: this.vipList[this.activeIndex].id,
					payType: this.type
				}).then(res => {
					if (res.code == 0) {
						that.getUserInfo();
						if(scene==0){
							uni.showModal({
								title: '提示',
								content: '余额支付成功，欢迎您成为会员',
								showCancel: false,
								success: function(res) {
									if (res.confirm) {}
								}
							});
						}else{
							uni.showModal({
								title: '提示',
								content: '余额支付成功，欢迎您续费会员',
								showCancel: false,
								success: function(res) {
									if (res.confirm) {}
								}
							});
						}
						
					}
					uni.hideLoading();
				})
			},
			//微信支付
			onPay() {
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
				}else{
					this.type = "h5"
				}
				// #endif
				// #ifdef MP-WEIXIN
				this.type = "weixin"
				// #endif
				this.$H.post("vip/rechargeVip", {
					vipId: this.vipList[this.activeIndex].id,
					payType: this.type
				}).then(res => {
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
									uni.navigateTo({
										url: '/pages/user/vip/vip'
									})

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
								      function(res){
								      if(res.err_msg == "get_brand_wcpay_request:ok" ){
										  uni.showToast({
										  	icon: 'none',
										  	title: '支付成功'
										  })
										  that.getUserInfo();
								      }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
										  uni.showToast({
										  	icon: 'none',
										  	title: '支付取消'
										  })
									  }else{
										  uni.showToast({
										  	icon: 'none',
										  	title: '支付失败'
										  })
									  }
								   });
							}else{
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
								url: '/pages/user/vip/vip'
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
			
			successPayHandle: function(value) {
				if (value == 1) {
					this.onPay();
					this.payVisible = false;
				} else if (value == 2) {
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
	.head {
		padding: 100rpx 30rpx;
		background: url('https://demo.linfeng.tech/resource/images/vip-bg.png') no-repeat;

		.user-info {
			color: #fff;
			display: flex;

			.avatar {
				width: 110rpx;
				height: 110rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}

			.right {
				.name {
					font-size: 36rpx;
				}

				.txt {
					border-radius: 100rpx;
					font-size: 20rpx;
				}
			}
		}
	}

	.item-choose {
		background-color: #fff;
		margin: 30rpx;
		border-radius: 20rpx;
		padding: 20rpx;

		.option-wrap {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-gap: 20rpx;

			.option-item {
				border: 1px solid #999;
				border-radius: 10rpx;
				padding: 50rpx 20rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;

				.price-box {
					color: #fa5051;

					.vip-money {
						font-size: 20rpx;
					}

					.num {
						font-size: 40rpx;
						font-weight: bold;
					}
				}

				.month-price {
					font-size: 24rpx;
					color: #999;
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
			}
		}

		.pay-btn {
			padding: 20rpx;
			border-radius: 100rpx;
			background-image: linear-gradient(to right, #f4e4cb, #e9caad, #dfb492);
			color: #3d3f42;
			margin-top: 30rpx;
			text-align: center;
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
		margin: 30rpx;
		border-radius: 20rpx;
		background-color: #fff;

		.b-head {
			background-color: #3d3f42;
			color: #e2bda0;
			padding: 20rpx;
			border-radius: 20rpx 20rpx 0 0;
		}

		.grid-wrap {
			margin-top: 30rpx;
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			grid-gap: 60rpx 20rpx;
			padding: 20rpx;

			.vip-desc-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				image {
					width: 100rpx;
					height: 100rpx;
					margin-bottom: 10rpx;
				}

				.title {
					color: #000;
					font-size: 28rpx;
				}

				.sub {
					color: #616161;
					font-size: 20rpx;
				}
			}
		}
	}
</style>