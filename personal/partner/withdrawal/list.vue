<template>
	<view class="container">
		<my-navbar title="提现记录" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view v-if="list.length === 0 && loadStatus !== 'loading'" class="empty">暂无提现记录</view>
			<view v-else>
				<view class="withdraw-item" v-for="item in list" :key="item.id">
					<view class="left-content">
						<view class="amount">
							<u-image src="@/static/my/coin.png" width="44rpx" height="44rpx" style="margin-right: 12rpx;" />
							<text class="amount-value">{{ item.amount }}</text>
						</view>
						<view class="order-id">
							<text class="order-label">申请编号：</text>
							<text class="order-value">{{ item.id }}</text>
						</view>
					</view>
					<view class="info">
						<text class="status" :style="{color: statusColor(item.status)}">{{ statusText(item.status) }}</text>
						<text class="time">{{ item.applyTime }}</text>
					</view>
				</view>
				<u-loadmore :status="loadStatus" @loadmore="loadMore" />
			</view>
		</view>
		<view class="contact-btn-wrapper">
			<view class="contact-btn" @click="contactService">
				联系客服
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
			pageSize: 10
		}
	},
	onLoad() {
		this.getList();
	},
	onPageScroll(e) {
		this.handlePageScroll(e)
	},
	onReachBottom() {
		this.loadMore();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.list = [];
		this.loadStatus = 'loading';
		this.getList(true);
		uni.stopPullDownRefresh();
	},
	methods: {
		getList(isRefresh = false) {
			if (this.loadStatus === 'nomore') return;
			this.loadStatus = 'loading';
			this.$H.get('withdrawalApplication/list', { pageNum: this.page, pageSize: this.pageSize })
				.then(res => {
					if (res.code === 200 && res.rows) {
						if (isRefresh) {
							this.list = res.rows;
						} else {
							this.list = this.list.concat(res.rows);
						}
						if (res.rows.length < this.pageSize) {
							this.loadStatus = 'nomore';
						} else {
							this.loadStatus = 'loadmore';
						}
					} else {
						if (isRefresh) {
							this.list = [];
						}
						this.loadStatus = 'nomore';
					}
				});
		},
		loadMore() {
			if (this.loadStatus !== 'loadmore') return;
			this.page++;
			this.getList();
		},
		statusText(status) {
			switch (status) {
				case 0: return '待审核';
				case 1: return '处理中';
				case 2: return '成功';
				case 3: return '失败';
				default: return '未知';
			}
		},
		statusColor(status) {
			switch (status) {
				case 0: return '#FFA500'; // 待审核
				case 1: return '#6986FD'; // 处理中
				case 2: return '#27C16E'; // 成功
				case 3: return '#FF4D4F'; // 失败
				default: return '#333';
			}
		},
		contactService() {
			this.$f && this.$f.customerService({
				title: '积分兑换',
				path: '/personal/partner/promotion/promotion',
				img: ''
			});
		}
	}
}
</script>

<style scoped>
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
	padding: 32rpx 24rpx;
}
.withdraw-list-container {
	padding: 32rpx 24rpx;
}
.withdraw-item {
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(105,134,253,0.08);
	margin-bottom: 32rpx;
	padding: 32rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.left-content {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}
.amount {
	display: flex;
	align-items: center;
}
.amount-value {
	font-size: 36rpx;
	font-weight: 600;
	color: #6986FD;
}
.order-id {
	display: flex;
	align-items: center;
}
.order-label {
	font-size: 24rpx;
	color: #999;
}
.order-value {
	font-size: 24rpx;
	color: #999;
	font-weight: 500;
}
.info {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}
.status {
	font-size: 28rpx;
	font-weight: 500;
	margin-bottom: 8rpx;
	/* color 由绑定动态设置 */
}
.time {
	font-size: 24rpx;
	color: #999;
}
.empty {
	text-align: center;
	color: #aaa;
	font-size: 30rpx;
	margin-top: 100rpx;
}
.contact-btn-wrapper {
	width: 100%;
	display: flex;
	justify-content: center;
	position: fixed;
	left: 0;
	bottom: 0;
	background: #fff;
	padding: 24rpx 0 32rpx 0;
	z-index: 99;
}
.contact-btn {
	width: 90vw;
	height: 80rpx;
	background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
	border-radius: 16rpx;
	font-weight: 600;
	font-size: 32rpx;
	color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(105,134,253,0.12);
}
</style>
