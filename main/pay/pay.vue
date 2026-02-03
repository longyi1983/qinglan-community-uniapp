<template>
	<view class="container">
		<my-navbar title="支付" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 顶部说明区 -->
			<view class="hero">
				<view class="hero-title">{{ heroTitleText }}</view>
				<view class="hero-sub" v-if="payParams.productType == 2">选择支付方式 开始AI心理聊天</view>
				<view class="hero-sub" v-else>单次解锁或开通会员 畅享权益</view>
			</view>
		<!-- 联系客服获取7天会员 -->
		<view class="card customer-service-card elevate">
			<view class="cs-bg">
				<view class="sparkle sparkle-1">💬</view>
				<view class="sparkle sparkle-2">🎁</view>
				<view class="sparkle sparkle-3">⭐</view>
			</view>
			<view class="label service">
				<view class="label-icon">🔥</view>
				<text>热门</text>
			</view>
			<view class="cs-header">
				<view class="service-badge">社区福利</view>
				<view class="card-title">联系客服 免费获取7天会员</view>
			</view>
			<view class="benefit-box">
				<view class="main-benefit">
					<view class="benefit-icon">🎯</view>
					<view class="benefit-text">
						<view class="benefit-title">专属客服通道</view>
						<view class="benefit-desc">快速响应 · 专业服务</view>
					</view>
				</view>
			</view>
			<view class="feature-list">
				<view class="feature-item">
					<view class="feature-icon">✨</view>
					<text>7天VIP会员权益</text>
				</view>
				<view class="feature-item">
					<view class="feature-icon">🎈</view>
					<text>社区专属福利</text>
				</view>
				<view class="feature-item">
					<view class="feature-icon">⚡</view>
					<text>一对一贴心服务</text>
				</view>
			</view>
			<view class="claim-section">
				<view class="urgency-text">💡 联系客服，立即加入社区大家庭</view>
				<view class="btn service" @click="contactCustomerService">
					<view class="btn-content">
						<view class="btn-icon">💬</view>
						<text>联系客服获取</text>
					</view>
				</view>
			</view>
		</view>

		<view class="divider">
			<view class="line"></view>
			<view class="text">或</view>
			<view class="line"></view>
		</view>

		<!-- 新人免费领取3天会员 -->
		<view v-if="showNewUserCard && false" class="card new-user-card elevate">
			<view class="new-user-bg">
				<view class="sparkle sparkle-1">✨</view>
				<view class="sparkle sparkle-2">⭐</view>
				<view class="sparkle sparkle-3"></view>
			</view>
			<view class="label free">
				<view class="label-icon"></view>
				<text>免费</text>
			</view>
			<view class="new-user-header">
				<view class="welcome-badge">新人专享</view>
				<view class="card-title"> 限时福利大礼包</view>
			</view>
			<view class="benefit-box">
				<view class="main-benefit">
					<view class="benefit-icon"></view>
					<view class="benefit-text">
						<view class="benefit-title">免费3天VIP会员</view>
						<view class="benefit-desc">价值 ¥29.9</view>
					</view>
				</view>
			</view>
			<view class="feature-list">
				<view class="feature-item">
					<view class="feature-icon"></view>
					<text>全部功能无限制使用</text>
				</view>
				<view class="feature-item">
					<view class="feature-icon"></view>
					<text>专属AI聊天模式</text>
				</view>
				<view class="feature-item">
					<view class="feature-icon"></view>
					<text>高级量表解析报告</text>
				</view>
			</view>
			<view class="claim-section">
				<view class="urgency-text">⏰ 仅限新用户，错过不再有</view>
				<view class="btn free" @click="claimNewUserReward">
					<view class="btn-content">
						<view class="btn-icon"></view>
						<text>立即免费领取</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 单次支付解锁本次量表结果 -->
		<view class="card elevate">
			<view class="card-title">{{ cardTitleText }}</view>

			<!-- AI模式特有信息 -->
			<view v-if="payParams.productType == 2" class="ai-mode-info">
				<view class="ai-mode-name">{{ aiModeName }}</view>
				<view class="ai-mode-desc">{{ aiModeDescription }}</view>
				<view class="ai-duration" v-if="payParams.duration">
					<view class="duration-label">使用时长</view>
					<view class="duration-value">{{ payParams.duration }}{{ payParams.unit || '分钟' }}</view>
				</view>
			</view>

			<view class="price-line">
				<text class="price-symbol">¥</text>
				<text class="price-int">{{ priceInt }}</text>
				<text class="price-dec">.{{ priceDec }}</text>
			</view>
			<view class="sub">{{ cardSubText }}</view>
			<view class="btn primary" @click="openPayDialog">立即解锁</view>
		</view>

			<view class="divider">
				<view class="line"></view>
				<view class="text">或</view>
				<view class="line"></view>
			</view>

			<!-- 充值会员，享受全部功能免费使用 -->
			<view class="card member elevate">
				<view class="label hot">推荐</view>
				<view class="card-title">开通会员 畅享全部功能</view>
				<view class="sub" v-if="payParams.productType == 2">成为会员后AI聊天功能可无限使用，无时长限制</view>
				<view class="sub" v-else>成为会员后本功能可免费使用</view>
				<view class="chips" v-if="payParams.productType == 2">
					<view class="chip">无限聊天</view>
					<view class="chip">所有AI模式</view>
					<view class="chip">专属角色</view>
				</view>
				<view class="chips" v-else>
					<view class="chip">不限次查看</view>
					<view class="chip">专属内容</view>
					<!-- <view class="chip">免广告</view> -->
				</view>
				<view class="btn gold" @click="toVip">去开通会员</view>
			</view>



			<!-- 保障说明 -->
			<view class="guarantee">
				<view class="g-item">
					<u-icon name="lock" color="#7691FF" size="36"></u-icon>
					<text>安全支付</text>
				</view>
				<view class="g-item">
					<u-icon name="checkmark-circle" color="#00C853" size="36"></u-icon>
					<text>即刻生效</text>
				</view>
				<view class="g-item">
					<u-icon name="chat" color="#FFB300" size="36"></u-icon>
					<text>售后支持</text>
				</view>
			</view>

			<!-- 支付选择弹框 -->
			<view>
				<!--:money：支付金额  show：是否显示 @cancel:取消  @success：确认支付 -->
				<payDialog :money="displayPrice" :show="payVisible" @cancel="cancelPayHandle" @success="successPayHandle">
				</payDialog>
			</view>
		</view>
	</view>
