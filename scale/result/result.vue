<template>
	<view class="">
		<!-- #ifdef MP-WEIXIN -->
		<page-container :show="isShow" custom-style="height:100vh;overflow:hidden" :overlay="false"
			@beforeleave="onBeforeLeave">
			<!-- #endif -->
			<view class="container">
				<my-navbar title="解析" :navBg="navBg"></my-navbar>
				<scroll-view scroll-y class="scroll-container" @scroll="onScroll">
					<view class="innerContainer">
						<view v-if="needPay" class="pay-required">
							<view class="pay-lock">
								<u-icon name="lock" color="#7691FF" size="36"></u-icon>
								<text class="pay-title">该结果为付费内容</text>
							</view>
							<view class="pay-sub">支付后即可查看完整量表结果</view>
                            <view class="pay-amount">¥ {{ payAmountDisplay }}</view>
							<view class="pay-btn" @click="goToPay">去支付</view>
						</view>

						<view v-else class="content">
							<view class="top">
								<!-- 头像昵称 -->
								<view class="info">
									<u-avatar :src="userInfo.avatar"></u-avatar>
									<text class="nickname">{{ userInfo.username }}</text>
									<text class="word">的解析结果</text>
								</view>
								<!-- OH卡图片 -->
								<view class="oh">
									<u-image width="240rpx" height="240rpx" :src="oh" shape="circle"></u-image>
								</view>
							</view>
							<view class="result-code">
								{{ resultCode }}
							</view>
							<!-- 彩虹图 -->
							<view v-if="resData.scaleName && resData.scaleName.includes('MBTI')" class="rainbow-chart">
								<view v-for="item in chartList" :key="item.key" class="rainbow-row">
									<text class="rainbow-label">{{ item.leftLabel }}</text>
									<view class="rainbow-bar">
										<view class="rainbow-bar-left" :style="{
											width: item.leftWidth + '%',
											background: item.leftColor,
											borderTopLeftRadius: '9px',
											borderBottomLeftRadius: '9px'
										}"></view>
										<view class="rainbow-bar-right" :style="{
											width: item.rightWidth + '%',
											background: item.rightColor,
											borderTopRightRadius: '9px',
											borderBottomRightRadius: '9px'
										}"></view>
									</view>
									<text class="rainbow-label">{{ item.rightLabel }}</text>
								</view>
							</view>
							<view class="result">
								<mp-html :content="result"></mp-html>
							</view>
						</view>

						<!-- 底部栏 -->
						<view class="bottom">
							<view class="button" @click="goToRetest">
								重新测试
							</view>
							<!-- #ifdef MP -->
							<button class="button share-button" open-type="share">
								<image src="@/static/scale/share.png" mode=""></image>
								分享
							</button>
							<!-- #endif -->
							<view v-if="scaleId === '23' || scaleId === '24'" class="button"
								@click="showArchiveSelectorDialog">
								加入档案
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
			<!-- #ifdef MP-WEIXIN -->
		</page-container>
		<!-- #endif -->

		<!-- 档案选择器 -->
		<archive-selector :show="showArchiveSelector" @confirm="onArchiveSelected" @close="onArchiveSelectorClose"
			@newArchive="onNewArchive" />
	</view>
</template>

