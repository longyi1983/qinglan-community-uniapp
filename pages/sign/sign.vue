<template>
	<view class="sign">
		<view class="header">
			<view class="header-content">
				<view class="user-info">
					<view class="avatar">
						<image :src="userInfo.avatar || '/static/images/unlogin_avatar.png'" />
					</view>
					<view class="info">
						<view class="username">{{ userInfo.username || '用户' }}</view>
						<view class="balance">
							<u-image src="@/static/my/coin.png" width="44rpx" height="44rpx" style="margin-right: 12rpx;" />
							<text>{{ userInfo.balance || 0 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="content">
			<!-- 签到按钮 -->
			<view class="sign-section">
				<view class="sign-button" :class="{ 'signed': signData.isComplete }" @click="goSign">
					{{ signData.isComplete ? '已签到' : '立即签到' }}
				</view>
				<view class="sign-days">
					已连续签到 <text class="days-num">{{ signData.day || 0 }}</text> 天
				</view>
			</view>

			<!-- 签到规则 -->
			<view class="rules-section">
				<view class="section-title">连续签到规则</view>
				<view class="rules-tip">连续签到可获得奖励，中断后重新从0天开始计算</view>
				<view class="rules-list">
					<view class="rule-item" v-for="(rule, index) in signRules" :key="index">
						<view class="rule-days">{{ rule.daysMin }}-{{ rule.daysMax === 9999 ? '∞' : rule.daysMax }}天</view>
						<view class="rule-reward">
							<u-image src="@/static/my/coin.png" width="32rpx" height="32rpx" style="margin-right: 8rpx;" />
							<text>{{ rule.reward.awardNum }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 签到历史记录 -->
			<view class="history-section">
				<view class="section-title">签到历史</view>
				<view class="history-list">
					<view class="history-item" v-for="(item, index) in signHistory" :key="index">
						<view class="history-info">
							<view class="history-date">{{ item.date }}</view>
							<view class="history-time">{{ formatTime(item.createdTime) }}</view>
						</view>
						<view class="history-reward">
							<u-image src="@/static/my/coin.png" width="32rpx" height="32rpx" style="margin-right: 8rpx;" />
							<text>+{{ item.balanceNum }}</text>
						</view>
					</view>
				</view>
				<view class="load-more" v-if="hasMore" @click="loadMore">
					加载更多
				</view>
			</view>
		</view>

		<!-- 签到成功弹窗 -->
		<view class="sign-success" v-if="showSuccess" @click="closeSuccess">
			<view class="success-content">
				<view class="success-title">签到成功</view>
				<view class="success-reward">
					<u-image src="@/static/my/coin.png" width="60rpx" height="60rpx" style="margin-right: 16rpx;" />
					<text>+{{ successReward }}</text>
				</view>
				<view class="success-btn" @click="closeSuccess">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: "sign",
	data() {
		return {
			userInfo: {},
			signData: {
				day: 0,
				isComplete: false
			},
			signRules: [],
			signHistory: [],
			pageNum: 1,
			pageSize: 10,
			hasMore: true,
			showSuccess: false,
			successReward: 0
		};
	},
	mounted() {
		uni.showLoading({ title: "加载中", mask: true });
		this.getUserInfo();
		this.getSignData();
		this.getSignHistory();
	},
	methods: {
		// 获取用户信息（包括余额）
		getUserInfo() {
			// 获取基本用户信息
			this.$H.get('user/userInfo').then(res => {
				if (res.result) {
					this.userInfo = {
						...this.userInfo,
						...res.result
					};
				}
			}).catch(err => {
				console.log('获取用户基本信息失败', err);
			});

			// 获取用户余额
			this.$H.get('userCoin/mePartner', {
				pageNum: 1,
				pageSize: 10
			}).then(res => {
				if (res.code === 200 && res.data) {
					this.userInfo = {
						...this.userInfo,
						balance: res.data.balance || 0
					};
				}
			}).catch(err => {
				console.log('获取用户余额失败', err);
			});
		},

		// 获取签到数据
		getSignData() {
			this.$H.get('userTask/signInData', {
				pageSize: this.pageSize,
				pageNum: this.pageNum
			}).then(res => {
				uni.hideLoading();
				if (res.code === 200) {
					this.signData = {
						day: res.data.day,
						isComplete: res.data.isComplete
					};
					this.signRules = res.data.task.taskRewardJoins || [];
				}
			}).catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: '获取数据失败',
					icon: 'none'
				});
			});
		},

		// 获取签到历史
		getSignHistory() {
			this.$H.get('userTask/signInData', {
				pageSize: this.pageSize,
				pageNum: this.pageNum
			}).then(res => {
				if (res.code === 200) {
					const records = res.data.page.records || [];
					if (this.pageNum === 1) {
						this.signHistory = records;
					} else {
						this.signHistory = [...this.signHistory, ...records];
					}
					this.hasMore = res.data.page.current < res.data.page.pages;
				}
			});
		},

		// 签到
		goSign() {
			if (this.signData.isComplete) {
				uni.showToast({
					title: '今日已签到',
					icon: 'none'
				});
				return;
			}

			this.$H.get('userTask/signIn', {}).then(res => {
				if (res.code === 200) {
					this.successReward = res.data || 5; // 默认奖励5个青蓝币
					this.showSuccess = true;
					this.signData.isComplete = true;
					this.signData.day = parseInt(this.signData.day) + 1;
					this.getSignHistory(); // 刷新历史记录
					this.getUserInfo(); // 更新用户余额
				} else {
					uni.showToast({
						title: res.msg || '签到失败',
						icon: 'none'
					});
				}
			}).catch(err => {
				uni.showToast({
					title: '签到失败',
					icon: 'none'
				});
			});
		},

		// 加载更多
		loadMore() {
			if (!this.hasMore) return;
			this.pageNum++;
			this.getSignHistory();
		},

		// 关闭成功弹窗
		closeSuccess() {
			this.showSuccess = false;
		},

		// 格式化时间
		formatTime(timeStr) {
			if (!timeStr) return '';
			const date = new Date(timeStr);
			return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
		}
	}
};
</script>