</template>

<script>
import scrollMixin from '@/mixins/scrollMixin.js';
import config from '@/utils/config.js'
import payDialog from '@/components/payDialog/payDialog.vue'
// #ifdef H5
import wxMpUtil from '@/utils/wxMpUtil.js'
// #endif
export default {
	mixins: [scrollMixin],
	data() {
		return {
			// 固定支付参数（根据后端要求先写死）
			payParams: {
				from: 'weixin',
				orderSn: '',
				paidPrice: 0,
				price: 100,
				productId: 12510,
				productType: 1,
				recharId: '',
				mode: ''
			},
			displayPrice: '100.00',
			orderId: 0,
			userInfo: {},
			// 新人卡片相关
			showNewUserCard: false,
			hasClaimedReward: false,
			// 支付弹框相关
			payVisible: false
		};
	},
	components: {
		payDialog
	},
	computed: {
		priceInt() {
			const s = (this.displayPrice || '0.00').split('.')
			return s[0] || '0'
		},
		priceDec() {
			const s = (this.displayPrice || '0.00').split('.')
			return s[1] || '00'
		},
		heroTitleText() {
			if (this.payParams.productType == 1) {
				return '获取量表结果'
			} else if (this.payParams.productType == 2) {
				return '开启AI聊天'
			} else {
				return '获取评估结果'
			}
		},
		cardTitleText() {
			if (this.payParams.productType == 1) {
				return '解锁本次量表结果'
			} else if (this.payParams.productType == 2) {
				return '解锁AI聊天功能'
			} else {
				return '解锁本次评估结果'
			}
		},
		cardSubText() {
			if (this.payParams.productType == 1) {
				return '支付后立即查看本次量表结果'
			} else if (this.payParams.productType == 2) {
				const duration = this.payParams.duration || 0;
				const unit = this.payParams.unit || '分钟';
				return `支付后可使用AI聊天功能 ${duration}${unit}`
			} else {
				return '支付后立即查看本次评估结果'
			}
		},
		aiModeName() {
			const modeNames = {
				'OH': '爱卡模式',
				'CC': 'AI聊愈师',
				'ED': 'AI探梦',
				'CBT': 'AI CBT'
			}
			if (this.payParams && this.payParams.mode && modeNames[this.payParams.mode]) {
				return modeNames[this.payParams.mode]
			}
			return modeNames[this.payParams.productId] || 'AI聊天模式'
		},
		aiModeDescription() {
			const modeDescs = {
				'OH': '透过潜意识投射，实现自我觉察',
				'CC': '有温度懂共情会反问的AI聊天机器人',
				'ED': '开启你的探梦之旅吧',
				'CBT': '多模态的认知行为疗法'
			}
			if (this.payParams && this.payParams.mode && modeDescs[this.payParams.mode]) {
				return modeDescs[this.payParams.mode]
			}
			return modeDescs[this.payParams.productId] || '专业的AI心理聊天服务'
		}
	},
	onLoad(options) {
		// 初始化展示金额（以写死的 payParams.price 为准，可被外部参数覆盖）
		const override = Number(options?.price)
		const finalPrice = isNaN(override) ? Number(this.payParams.price) : override
		this.payParams.price = finalPrice
		this.displayPrice = Number(this.payParams.price).toFixed(2)

		// 从路由获取 productId 与 productType 与 mode（优先使用路由参数）
		if (typeof options?.productId !== 'undefined') {
			const pidNum = Number(options.productId)
			this.payParams.productId = isNaN(pidNum) ? options.productId : pidNum
		}
		if (typeof options?.productType !== 'undefined') {
			const ptypeNum = Number(options.productType)
			this.payParams.productType = isNaN(ptypeNum) ? options.productType : ptypeNum
		}
		if (typeof options?.mode !== 'undefined') {
			this.payParams.mode = options.mode
		}

		// 获取AI聊天的时长相关参数
		if (typeof options?.duration !== 'undefined') {
			const durationNum = Number(options.duration)
			this.payParams.duration = isNaN(durationNum) ? options.duration : durationNum
		}
		if (typeof options?.unit !== 'undefined') {
			this.payParams.unit = decodeURIComponent(options.unit)
		}

		this.getUserInfo()
		this.checkNewUserReward()

		// #ifdef H5
		if (config.wxh5Login) {
			wxMpUtil.checkAndSaveWxMpOpenid(options?.code, '/main/pay/pay')
		}
		// #endif
	},
	onPageScroll(e) {
		this.handlePageScroll(e)
	},
	methods: {
		getUserInfo() {
			this.$H.get('user/userInfo').then(res => {
				this.userInfo = res.result || {}
				uni.setStorageSync('userInfo', this.userInfo)
			})
		},

		// 检查新人奖励状态
		checkNewUserReward() {
			this.$H.get('qlReward/whetherToClaim').then(res => {
				if (res.code === 200) {
					// 如果返回false，表示没有领取过，显示卡片
					this.showNewUserCard = !res.data
					this.hasClaimedReward = res.data
				}
			}).catch(err => {
				console.log('检查新人奖励状态失败:', err)
				this.showNewUserCard = false
			})
		},

		// 领取新人奖励
		claimNewUserReward() {
			uni.showLoading({ mask: true, title: '领取中...' })
			this.$H.get('qlReward/newUserRewards').then(res => {
				uni.hideLoading()
				if (res.code === 200) {
					this.$u.toast('领取成功！已为您开通3天会员')
					this.showNewUserCard = false
					this.hasClaimedReward = true
					// 更新用户信息
					this.getUserInfo();
					this.onPaidSuccess();
				} else {
					this.$u.toast(res.msg || '领取失败')
				}
			}).catch(err => {
				uni.hideLoading()
				this.$u.toast(err.msg || '领取失败')
			})
		},

		openPayDialog() {
			if (!this.payParams.price || Number(this.payParams.price) <= 0) {
				this.$u.toast('金额异常，无法发起支付')
				return
			}
			this.payVisible = true
		},

		openPay() {
			if (!this.payParams.price || Number(this.payParams.price) <= 0) {
				this.$u.toast('金额异常，无法发起支付')
				return
			}
			this.handlePay()
		},

		// 统一发起支付
		handlePay(couponId = null) {
			uni.showLoading({ mask: true, title: '支付中...' })
			// 根据环境标记 from 参数
			// #ifdef APP-PLUS
			this.payParams.from = 'app'
			// #endif
			// #ifdef H5
			let ua = navigator.userAgent.toLowerCase();
			this.payParams.from = (ua.match(/MicroMessenger/i) == 'micromessenger') ? 'wxh5' : 'h5'
			// #endif
			// #ifdef MP-WEIXIN
			this.payParams.from = 'weixin'
			// #endif

			// 构建请求参数
			let payParams = { ...this.payParams };
			
			// 如果选择了优惠券，添加优惠券ID参数
			if (couponId) {
				payParams.userCouponRecordId = couponId;
			}
			
			this.$H.post('user/payCharge', payParams)
				.then(res => {
					uni.hideLoading()
					if (res.code !== 0) {
						this.$u.toast(res.msg || '下单失败')
						return
					}
					const payData = res.data || {}

					// #ifdef MP-WEIXIN
					uni.requestPayment({
						provider: 'wxpay',
						timeStamp: payData.timeStamp,
						nonceStr: payData.nonceStr,
						package: payData.package,
						signType: payData.signType,
						paySign: payData.paySign,
						success: () => { this.$u.toast('支付成功'); this.onPaidSuccess() },
						fail: () => { this.$u.toast('支付取消') }
					})
					// #endif

					// #ifdef APP-PLUS
					let str = payData.package || ''
					var index = str.lastIndexOf('=')
					str = index > 0 ? str.substring(index + 1, str.length) : ''
					var obj = {
						appid: payData.appId,
						noncestr: payData.nonceStr,
						package: 'Sign=WXPay',
						prepayid: str,
						timestamp: payData.timeStamp,
						sign: payData.paySign,
						partnerid: payData.partnerId
					}
					uni.requestPayment({
						provider: 'wxpay', orderInfo: obj,
						success: () => { this.$u.toast('支付成功'); this.onPaidSuccess() },
						fail: () => { this.$u.toast('支付取消') }
					})
					// #endif

					// #ifdef H5
					let uaH5 = navigator.userAgent.toLowerCase();
					if (uaH5.match(/MicroMessenger/i) == 'micromessenger') {
						// 公众号内
						// eslint-disable-next-line no-undef
						WeixinJSBridge.invoke('getBrandWCPayRequest', {
							appId: payData.appId,
							timeStamp: payData.timeStamp,
							nonceStr: payData.nonceStr,
							package: payData.package,
							signType: payData.signType,
							paySign: payData.paySign
						}, (r) => {
							if (r.err_msg === 'get_brand_wcpay_request:ok') { this.$u.toast('支付成功'); this.onPaidSuccess() }
							else if (r.err_msg === 'get_brand_wcpay_request:cancel') { this.$u.toast('支付取消') }
							else { this.$u.toast('支付失败') }
						})
					} else if (payData.mwebUrl) {
						location.replace(payData.mwebUrl)
					} else {
						this.$u.toast('不支持的H5支付方式')
					}
					// #endif
				})
				.catch(err => {
					uni.hideLoading()
					this.$u.toast(err.msg || '支付失败')
				})
		},

		// 支付成功后的处理
		onPaidSuccess() {
			// 获取上一个页面的路径
			const pages = getCurrentPages();
			if (pages.length > 1) {
				const prevPage = pages[pages.length - 2];
				const prevRoute = prevPage.route;

				const prevOptions = prevPage.options || {};
				let redirectUrl = `/${prevRoute}`;

				// 重新构建查询参数
				const params = [];
				Object.keys(prevOptions).forEach(key => {
					if (prevOptions[key]) {
						params.push(`${key}=${prevOptions[key]}`);
					}
				});

				if (params.length > 0) {
					redirectUrl += `?${params.join('&')}`;
				}

				console.log('AI支付成功，重定向到:', redirectUrl);
				uni.redirectTo({ url: redirectUrl });
			}
		},


		// 联系客服
		contactCustomerService() {
			// 调用客服接口，参考my.vue中的实现
			this.$f.customerService({
				title: "申请7天免费会员",
				// path: '/main/pay/pay',
				img: ""
			});
		},

		// 支付弹框处理方法
		successPayHandle(payData) {
			if (payData.payType == 1) {
				// 微信支付使用优惠券
				this.handlePay(payData.couponId)
				this.payVisible = false
			} else if (payData.payType == 2) {
				// 青蓝币支付不使用优惠券
				this.handleCoinPay()
				this.payVisible = false
			} else {
				this.$u.toast("请选择支付方式")
			}
		},

		cancelPayHandle() {
			this.payVisible = false
		},

		// 青蓝币支付
		handleCoinPay() {
			uni.showLoading({ mask: true, title: '支付中...' })
			
			// 使用与微信支付相同的参数结构，但不使用优惠券
			const coinPayParams = {
				...this.payParams,
				from: 'coin' // 标记为青蓝币支付
			}

			this.$H.post('userCoin/payCharge', coinPayParams)
				.then(res => {
					uni.hideLoading()
					if (res.code !== 200) {
						this.$u.toast(res.msg || '支付失败')
						return;
					}
					this.$u.toast('支付成功')
					this.onPaidSuccess()
				})
				.catch(err => {
					uni.hideLoading()
					this.$u.toast(err.msg || '支付失败')
				})
		},

		// 跳转
		goTo(item) {
			uni.navigateTo({ url: item.url });
		},
		toVip() {
			uni.navigateTo({ url: '/main/my/vip/vip' })
		},
		// 点击立即解锁时直接发起 user/payCharge 支付
		payByWechat() { this.handlePay() }
	}
};
</script>
<style lang="scss" scoped>
.innerContainer {
	padding: $gap;
}

