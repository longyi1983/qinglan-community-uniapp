<template>
	<view class="container">
		<my-navbar title="青蓝币说明" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 顶部余额卡片 -->
			<view class="coin-balance-card">
				<image src="/static/my/coin.png" class="coin-icon" mode="aspectFit" />
				<text class="coin-balance-label">青蓝币余额</text>
				<text class="coin-balance-value">{{ qlBalance }}</text>
				<u-icon name="question-circle" size="36" color="#999" @click="showExplain=true" class="coin-help" />
			</view>
			<!-- 弹窗说明 -->
			<u-popup v-model="showExplain" mode="center" border-radius="16">
				<view class="popup-content">
					<view class="popup-title">青蓝币说明</view>
					<view class="popup-text">青蓝币可用于兑换奖励、参与活动、提现等，具体用途请关注平台公告。</view>
					<u-button type="primary" @click="showExplain=false">我知道了</u-button>
				</view>
			</u-popup>
			<!-- 获取方式列表标题和历史记录入口 -->
			<view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;">
				<text class="get-list-title">如何获取青蓝币</text>
				<text class="history-link" @click="goToHistory">历史记录 &gt;</text>
			</view>
			<!-- 获取方式列表 -->
			<view class="get-list">
				<view class="get-item" v-for="item in getList" :key="item.id">
					<image :src="item.imgUrl || '/static/my/coin.png'" class="get-item-icon" />
					<view class="get-item-info">
						<view class="get-item-title">{{ item.title }}</view>
						<view class="get-item-desc">{{ item.desc }}</view>
						<view class="get-item-progress" v-if="item.completeNum >= 1">
							<text class="progress-text">
              					进度：{{ item.completeNumUser > item.completeNum ? item.completeNum : item.completeNumUser }}/{{ item.completeNum }}
							</text>
						</view>
					</view>
					<view class="button get-item-btn" :class="{ 'completed': item.isComplete }"
						@click="goTo(item.route || '/pages/index/index')">
						{{ item.isComplete ? '已完成' : item.btn }}
					</view>
				</view>
			</view>
			<!-- 底部按钮 -->
			<view class="bottom">
				<view class="button" @click="goExchange">
					去兑换
				</view>
				<view class="button" @click="goWithdrawRecord">
					提现记录
				</view>
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
				qlBalance: 0,
				showExplain: false,
				getList: []
			}
		},
		onShow() {
			this.getQlBalance();
			this.getTaskList();
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		methods: {
			getQlBalance() {
				this.$H.get('userCoin/mePartner', {
					pageNum: 1,
					pageSize: 10
				}).then(res => {
					if (res.code == 200 && res.data && typeof res.data.balance !== 'undefined') {
						this.qlBalance = res.data.balance;
					}
				});
			},
			getTaskList() {
				this.$H.get('userTask/currentTask').then(res => {
					if (res.code == 200 && res.data && res.data.task) {
						const {
							dayTask,
							weekTask,
							yearTask
						} = res.data.task;
						// 合并所有任务并转换为页面需要的格式
						const allTasks = [...(dayTask || []), ...(weekTask || []), ...(yearTask || [])];
						this.getList = allTasks.map(task => {
							return {
								id: task.id,
								icon: task.imgUrl || '/static/my/coin.png',
								title: task.taskName,
								desc: task.taskDescribe,
								btn: task.isComplete ? '已完成' : '去完成',
								route: task.route || '/pages/index/index',
								completeNum: task.completeNum,
								completeNumUser: task.completeNumUser,
								isComplete: task.isComplete,
								taskCode: task.taskCode
							};
						});
					} else {
						// 处理没有任务数据的情况
						this.getList = [];
					}
				}).catch(err => {
					// 处理请求失败的情况
					console.error('获取任务列表失败:', err);
					this.getList = [];
				});
			},
			goTo(url) {
				uni.navigateTo({
					url: url,
					fail: () => {
						uni.switchTab({
							url: url
						});
					}
				});
			},
			goToHistory() {
				uni.navigateTo({
					url: '/personal/history/money/money'
				});
			},
			goExchange() {
				uni.navigateTo({
					url: '/personal/partner/withdrawal/withdrawal'
				});
			},
			goWithdrawRecord() {
				uni.navigateTo({
					url: '/personal/partner/withdrawal/list'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #F6F6FF;
		z-index: 1;
		padding: 0;
		margin: 0;
		position: relative;
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
	.innerContainer {
		padding: 32rpx 32rpx 0 32rpx;
	}

	.coin-desc-container {
		min-height: 100vh;
		background: #f7f8fa;
		padding: 32rpx 32rpx 0 32rpx;
	}

	.coin-balance-card {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx 0 rgba(105, 134, 253, 0.08);
		padding: 32rpx;
		margin: 0;
		margin-bottom: 40rpx;
		position: relative;
	}

	.coin-icon {
		width: 64rpx;
		height: 64rpx;
		margin-right: 20rpx;
	}

	.coin-balance-label {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
		margin-right: 16rpx;
	}

	.coin-balance-value {
		font-size: 36rpx;
		color: #FFB800;
		font-weight: bold;
		margin-right: 16rpx;
	}

	.coin-help {
		margin-left: 8rpx;
	}

	.get-list-title {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		line-height: 1;
	}

	.get-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-bottom: 150rpx;
	}

	.get-item {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 8rpx 0 rgba(105, 134, 253, 0.04);
	}

	.get-item-icon {
		width: 56rpx;
		height: 56rpx;
		margin-right: 20rpx;
	}

	.get-item-info {
		flex: 1;
	}

	.get-item-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
	}

	.get-item-desc {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.get-item-progress {
		margin-top: 8rpx;
	}

	.progress-text {
		font-size: 22rpx;
		color: #666;
	}

	.popup-content {
		padding: 40rpx 32rpx 32rpx 32rpx;
		text-align: center;
	}

	.popup-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 24rpx;
	}

	.popup-text {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 32rpx;
	}

	.button {
		width: 140rpx;
		height: 56rpx;
		border-radius: 16rpx;
		text-align: center;
		line-height: 56rpx;
		font-weight: 600;
		font-size: 28rpx;
		color: #fff;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		margin-left: 16rpx;
		box-shadow: 0 2rpx 8rpx 0 rgba(105, 134, 253, 0.04);
	}

	.get-item-btn {
		flex-shrink: 0;
	}

	.get-item-btn.completed {
		background: #ccc;
		color: #fff;
	}

	.history-link {
		color: #4e7fff;
		font-size: 26rpx;
		padding: 0 8rpx;
		line-height: 1;
		cursor: pointer;
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
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
			margin: 0 auto;
		}

		.button:nth-child(1) {
			width: 328rpx;
			height: 80rpx;
			background: #F6F6FF;
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #6986FD;
		}

		.button:nth-child(2) {
			width: 328rpx;
			height: 80rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #FFFFFF;
		}
	}
</style>