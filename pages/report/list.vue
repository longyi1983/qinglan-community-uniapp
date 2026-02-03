<template>
	<view>
		<u-tabs :list="tabsList" :is-scroll="false" active-color="#aaaaff" :current="current" @change="tabChange"></u-tabs>
		<block v-for="(item, index) in reportList" :key="index">
			<view class="report-item">
				<view class="head-wrap">
					<text class="status1" v-if="item.status==0">待审核</text>
					<text class="status2" v-else-if="item.status==1">已处理</text>
					<text class="status3" v-else>已拒绝</text>
				</view>
				<navigator class="report-detail" :url="'/pages/report/detail?id=' + item.id" hover-class="none">
					<image mode="aspectFill" :src="item.media[0]"></image>
					<view class="info-c">
						<view class="report-content u-line-2">{{ item.content.substring(0, 25) }}...</view>
						<view class="specs-list">
							<view class="item">
								<text v-if="item.type==1">帖子</text>
								<text v-else-if="item.type==2">评论</text>
								<text v-else-if="item.type==3">用户</text>
								<text v-else-if="item.type==4">圈子</text>
							</view>
						</view>
					</view>
				</navigator>
				<view class="total-amount">
					<text class="tip">{{item.createTime}}</text>
					<text class="money">单号{{ item.id }}</text>
				</view>
			</view>
		</block>
		<!-- 加载状态 -->
		<block v-if="loadStatus == 'nomore' && reportList.length === 0">
			<view style="margin-top: 30%;"><u-empty text="暂无举报" mode="favor"></u-empty></view>
		</block>
		<block v-else>
			<view style="margin: 30rpx 0;"><u-loadmore bg-color="#f5f5f5" icon-color="#00b264" :status="loadStatus" /></view>
		</block>
		<!-- 固定入口 -->
		<view>
			<view @click="goReportAdd" class="add-report">
				<u-icon name="plus" color="#ffffff" size="50"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			loadStatus: 'loadmore',
			tabsList: [
				{
					name: '全部'
				},
				{
					name: '待审核'
				},
				{
					name: '已处理'
				},
				{
					name: '已拒绝'
				}
			],
			current: 0,
			reportList: [],
			page: 1
		};
	},
	onLoad(options) {
		this.getReportList();
	},
	onReachBottom() {
		this.page++;
		this.getReportList();
	},
	methods: {
		goReportAdd(){
			uni.navigateTo({
				url:"/pages/report/report"
			})
		},
		tabChange(index) {
			this.current = index;
			this.reportList = [];
			this.page = 1;
			this.getReportList();
		},
		getReportList() {
			this.loadStatus = 'loading';

			let status = this.current-1;

			this.$H
				.get('report/list', {
					page: this.page,
					status: status
				})
				.then(res => {
					
					this.reportList = this.reportList.concat(res.result.data);
					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
						this.loadStatus = 'nomore';
					}
				});
		}
	}
};
</script>
<style>
page {
	background-color: #f5f5f5;
}
</style>
<style lang="scss" scoped>
.add-report{
	position: fixed;
	right: 20rpx;
	bottom: 180rpx;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: #333333;
	box-shadow: 0 0 20rpx #999;
	display: flex;
	justify-content: center;
	align-items: center;
}
.report-item {
	display: flex;
	flex-direction: column;
	padding: 20rpx;
	background-color: #fff;
	margin: 20rpx;
	border-radius: 10rpx;
}

.report-item .head-wrap {
	display: flex;
	margin-bottom: 20rpx;
	align-items: center;
}

.report-item .head-wrap .status1 {
	margin-left: auto;
	color: #ffaa00;
	font-size: 28rpx;
}

.report-item .head-wrap .status2 {
	margin-left: auto;
	color: #00aa00;
	font-size: 28rpx;
}

.report-item .head-wrap .status3 {
	margin-left: auto;
	color: #ff0000;
	font-size: 28rpx;
}

.report-item .head-wrap image {
	width: 30rpx;
	height: 30rpx;
}

.report-item .report-detail {
	display: flex;
}

.report-item .report-detail .info-c {
	width: 70%;
}
.report-item .report-detail .info-c .report-content {
	margin-bottom: 20rpx;
}

.report-item .report-detail .info-c .specs-list .item {
	display: flex;
	font-size: 10px;
	margin-bottom: 10rpx;
}

.report-item .report-detail .info-c .specs-list .item > text {
	
	color: #aaaaff;
	font-size: 30rpx;
}

.report-item .report-detail > image {
	margin-right: 20rpx;
	width: 120rpx;
	height: 120rpx;
}

.report-item .total-amount {
	margin: 20rpx;
	text-align: right;
}

.report-item .total-amount .tip{
	margin-right: 20rpx;
	
}
.report-item .total-amount .money {
	color: #ec5151;
	margin-left: 10rpx;
}

.report-item .order-footer {
	display: flex;
	justify-content: flex-end;
	padding-top: 20rpx;
}

.report-item .order-footer .u-btn {
	margin: 0 10rpx 0 0;
}
</style>
