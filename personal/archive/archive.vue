<template>
	<view class="container">
		<my-navbar title="我的档案" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 用户信息 -->
			<archive-user-info :item="userInfo" :archiveBagName="archiveBagName" :label="mbti"
				@change="changeArchive"></archive-user-info>
			<!-- 分数 -->
			<view class="score">
				<view class="left">
					<view class="title">
						本周综合分数
					</view>
					<view class="">
						<!-- 使用纯CSS环形进度条替代canvas版本 -->
						<view class="css-circle-progress" :style="{ '--percent': score }">
							<view class="progress-content">
								{{score==0?'?':score}}
							</view>
						</view>
					</view>
					<view class="button" :class="{'disabled': !archiveBagName, blink: allCompleted}" @click="updateScore">
						{{archiveBagName ? '更新分数' : '请先创建档案'}}
					</view>
				</view>
				<view class="right">
					<view class="item" v-for="(value,key) in scoreList" :key="key">
						<view class="">
							{{key}}
						</view>
						<view class="value">
							<u-line-progress active-color="#6986FD" :percent="value" :show-percent="false"
								height="12"></u-line-progress>
						</view>
					</view>
				</view>
			</view>

			<!-- 分析报告 -->
			<view class="analysis-report" v-if="statusAnalysis || improvementSuggestion">
				<view class="analysis-item" v-if="statusAnalysis">
					<view class="analysis-title">现状解读</view>
					<view class="analysis-content">{{statusAnalysis}}</view>
				</view>
				<view class="analysis-item" v-if="improvementSuggestion">
					<view class="analysis-title">改善建议</view>
					<view class="analysis-content">{{improvementSuggestion}}</view>
				</view>
			</view>
		</view>
		<!-- 具体内容 -->
		<view class="detail">
			<u-tabs :list="tabs" font-size="$gap"
				:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
				:current="current" @change="change" bg-color="none"></u-tabs>
		</view>
		<view class="content">
			<view class="title">
				{{tabs[current].name}}
			</view>
			<view class="word" v-if="dataList[tabs[current].key]">
				恭喜你，已完成
			</view>
			<view class="word" v-else>
				<image src="@/personal/static/unlock.png" mode=""></image>
				<view class="">
					{{tabs[current].desc}}
				</view>
				<view class="button" :class="{ blink: blinkUnlockBtnIndex === current }" @click="goLock">
					去解锁
				</view>
			</view>
		</view>
		<u-picker mode="selector" v-model="showPicker" :default-selector="[0]" :range="archiveList"
			range-key="archiveBagName" @confirm="selectArchive"></u-picker>
		<!-- 悬浮问号按钮 -->
		<view class="floating-help" @click="showHelp = true">
			<text class="iconfont">?</text>
		</view>
		<!-- 帮助弹窗 -->
		<u-popup v-model="showHelp" mode="bottom" :mask-close-able="true" :border-radius="24" height="40vh">
			<view class="help-popup-content bottom-popup"
				style="padding: 32rpx 24rpx; border-radius: 24rpx 24rpx 0 0; background: #f8f9fa; overflow: hidden; min-height: 30vh;">
				<view
					style="font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; text-align: center;">
					如何更新分数？
				</view>
				<view style="color: #555; line-height: 2;">
					1. 完成【核心数据】、【疗愈数据】和【MBTI数据】，点击对应模块的<text style='color:#4a90e2; font-weight:bold;'>去解锁</text>按钮<br />
					2. 点击<text style='color:#4a90e2; font-weight:bold;'>更新分数</text> 按钮
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import archiveUserInfo from '@/personal/components/archive-user-info/archive-user-info.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			archiveUserInfo
		},
		data() {
			return {
				id: '',
				archiveBagName: "",
				archiveList: [],
				userInfo: {},
				dataList: {},
				mbti: "",
				score: 0,
				scoreList: {
					"快乐": 0,
					"信任": 0,
					"恐惧": 0,
					"惊讶": 0,
					"悲伤": 0,
					"期待": 0,
					"愤怒": 0,
					"厌恶": 0
				},
				current: 0,
				tabs: [{
						name: "核心数据",
						key: "SCL90",
						url: "/scale/detail/detail?id=24",
						desc: "进行一次SCL-90测试可解锁"
					},
					{
						name: "疗愈数据",
						key: "ohcard",
						url: "/ai/ohCard/ohCard",
						desc: "进行一次爱卡聊天可解锁"
					},
					{
						name: "MBTI数据",
						key: "MBTI",
						url: "/scale/detail/detail?id=23",
						desc: "进行一次MBTI测试可解锁"
					}
				],
				showPicker: false,
				statusAnalysis: '',
				improvementSuggestion: '',
				blinkUnlockBtnIndex: null,
				showHelp: false
			};
		},
		computed: {
			allCompleted() {
				return this.tabs.every(tab => this.dataList[tab.key]) && !this.score;
			}
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(options) {
			this.id = options.id;
			this.userInfo.userInfo = this.$store.state.loginUserInfo;
			this.getArchiveList();
			if (this.id) {
				this.getArchiveDetail();
			}

		},
		onShow() {
			this.getArchiveDetail();
		},
		methods: {

			changeArchive() {
				this.showPicker = true;
			},
			selectArchive(e) {
				console.log(11111111111, e);
				this.id = this.archiveList[e[0]].id;
				this.archiveBagName = this.archiveList[e[0]].archiveBagName;
				// 所有数据清空
				this.dataList = {};
				this.mbti = "";
				this.score = 0;
				this.scoreList = {
					"快乐": 0,
					"信任": 0,
					"恐惧": 0,
					"惊讶": 0,
					"悲伤": 0,
					"期待": 0,
					"愤怒": 0,
					"厌恶": 0
				};
				this.statusAnalysis = '';
				this.improvementSuggestion = '';
				this.current = 0;
				this.getArchiveDetail();
			},
			updateScore() {
				// 检查是否有未完成的tab
				const uncompletedIndex = this.tabs.findIndex(tab => !this.dataList[tab.key]);
				if (uncompletedIndex !== -1) {
					// 有未完成的，提示并切换tab
					uni.showToast({
						title: `请先完成【${this.tabs[uncompletedIndex].name}】`,
						icon: 'none'
					});
					this.current = uncompletedIndex;
					this.blinkUnlockBtnIndex = uncompletedIndex;
					return;
				}

				// 检查是否有档案
				if (!this.archiveBagName || this.archiveBagName.trim() === '') {
					uni.showToast({
						title: '请先创建档案',
						icon: 'none'
					});
					return;
				}

				// 检查是否有档案ID
				if (!this.id) {
					uni.showToast({
						title: '档案信息异常，请重试',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '请求中'
				})
				this.$H.get(`archiveBag/analysis/${this.id}`, {
					id: this.id
				}).then(res => {
					if (res.code == 200) {
						this.getFractionData(res.data);
						uni.hideLoading();
						uni.showToast({
							title: '分数更新成功',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						});
					}
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: "更新失败",
						icon: 'error'
					});
					console.error('更新分数失败:', err);
				})
			},
			getFractionData(data) {
				let fractionData = JSON.parse(data.archiveCompositeScore.fraction);
				fractionData = fractionData.output;
				console.log('分数数据:', fractionData);

				// 更新综合分数
				this.score = fractionData['综合分数'] || 0;

				// 更新各项分数（映射到现有的scoreList键名）
				this.scoreList = {
					"快乐": fractionData['快乐分数'] || 0,
					"信任": fractionData['信任分数'] || 0,
					"恐惧": fractionData['恐惧分数'] || 0,
					"惊讶": fractionData['惊讶分数'] || 0,
					"悲伤": fractionData['悲伤分数'] || 0,
					"期待": fractionData['期待分数'] || 0,
					"愤怒": fractionData['愤怒分数'] || 0,
					"厌恶": fractionData['厌倦分数'] || 0 // 将厌倦映射到厌恶
				};

				// 保存现状解读和改善建议
				this.statusAnalysis = fractionData['现状解读'] || '';
				this.improvementSuggestion = fractionData['改善建议'] || '';
			},
			goLock() {
				this.blinkUnlockBtnIndex = null;
				let tab = this.tabs[this.current];
				let url = tab.url;
				// 动态拼接 archiveId
				if (this.id) {
					if (url.includes('?')) {
						url += `&archiveId=${this.id}`;
					} else {
						url += `?archiveId=${this.id}`;
					}
				}
				uni.navigateTo({
					url
				});
			},
			change(index) {
				this.current = index;
			},
			// 获取档案列表
			getArchiveList() {
				this.$H.get('archiveBag/list', {
					pageNum: 1,
					pageSize: 100
				}).then(res => {
					if (res.code == 200 && res.rows) {
						this.archiveList = res.rows;
						if (this.id && !this.archiveBagName) {
							const currentArchive = this.archiveList.find(item => item.id === this.id);
							if (currentArchive) {
								this.archiveBagName = currentArchive.archiveBagName;
							}
						}
					}
				});
			},
			// 获取档案详情
			getArchiveDetail() {
				if (!this.id) return;

				this.$H.get(`archiveBag/${this.id}`).then(res => {
					if (res.code == 200 && res.data) {
						const data = res.data;
						this.archiveBagName = data.archiveBagName;
						this.mbti = data.mbti || '';
						// 直接覆盖，确保响应式
						this.dataList = {
							...data.dataList
						};
						if (data.archiveCompositeScore && data.archiveCompositeScore.fraction) {
							this.getFractionData(data);
						}
					}
				});
			},
			// 跳转
			goTo(item) {
				uni.navigateTo({
					url: item.url
				});
			},
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

	.score {
		width: 686rpx;
		height: 504rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		padding: $gap;
		box-sizing: border-box;
		margin-top: $gap;
		display: flex;
		justify-content: space-between;
		transform: translateZ(0);
		/* 创建新的堆叠上下文 */
		// align-items: center;

		.left {
			width: 251rpx;
			position: relative;
			z-index: 1;
			transform: translateZ(0);
			/* 创建新的堆叠上下文 */
		}

		/* 纯CSS环形进度条 */
		.css-circle-progress {
			position: relative;
			width: 251rpx;
			height: 251rpx;
			border-radius: 50%;
			background: conic-gradient(#6986FD calc(var(--percent) * 3.6deg),
					#ececec calc(var(--percent) * 3.6deg));
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.css-circle-progress::before {
			content: '';
			position: absolute;
			width: 220rpx;
			height: 220rpx;
			border-radius: 50%;
			background: #ffffff;
		}

		.progress-content {
			position: relative;
			z-index: 2;
			font-size: 120rpx;
			color: #6986FD;
			font-weight: bold;
		}


		.title {
			font-size: 28rpx;
			color: #95959D;
			text-align: center;
			margin-bottom: $gap;
		}

		.u-progress-content {
			font-size: 120rpx;
			color: #6986FD;
		}

		.button {
			width: 227rpx;
			height: 68rpx;
			line-height: 68rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			text-align: center;
			color: white;
			font-size: 28rpx;
			margin: $gap auto;

			&.disabled {
				background: #CCCCCC;
				color: #999999;
				cursor: not-allowed;
			}
		}

		.right {
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.item {
				display: flex;
				gap: 20rpx;
				font-size: 24rpx;
				color: #5B5B6E;

				.value {
					width: 240rpx;
				}
			}
		}
	}

	.analysis-report {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		padding: $gap;
		box-sizing: border-box;
		margin-top: $gap;

		.analysis-item {
			margin-bottom: $gap;

			&:last-child {
				margin-bottom: 0;
			}

			.analysis-title {
				font-size: 28rpx;
				font-weight: 600;
				color: #6986FD;
				margin-bottom: 20rpx;
				position: relative;
				padding-left: 20rpx;

				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 8rpx;
					height: 20rpx;
					background: #6986FD;
					border-radius: 4rpx;
				}
			}

			.analysis-content {
				font-size: 26rpx;
				line-height: 1.6;
				color: #333333;
				padding: 20rpx;
				background: #F8F9FF;
				border-radius: 16rpx;
				border-left: 6rpx solid #6986FD;
			}
		}
	}

	.content {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		padding: $gap;
		box-sizing: border-box;
		margin: $gap auto;

		.title {
			text-align: center;
		}

		.title::before {
			content: '';
			display: inline-block;
			margin-right: 20rpx;
			width: 201rpx;
			height: 6rpx;
			vertical-align: middle;
			border-radius: 30rpx;
			opacity: 0.6;
			background: linear-gradient(90deg, rgba(199, 210, 255, 0), rgba(105, 134, 253, 1));
		}

		.title::after {
			content: '';
			display: inline-block;
			margin-left: 20rpx;
			width: 201rpx;
			height: 6rpx;
			vertical-align: middle;
			border-radius: 30rpx;
			opacity: 0.6;
			background: linear-gradient(90deg, rgba(105, 134, 253, 1), rgba(199, 210, 255, 0));
		}

		.word {
			text-align: center;
		}

		image {
			width: 100rpx;
			height: 100rpx;
			padding: $gap;
		}

		.button {
			width: 300rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #FFFFFF;
			margin: $gap auto;
		}
	}

	.button.blink {
		animation: blinkBtn 1.2s ease-in-out infinite;
	}

	@keyframes blinkBtn {
		0% {
			transform: scale(1);
			box-shadow: 0 0 16rpx 4rpx #6986fdcc;
		}

		50% {
			transform: scale(1.12);
			box-shadow: 0 0 32rpx 12rpx #b9c6fd;
		}

		100% {
			transform: scale(1);
			box-shadow: 0 0 16rpx 4rpx #6986fdcc;
		}
	}

	.floating-help {
		position: fixed;
		bottom: 180rpx;
		right: 40rpx;
		width: 80rpx;
		height: 80rpx;
		background: #7691FF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
		z-index: 1000;
		cursor: pointer;
	}

	.floating-help .iconfont {
		font-size: 48rpx;
		color: #fff;
		font-weight: bold;
	}
</style>