.container {
	position: relative;
	min-height: 100vh;
	background-color: $background;
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
	background-image: url('https://ceping.qinglan.cn/uniapp/new/index/1.png');
	background-size: cover;
	background-position: center;
}

.hero {
	margin-bottom: 24rpx;
	background: rgba(255, 255, 255, 0.6);
	border-radius: 16rpx;
	padding: 24rpx;
	backdrop-filter: blur(8rpx);

	.hero-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1B1B26;
	}

	.hero-sub {
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 26rpx;
	}
}

.card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	position: relative;

	.label {
		position: absolute;
		right: 0;
		top: 0;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: #fff;
		font-size: 22rpx;
		padding: 6rpx 14rpx;
		border-radius: 0 16rpx 0 16rpx;

		&.hot {
			background: linear-gradient(166deg, #FFEFC4 0%, #FFE3A7 100%);
			color: #7A5200;
		}

		&.free {
			background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
			color: #fff;
			display: flex;
			align-items: center;
			gap: 6rpx;
			
			.label-icon {
				font-size: 20rpx;
			}
		}
	}

	&.member {
		background: #232C56;

		.color-white {
			color: #fff;
		}

		.card-title {
			color: #FFF0CD;
		}

		.sub {
			color: #B5B5CA;
		}
	}

	&.customer-service-card {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
		border: none;
		padding: 0;
		overflow: hidden;
		position: relative;
		
		.cs-bg {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
			
			.sparkle {
				position: absolute;
				font-size: 24rpx;
				animation: sparkle 2s infinite ease-in-out;
				
				&.sparkle-1 {
					top: 20rpx;
					right: 60rpx;
					animation-delay: 0s;
				}
				
				&.sparkle-2 {
					top: 120rpx;
					right: 20rpx;
					animation-delay: 0.5s;
				}
				
				&.sparkle-3 {
					bottom: 80rpx;
					left: 30rpx;
					animation-delay: 1s;
				}
			}
		}
		
		> * {
			position: relative;
			z-index: 2;
		}
		
		.cs-header {
			padding: 32rpx 32rpx 20rpx 32rpx;
			
			.service-badge {
				display: inline-block;
				background: rgba(255, 255, 255, 0.9);
				color: #6366f1;
				font-size: 22rpx;
				font-weight: 600;
				padding: 6rpx 16rpx;
				border-radius: 20rpx;
				margin-bottom: 16rpx;
				backdrop-filter: blur(4rpx);
			}
		}

		.card-title {
			color: #fff;
			font-size: 36rpx;
			font-weight: 700;
			margin-bottom: 0;
			text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		}
		
		.benefit-box {
			padding: 0 32rpx 20rpx 32rpx;
			
			.main-benefit {
				display: flex;
				align-items: center;
				background: rgba(255, 255, 255, 0.15);
				border-radius: 16rpx;
				padding: 20rpx;
				backdrop-filter: blur(8rpx);
				border: 1rpx solid rgba(255, 255, 255, 0.2);
				
				.benefit-icon {
					font-size: 48rpx;
					margin-right: 16rpx;
				}
				
				.benefit-text {
					flex: 1;
					
					.benefit-title {
						color: #fff;
						font-size: 28rpx;
						font-weight: 600;
						margin-bottom: 4rpx;
					}
					
					.benefit-desc {
						color: rgba(255, 255, 255, 0.8);
						font-size: 22rpx;
					}
				}
			}
		}
		
		.feature-list {
			padding: 0 32rpx 24rpx 32rpx;
			
			.feature-item {
				display: flex;
				align-items: center;
				margin-bottom: 12rpx;
				color: #fff;
				font-size: 24rpx;
				
				.feature-icon {
					font-size: 26rpx;
					margin-right: 12rpx;
					width: 32rpx;
					text-align: center;
				}
				
				&:last-child {
					margin-bottom: 0;
				}
			}
		}
		
		.claim-section {
			padding: 20rpx 32rpx 32rpx 32rpx;
			
			.urgency-text {
				text-align: center;
				color: rgba(255, 255, 255, 0.9);
				font-size: 22rpx;
				margin-bottom: 16rpx;
				animation: pulse 2s infinite;
			}
		}
		
		.label {
			&.service {
				background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
				color: #fff;
				display: flex;
				align-items: center;
				gap: 6rpx;
				
				.label-icon {
					font-size: 20rpx;
				}
			}
		}
	}

	&.new-user-card {
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFB3B3 100%);
		border: none;
		padding: 0;
		overflow: hidden;
		position: relative;
		
		.new-user-bg {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
			
			.sparkle {
				position: absolute;
				font-size: 24rpx;
				animation: sparkle 2s infinite ease-in-out;
				
				&.sparkle-1 {
					top: 20rpx;
					right: 60rpx;
					animation-delay: 0s;
				}
				
				&.sparkle-2 {
					top: 120rpx;
					right: 20rpx;
					animation-delay: 0.5s;
				}
				
				&.sparkle-3 {
					bottom: 80rpx;
					left: 30rpx;
					animation-delay: 1s;
				}
			}
		}
		
		> * {
			position: relative;
			z-index: 2;
		}
		
		.new-user-header {
			padding: 32rpx 32rpx 20rpx 32rpx;
			
			.welcome-badge {
				display: inline-block;
				background: rgba(255, 255, 255, 0.9);
				color: #FF6B6B;
				font-size: 22rpx;
				font-weight: 600;
				padding: 6rpx 16rpx;
				border-radius: 20rpx;
				margin-bottom: 16rpx;
				backdrop-filter: blur(4rpx);
			}
		}

		.card-title {
			color: #fff;
			font-size: 36rpx;
			font-weight: 700;
			margin-bottom: 0;
			text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		}
		
		.benefit-box {
			padding: 0 32rpx 20rpx 32rpx;
			
			.main-benefit {
				display: flex;
				align-items: center;
				background: rgba(255, 255, 255, 0.15);
				border-radius: 16rpx;
				padding: 20rpx;
				backdrop-filter: blur(8rpx);
				border: 1rpx solid rgba(255, 255, 255, 0.2);
				
				.benefit-icon {
					font-size: 48rpx;
					margin-right: 16rpx;
				}
				
				.benefit-text {
					flex: 1;
					
					.benefit-title {
						color: #fff;
						font-size: 28rpx;
						font-weight: 600;
						margin-bottom: 4rpx;
					}
					
					.benefit-desc {
						color: rgba(255, 255, 255, 0.8);
						font-size: 22rpx;
						text-decoration: line-through;
					}
				}
			}
		}
		
		.feature-list {
			padding: 0 32rpx 24rpx 32rpx;
			
			.feature-item {
				display: flex;
				align-items: center;
				margin-bottom: 12rpx;
				color: #fff;
				font-size: 24rpx;
				
				.feature-icon {
					font-size: 26rpx;
					margin-right: 12rpx;
					width: 32rpx;
					text-align: center;
				}
				
				&:last-child {
					margin-bottom: 0;
				}
			}
		}
		
		.claim-section {
			padding: 20rpx 32rpx 32rpx 32rpx;
			
			.urgency-text {
				text-align: center;
				color: rgba(255, 255, 255, 0.9);
				font-size: 22rpx;
				margin-bottom: 16rpx;
				animation: pulse 2s infinite;
			}
		}
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1B1B26;
		margin-bottom: 16rpx;
	}

	.ai-mode-info {
		margin-bottom: 20rpx;
		padding: 16rpx 20rpx;
		background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%);
		border-radius: 12rpx;
		border-left: 4rpx solid #7691FF;

		.ai-mode-name {
			font-size: 28rpx;
			font-weight: 600;
			color: #7691FF;
			margin-bottom: 8rpx;
		}

		.ai-mode-desc {
			font-size: 24rpx;
			color: #5a6c7d;
			line-height: 1.4;
			margin-bottom: 12rpx;
		}

		.ai-duration {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8rpx 12rpx;
			background: rgba(118, 145, 255, 0.1);
			border-radius: 8rpx;
			border: 1rpx solid rgba(118, 145, 255, 0.2);

			.duration-label {
				font-size: 22rpx;
				color: #5a6c7d;
			}

			.duration-value {
				font-size: 24rpx;
				font-weight: 600;
				color: #7691FF;
			}
		}
	}

	.price-line {
		display: flex;
		align-items: baseline;
		margin: 8rpx 0 12rpx 0;

		.price-symbol {
			font-size: 28rpx;
			color: #1B1B26;
			margin-right: 6rpx;
		}

		.price-int {
			font-size: 60rpx;
			font-weight: 800;
			color: #1B1B26;
			letter-spacing: 1rpx;
		}

		.price-dec {
			font-size: 32rpx;
			font-weight: 700;
			color: #1B1B26;
		}
	}

	.sub {
		font-size: 26rpx;
		color: #777;
		margin-bottom: 20rpx;
	}

	.btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		border-radius: 16rpx;
		background: #F0F2F5;
		color: #333;

		&.primary {
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			color: #fff;
		}

		&.gold {
			background: linear-gradient(166deg, #FFEFC4 0%, #FFE3A7 100%);
			color: #7A5200;
			font-weight: 700;
		}

		&.free {
			background: linear-gradient(135deg, #fff 0%, #f8f8f8 100%);
			color: #FF6B6B;
			font-weight: 700;
			border: 2rpx solid rgba(255, 255, 255, 0.3);
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
			transform: scale(1);
			transition: all 0.3s ease;
			
			.btn-content {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				
				.btn-icon {
					font-size: 28rpx;
					animation: bounce 1s infinite;
				}
			}
			
			&:active {
				transform: scale(0.98);
			}
		}

		&.service {
			background: linear-gradient(135deg, #fff 0%, #f8f8f8 100%);
			color: #6366f1;
			font-weight: 700;
			border: 2rpx solid rgba(255, 255, 255, 0.3);
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
			transform: scale(1);
			transition: all 0.3s ease;
			
			.btn-content {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				
				.btn-icon {
					font-size: 28rpx;
					animation: bounce 1s infinite;
				}
			}
			
			&:active {
				transform: scale(0.98);
			}
		}
	}
}

.chips {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	margin: 8rpx 0 20rpx 0;
}

.chip {
	padding: 8rpx 14rpx;
	font-size: 22rpx;
	border-radius: 100rpx;
	background: rgba(255, 255, 255, 0.12);
	color: #FFF0CD;
	border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.elevate {
	box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.08);
}

.divider {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 24rpx 0;

	.text {
		margin: 0 16rpx;
		color: #9aa0a6;
		font-size: 24rpx;
	}

	.line {
		flex: 1;
		height: 1rpx;
		background: rgba(0, 0, 0, 0.08);
	}
}

.guarantee {
	display: flex;
	justify-content: space-around;
	align-items: center;
	margin-top: 12rpx;
	color: #6b7280;
	font-size: 24rpx;

	.g-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}
}

/* 动画效果 */
@keyframes sparkle {
	0%, 100% { 
		opacity: 0.3; 
		transform: scale(0.8); 
	}
	50% { 
		opacity: 1; 
		transform: scale(1.2); 
	}
}

@keyframes pulse {
	0%, 100% { 
		opacity: 0.8; 
	}
	50% { 
		opacity: 1; 
	}
}

@keyframes bounce {
	0%, 100% { 
		transform: translateY(0); 
	}
	50% { 
		transform: translateY(-4rpx); 
	}
}
</style>