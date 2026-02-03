<template>
	<view class="container">
		<my-navbar title="青蓝币历史记录" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="record-list">
				<view class="record-item" v-for="(item, index) in list" :key="item.id">
					<image src="/static/my/coin.png" class="coin-icon" mode="aspectFit" />
					<view class="record-info">
						<view class="record-title">{{ reasonTypeLabel(item.reasonType) }}{{ item.changeExplain ? ' - ' + item.changeExplain : '' }}</view>
						<view class="record-date">{{ item.createdTime }}</view>
					</view>
					<view class="record-amount" :class="{ negative: String(item.amount).startsWith('-') }">{{ formatAmount(item.amount) }}</view>
				</view>
				<u-loadmore :status="loadStatus" />
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
			list: [],
			page: 1,
			loadStatus: 'loadmore',
			total: 0,
			pageSize: 10
		}
	},
	onLoad() {
		this.getData();
	},
	onReachBottom() {
		if (this.loadStatus === 'nomore') return;
		this.page++;
		this.getData();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.list = [];
		this.loadStatus = 'loading';
		this.getData();
		uni.stopPullDownRefresh();
	},
	onPageScroll(e) {
		this.handlePageScroll(e)
	},
	methods: {
		getData() {
			if (this.loadStatus === 'nomore') return;
			this.loadStatus = 'loading';
			this.$H.get('coinLog/list', {
				pageNum: this.page,
				pageSize: this.pageSize
			}).then(res => {
				if (res && res.code === 200) {
					const records = res.rows || [];
					if (this.page === 1) {
						this.list = records;
					} else {
						this.list = this.list.concat(records);
					}
					this.total = res.total || 0;
					if (records.length < this.pageSize) {
						this.loadStatus = 'nomore';
					} else {
						this.loadStatus = 'loadmore';
					}
				} else {
					this.loadStatus = 'nomore';
				}
			});
		},
		reasonTypeLabel(type) {
			const map = {
				0: '提现',
				1: '任务奖励',
				2: '充值奖励',
				3: '消费',
				4: '提现退回'
			};
			return map[type] || `类型 ${type}`;
		},
		formatAmount(amount) {
			const str = String(amount || '0');
			if (str.startsWith('-')) return str; // already negative with '-'
			return `+${str}`;
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	position: relative;
	min-height: 100vh;
	background-color: #F6F6FF;
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

.innerContainer {
	padding: 32rpx;
}

.record-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.record-item {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 8rpx 0 rgba(105, 134, 253, 0.04);
}

.coin-icon {
	width: 56rpx;
	height: 56rpx;
	margin-right: 20rpx;
}

.record-info {
	flex: 1;
}

.record-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
}

.record-date {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.record-amount {
	font-size: 32rpx;
	color: #FFB800;
	font-weight: bold;
	margin-left: 16rpx;
}

.record-amount.negative {
	color: #FA5151;
}
</style>