<script>
import scrollMixin from '@/mixins/scrollMixin.js';
export default {
	mixins: [scrollMixin],
	data() {
		return {
			userInfo: this.$store.state.loginUserInfo,
			oh: this.$f.geturl(`/uniapp/new/scale/scale.png`),
			id: "",
			archiveId: "",
			result: "",
			resultCode: "",
			scaleId: "",
			isNavigatingAway: false, // 标记是否是主动跳转而非返回操作
			isShow: true, // page-container的显示状态
			resData: {},
			// 付费查看
			needPay: false,
			payAmount: 0,
			// 档案选择器相关
			showArchiveSelector: false,
			history: null,
			rainbowConfig: [{
				key: 'EI',
				left: 'E',
				right: 'I',
				leftLabel: '外向 E',
				rightLabel: 'I 内向',
				color: '#7691FF',
				inactiveColor: '#E6ECFF'
			},
			{
				key: 'SN',
				left: 'S',
				right: 'N',
				leftLabel: '实感 S',
				rightLabel: 'N 直觉',
				color: '#51A28B',
				inactiveColor: '#D6F2E7'
			},
			{
				key: 'TF',
				left: 'T',
				right: 'F',
				leftLabel: '理性 T',
				rightLabel: 'F 情感',
				color: '#FFA940',
				inactiveColor: '#FFE7C2'
			},
			{
				key: 'JP',
				left: 'J',
				right: 'P',
				leftLabel: '计划 J',
				rightLabel: 'P 随性',
				color: '#FF7A45',
				inactiveColor: '#FFD6CC'
			}
			]
		};
	},
	computed: {
		chartList() {
			if (!this.resData.factorScore) return [];
			const score = typeof this.resData.factorScore === 'string' ?
				JSON.parse(this.resData.factorScore) :
				this.resData.factorScore;
			return this.rainbowConfig.map(cfg => {
				const leftScore = score[cfg.left] || 0;
				const rightScore = score[cfg.right] || 0;
				let leftWidth = 50,
					rightWidth = 50;
				let leftColor = '#e0e0e0',
					rightColor = '#e0e0e0';

				if (leftScore > rightScore) {
					leftWidth = 100;
					rightWidth = rightScore / leftScore * 100;
					leftColor = cfg.color;
					rightColor = '#e0e0e0';
				} else if (rightScore > leftScore) {
					rightWidth = 100;
					leftWidth = leftScore / rightScore * 100;
					rightColor = cfg.color;
					leftColor = '#e0e0e0';
				} else {
					// 分数相等时的处理
					leftWidth = 100;
					rightWidth = 100;
					if (this.resData.factorScore && this.resData.factorScore.includes(cfg.right)) {
						rightColor = cfg.color;
						leftColor = '#e0e0e0';
					} else {
						leftColor = cfg.color;
						rightColor = '#e0e0e0';
					}
				}
				return {
					...cfg,
					leftWidth,
					rightWidth,
					leftColor,
					rightColor
				};
			});
		},
		payAmountDisplay(){
			const n = Number(this.payAmount || 0)
			return isNaN(n) ? '0.00' : n.toFixed(2)
		}
	},
	onLoad(options) {
		this.id = options.id;
		this.history = options.history || '';
		if (options.archiveId) {
			this.archiveId = options.archiveId;
		};
	},
	onShow() {
		// 页面显示时触发全局事件，通知档案选择器刷新
		this.getDetail();
		uni.$emit('pageShow');
	},
	// 监听返回按钮事件 (APP和H5平台生效)
	onBackPress(options) {
		// #ifdef APP-PLUS || H5
		// uni.showModal({
		// 	title: '提示',
		// 	content: '确定要返回吗？',
		// 	success: (res) => {
		// 		if (res.confirm) {
		// 			// 用户确认返回，跳转到测试分类页
		// 			uni.navigateBack({
		// 				delta: 2
		// 			})
		// 		} else {
		// 			return false;
		// 		}
		// 	}
		// });
		// return false;
		// #endif
	},
	// 小程序分享
	onShareAppMessage() {
		// #ifdef MP-WEIXIN
		return {
			title: `${this.userInfo.username}邀请你参与测试`,
			path: `/scale/detail/detail?id=${this.scaleId}`,
			imageUrl: this.oh
		};
		// #endif
	},
	methods: {
		// 处理滚动事件
		onScroll(e) {
			// 传递滚动事件给mixin处理
			this.handlePageScroll(e.detail);
		},
		// page-container返回事件处理
		onBeforeLeave(e) {
			this.isShow = false;
			if (this.history == 'true') {
				uni.navigateBack();
				return;
			}
			// 弹窗提示用户
			uni.showModal({
				title: '提示',
				content: '确定要返回吗？',
				success: (res) => {
					if (res.confirm) {
						// 用户确认返回，跳转到测试分类页
						uni.navigateBack({
							delta: 2
						})
					} else {
						this.isShow = true;
					}
				}
			});
		},
		getDetail() {
			this.$H.get(`/userResponse/${this.id}`, {})
				.then(res => {
					if (res.code === 666) {
						this.needPay = true;
						this.payAmount = res.data.amount || 0;
						this.scaleId = res.data.scaleId;
						return;
					}
					this.needPay = false;
					this.resData = res.data;
					this.scaleId = res.data.scaleId;
					let score = JSON.parse(res.data.factorScore);
					this.resultCode = res.data.resultRules.length === 1 ? res.data.resultRules[0].factorName : '';
					this.result = '';

					res.data.resultRules.forEach((element, index) => {
						// 多个结果时添加标题样式
						if (res.data.resultRules.length > 1) {
							this.result +=
								`<div style="font-weight: bold; font-size: large; text-align: left; font-style: normal; background: linear-gradient(243.01512443702103deg, #DEE4FF 0%, #7691FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;">${element.factorName}</div>`;
						}

						// 添加得分信息
						if (score[element.resultCode]) {
							this.result += "得分：" + score[element.resultCode] + '<br/>';
						}

						// 添加结果描述
						if (element.resultDescribe) {
							this.result += element.resultDescribe.replace(/\n+/g, '<br/>');
						}

						// 添加临床建议
						if (element.clinicalSuggestion) {
							this.result += (res.data.resultRules.length > 1 ? '<br/>' : '<br/><br/>') +
								element.clinicalSuggestion.replace(/\n+/g, '<br/>');
						}

						// 多个结果时添加换行分隔
						if (res.data.resultRules.length > 1 && index < res.data.resultRules.length - 1) {
							this.result += '<br/>';
						}
					});
					// 自动加入档案
					if (this.archiveId) {
						console.log('自动加入档案');
						this.autoJoinArchive();
					}
				});
		},
		// 重新测试
		goToRetest() {
			uni.showModal({
				title: '提示',
				content: '确定要重新测试吗？',
				success: (res) => {
					if (res.confirm) {
						// 标记为主动跳转
						this.isNavigatingAway = true;
						// 跳转到对应量表的测试页面
						uni.redirectTo({
							url: `/scale/test/test?id=${this.scaleId}`
						});
					}
				}
			});
		},
		// 跳转
		goTo(item) {
			// 标记为主动跳转
			this.isNavigatingAway = true;
			uni.navigateTo({
				url: item.url
			});
		},
		// 显示档案选择器
		showArchiveSelectorDialog() {
			console.log('显示档案选择器');
			this.showArchiveSelector = true;
		},

		// 档案选择确认
		onArchiveSelected(selectedArchive) {
			console.log('选中的档案:', selectedArchive);

			// 如果没有选择档案，直接返回
			if (!selectedArchive || !selectedArchive.id) {
				console.log('没有选择档案');
				return;
			}

			let params = {
				archiveBagId: selectedArchive.id,
				type: this.scaleId === '23' ? 1 : 2,
				recordId: this.id
			}

			this.$H.post('archiveData', params)
				.then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '加入档案成功',
							icon: 'success'
						});
						this.showArchiveSelector = false;
					} else {
						uni.showToast({
							title: res.msg || '加入档案失败',
							icon: 'error'
						});
					}
				})
				.catch(err => {
					console.error('加入档案失败:', err);
					uni.showToast({
						title: '加入档案失败',
						icon: 'error'
					});
				});
		},

		// 关闭档案选择器
		onArchiveSelectorClose() {
			this.showArchiveSelector = false;
		},

		// 处理新建档案事件
		onNewArchive() {
			console.log('用户点击了新建档案');
		},
		goToPay() {
			const amount = this.payAmount || 0;
			const productType = 1;
			const productId = this.id || '';
			uni.navigateTo({ url: `/main/pay/pay?price=${amount}&productType=${productType}&productId=${productId}` })
		},
		autoJoinArchive() {
			console.log('autoJoinArchive', this.archiveId, this.id, this.scaleId)
			// 只在 scaleId 存在时调用
			if (!this.archiveId || !this.id || !this.scaleId) return;
			// type: 1=MBTI, 2=其他
			let type = this.scaleId === '23' ? 1 : 2;
			let params = {
				archiveBagId: this.archiveId,
				type: type,
				recordId: this.id
			};
			this.$H.post('archiveData', params)
				.then(res => {
					if (res.code == 200) {
						// 弹窗询问用户是否返回档案页
						uni.showModal({
							title: '提示',
							content: '已经自动加入档案，是否返回档案页？',
							success: (modalRes) => {
								if (modalRes.confirm) {
									uni.redirectTo({
										url: `/personal/archive/archive?id=${this.archiveId}`
									});
								}
							}
						});
					} else {
						uni.showToast({
							title: res.msg || '自动加入档案失败',
							icon: 'error'
						});
					}
				})
				.catch(err => {
					console.error('自动加入档案失败:', err);
					uni.showToast({
						title: '自动加入档案失败',
						icon: 'error'
					});
				});
		},
	}
};
</script>
<style lang="scss" scoped>
.pay-required {
	width: 686rpx;
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 32rpx;
	margin: 40rpx auto 0 auto;
	text-align: center;

	.pay-lock {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
	}

	.pay-title {
		font-size: 30rpx;
		color: #1B1B26;
		font-weight: 700;
	}

	.pay-sub {
		margin-top: 10rpx;
		color: #6b7280;
		font-size: 24rpx;
	}

	.pay-amount {
		margin: 16rpx 0;
		font-size: 48rpx;
		font-weight: 800;
		color: #1B1B26;
	}

	.pay-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 16rpx;
		color: #fff;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
	}
}