<style scoped lang="less">
.sign {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx;
	color: white;
}

.header-content {
	display: flex;
	align-items: center;
}

.user-info {
	display: flex;
	align-items: center;
	flex: 1;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 20rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar image {
	width: 100%;
	height: 100%;
}

.info {
	flex: 1;
}

.username {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.balance {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	opacity: 0.9;
}

.content {
	padding: 30rpx;
}

.sign-section {
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	text-align: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.sign-button {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 24rpx 60rpx;
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: inline-block;
	transition: all 0.3s ease;
}

.sign-button.signed {
	background: #cccccc;
}

.sign-days {
	font-size: 28rpx;
	color: #666;
}

.days-num {
	color: #667eea;
	font-weight: bold;
	font-size: 36rpx;
}

.rules-section, .history-section {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.rules-list {
	display: flex;
	justify-content: space-between;
}

.rule-item {
	text-align: center;
	flex: 1;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	margin: 0 10rpx;
}

.rule-item:first-child {
	margin-left: 0;
}

.rule-item:last-child {
	margin-right: 0;
}

.rule-days {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.rule-reward {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #667eea;
	font-weight: bold;
}

.rules-tip {
	font-size: 26rpx;
	color: #ff6b6b;
	margin-bottom: 20rpx;
	text-align: left;
	background: #fff5f5;
	padding: 16rpx;
	border-radius: 8rpx;
	border-left: 4rpx solid #ff6b6b;
}

.history-list {
	max-height: 600rpx;
	overflow-y: auto;
}

.history-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.history-item:last-child {
	border-bottom: none;
}

.history-info {
	flex: 1;
}

.history-date {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 4rpx;
}

.history-time {
	font-size: 24rpx;
	color: #999;
}

.history-reward {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: #667eea;
	font-weight: bold;
}

.load-more {
	text-align: center;
	padding: 20rpx;
	color: #667eea;
	font-size: 28rpx;
}

.sign-success {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.success-content {
	background: white;
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	text-align: center;
	width: 80%;
	max-width: 500rpx;
}

.success-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
}

.success-reward {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	color: #667eea;
	font-weight: bold;
	margin-bottom: 40rpx;
}

.success-btn {
	background: #667eea;
	color: white;
	padding: 20rpx 60rpx;
	border-radius: 50rpx;
	font-size: 28rpx;
	display: inline-block;
}
</style>
