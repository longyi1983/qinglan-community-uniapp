<template>
	<view class="container">
		<my-navbar title="评估结果说明" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="type-container">
				<view class="sheep">
					<u-image :src="sheep" width="200rpx" height="255rpx"></u-image>
				</view>
				<view class="desc">
					<view class="name">
						<view class="">
							<image src="@/static/scale/arrow.png" mode=""></image>
						</view>
						Hi，我是可可
					</view>
					<!-- 需要付费时显示付费卡片 -->
					<view v-if="needPayment" class="pay-container">
						<view class="pay-card">
							<view class="pay-icon">
								<u-icon name="lock" color="#7691FF" size="80"></u-icon>
							</view>
							<view class="pay-title">该功能为付费内容</view>
							<view class="pay-desc">支付后可查看完整的评估结果分析</view>
							<view class="pay-price" v-if="paymentData && paymentData.amount">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ paymentData.amount }}</text>
							</view>
							<view class="pay-btn" @click="goToPayForResult">
								<text>立即解锁</text>
								<u-icon name="arrow-right" color="#fff" size="24"></u-icon>
							</view>
						</view>
					</view>
					<view class="detail" v-else>
						<view v-for="(item, index) in detail[type]" :key="index" class="typewriter-text">
							{{ displayText[index] }}
						</view>
					</view>
				</view>
			</view>
			<view class="btn" v-if="isTextComplete && !isRequesting && !needPayment" @click="goRate">
				评价
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				sheep: this.$f.geturl("/uniapp/new/ai-bot/3-logo.png"),
				type: "",
				displayText: [],
				typewriterSpeed: 50, // 打字速度(ms)
				currentIndex: 0,
				currentTextIndex: 0,
				isTextComplete: false,
				isRequesting: false,
				needPayment: false,
				paymentData: null,
				detail: {
					// 正常查结果
					"1": [
						"正在分析您的测试结果，大致需要30秒左右，请稍后...",
					],
					// 医生转接
					"2": [
						"根据您的情况，我们建议您进行医生转接，以便获得更专业的诊断和治疗。",
						"医生会根据您的具体情况进行评估，并给出相应的建议和治疗方案。",
						"请你拨打12355，进行医生转接。或者去往当地医院进行就诊。"
					],
					// 危机干预
					"3": [
						"亲爱的用户：感谢您完成了本次心理健康评估。我们理解这是一次需要勇气与自我觉察的旅程，您的每一步关注都是对自我健康的负责。以下是系统根据您的测试结果提供的简要分析，以及您可以选择的后续支持方案：",
						"评估结果说明：根据国际通用的心理健康评估标准（SCL-90量表），您的当前状态可能存在情绪波动或心理压力。这可能是暂时性的应激反应，也可能是需要进一步关注的信号。请不必过度担忧，许多人在生命的不同阶段都会经历类似状态，重要的是及时采取积极行动。",
						"您可以选择的行动方案：自我调节与日常支持：记录情绪日记：每天花5分钟记录情绪变化及触发事件，帮助识别压力源并建立掌控感（研究表明，书写本身具有疗愈作用）。尝试正念练习：通过呼吸训练、冥想等放松身心。",
						"专业支持建议：初步咨询：建议联系学校/单位的心理咨询师或社区心理服务站点，进行1-2次深度访谈以明确需求。医疗机构转介：若症状持续两周以上或影响生活，可前往当地精神卫生中心或综合医院心理科进行专业诊断。",
						"社会支持网络：亲友沟通：选择信任的家人或朋友分享感受，减少孤独感。互助社群：加入由专业机构运营的线上/线下支持小组。",
						"重要提醒：本结果不作为临床诊断依据，需结合专业评估综合判断。所有数据均加密处理，您的隐私将严格受保护。"
					]
				},
				assessmentData: null,
			};
		},
		computed: {},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(options) {
			this.type = options.type;
			this.initTypewriter();
			if (options.id) {
				this.getAssessmentDetail(options.id);
				return;
			}
			if (this.type == "1") {
				this.getResult();
			}
		},
		methods: {
			handleResult(response) {
				// 定义显示顺序，现状解读排在前面
				const displayOrder = ['现状解读', '改善建议'];
				const formattedContent = displayOrder
					.filter(key => response.output[key]) // 只处理存在的key
					.map(key => `${key}：${response.output[key]}`);

				this.detail["1"] = formattedContent;
				this.isRequesting = false;

				this.initTypewriter();
			},
			getResult() {
				this.isRequesting = true;
				this.isTextComplete = false;
				this.needPayment = false;
				let data = uni.getStorageSync(`evaluation`);
				console.log("data", data);
				this.$H.post(`/psychologicalAssessment/analysis`, data)
					.then(res => {
						// 需要付费的情况由页面自行处理
						if (res && res.code === 666) {
							this.isRequesting = false;
							this.needPayment = true;
							this.paymentData = res.data || {};
							console.log('评估结果需要付费：', this.paymentData);
							this.goToPayForResult();
						}
						const response = JSON.parse(res.data);
						console.log("output", response);
						this.handleResult(response);
					})
					.catch(err => {
						this.isRequesting = false;
					})
			},
			initTypewriter() {
				if (!this.detail[this.type]) return;
				this.displayText = new Array(this.detail[this.type].length).fill('');
				this.currentIndex = 0;
				this.currentTextIndex = 0;
				this.isTextComplete = false;
				this.startTypewriter();
			},
			startTypewriter() {
				if (!this.detail[this.type]) return;
				const text = this.detail[this.type][this.currentTextIndex];
				if (this.currentIndex < text.length) {
					this.$set(this.displayText, this.currentTextIndex,
						text.substring(0, this.currentIndex + 1));
					this.currentIndex++;
					setTimeout(() => {
						this.startTypewriter();
					}, this.typewriterSpeed);
				} else {
					this.currentTextIndex++;
					if (this.currentTextIndex < this.detail[this.type].length) {
						this.currentIndex = 0;
						setTimeout(() => {
							this.startTypewriter();
						}, 500); // 段落之间的延迟
					} else {
						this.isTextComplete = true;
					}
				}
			},
			test() {
				if (this.type == "1") {
					this.goTo({
						url: "/scale/test/test?id=24&type=1"
					});
					return;
				}
			},
			// 跳转
			goRate() {
				uni.navigateTo({
					url: "/scale/evaluation/rate/rate"
				});
			},
			// 获取评估详情
			getAssessmentDetail(id) {
				this.$H.get(`psychologicalAssessment/${id}`)
					.then(res => {
						if (res.code === 200 && res.data) {
							const data = JSON.parse(res.data.aiResponseData);
							console.log(11111111111,data)
							this.handleResult(data);
						}
					})
					.catch(err => {
						console.error('Failed to fetch assessment detail:', err);
					});
			},
			// 跳转到支付页面
			goToPayForResult() {
				if (!this.paymentData) return;
				
				const amount = this.paymentData.amount || 0;
				const productType = this.paymentData.productType || 3;
				const productId = this.paymentData.productId || '';
				
				let url = `/main/pay/pay?price=${amount}&productType=${productType}`;
				if (productId) url += `&productId=${productId}`;
				
				console.log('跳转到评估结果支付页面:', url);
				uni.navigateTo({ url });
			},
			// 检查支付状态
			checkPaymentStatus() {
				// 重新请求评估结果，看是否还需要付费
				if (this.type == "1") {
					this.getResult();
				}
			}
		},
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
			box-sizing: border-box;
			padding: $gap;
			// height: 188rpx;
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
				margin-top: $gap;
				font-weight: 400;
				font-size: 28rpx;
				color: #5B5B6E;

				view {
					text-indent: 2em;
					margin-bottom: 10rpx;
				}
			}
		}
	}

	.btn {
		border-radius: 100rpx;
		font-size: 32rpx;
		text-align: center;
		width: 686rpx;
		height: 88rpx;
		line-height: 88rpx;
		margin: 0 auto;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: white;
		border-radius: 16rpx;
	}

	.content {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		border: 1rpx solid #FFFFFF;
		backdrop-filter: blur(30px);
		box-sizing: border-box;
		margin-top: 20rpx;
		padding: $gap;

		.options-list {
			.option-item {
				display: flex;
				align-items: center;
				padding: 30rpx;
				margin-bottom: 20rpx;
				border-radius: 16rpx;
				background: #F8FAFF;
				color: #333;
				transition: all 0.3s ease;

				&.active {
					background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
					color: white;
				}

				.option-text {
					flex: 1;
					font-size: 28rpx;
					line-height: 1.5;
				}
			}
		}
	}

	.typewriter-text {
		min-height: 1.5em;
	}

	.pay-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
		padding: 40rpx;
	}

	.pay-card {
		width: 100%;
		max-width: 600rpx;
		background: #ffffff;
		border-radius: 24rpx;
		padding: 60rpx 40rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;

		.pay-icon {
			width: 120rpx;
			height: 120rpx;
			background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%);
			border-radius: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.pay-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #1B1B26;
		}

		.pay-desc {
			font-size: 28rpx;
			color: #5B5B6E;
			line-height: 1.5;
		}

		.pay-price {
			display: flex;
			align-items: baseline;
			justify-content: center;
			margin: 20rpx 0;

			.price-symbol {
				font-size: 28rpx;
				color: #7691FF;
				margin-right: 6rpx;
			}

			.price-value {
				font-size: 48rpx;
				font-weight: 700;
				color: #7691FF;
			}
		}

		.pay-btn {
			width: 100%;
			height: 88rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			color: #fff;
			font-size: 32rpx;
			font-weight: 600;
			margin-top: 20rpx;
		}
	}
</style>