.scroll-container {
	height: calc(100vh - 88rpx);
}

.innerContainer {
	padding: $gap;
	padding-bottom: 200rpx;
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

.content {
	width: 686rpx;
	background: #FFFFFF;
	border-radius: 30rpx;
	border: 1rpx solid #FFFFFF;
	backdrop-filter: blur(30px);
	margin-top: 52rpx;
	min-height: 300rpx;
}

.top {
	display: flex;
	justify-content: space-between;
	position: relative;
	padding: 32rpx;

	.info {
		width: calc(686rpx - 64rpx - 250rpx);
		height: 100rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-size: 24rpx;
	}

	.nickname {
		width: 140rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.word {
		color: #95959D;
	}

	.oh {
		position: absolute;
		top: -50rpx;
		right: 32rpx;
	}
}

.result {
	padding: $gap;
}

.bottom {
	background-color: #fff;
	width: 750rpx;
	height: 150rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: space-around;
	align-items: center;

	.button {
		width: 328rpx;
		height: 80rpx;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		border-radius: 16rpx;
		text-align: center;
		line-height: 80rpx;
		color: #fff;
		font-weight: bold;
	}

	.button:nth-child(1) {
		width: 220rpx;
		height: 80rpx;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		border-radius: 16rpx;
	}

	.button:nth-child(2) {
		width: 220rpx;
		height: 80rpx;
		background: linear-gradient(270deg, #BEE2D8 0%, #51A28B 100%);
		border-radius: 16rpx;
		display: flex;
		justify-content: center;
		align-items: center;

		image {
			width: 36rpx;
			height: 36rpx;
			margin-right: 10rpx;
		}
	}

	.button:nth-child(3) {
		width: 220rpx;
		height: 80rpx;
		background: linear-gradient(270deg, #FFE4B8 0%, #FF9D51 100%);
		border-radius: 16rpx;
	}
}

.result-code {
	width: 400rpx;
	font-weight: bold;
	font-size: 80rpx;
	text-align: left;
	font-style: normal;
	background: linear-gradient(243.01512443702103deg, #DEE4FF 0%, #7691FF 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
	margin-left: $gap;
	margin-top: -60rpx;
}

.share-button {
	width: 202rpx !important;
	height: 80rpx !important;
	background: linear-gradient(270deg, #BEE2D8 0%, #51A28B 100%) !important;
	border-radius: 16rpx !important;
	display: flex !important;
	justify-content: center !important;
	align-items: center !important;
	margin: 0 !important;
	padding: 0 !important;
	line-height: 1 !important;
	font-weight: normal !important;

	&::after {
		border: none;
	}

	image {
		width: 36rpx;
		height: 36rpx;
		margin-right: 10rpx;
	}
}

.rainbow-chart {
	margin: 0 32rpx;
}

.rainbow-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 18rpx;
}

.rainbow-label {
	width: 90rpx;
	font-size: 28rpx;
	color: #999;
	text-align: center;
}

.rainbow-bar {
	width: 398rpx;
	height: 18px;
	display: flex;
	background: #f0f0f0;
	border-radius: 9px;
	overflow: hidden;
	margin: 0 12rpx;
}

.rainbow-bar-left,
.rainbow-bar-right {
	height: 100%;
	transition: width 0.4s;
}
</style>