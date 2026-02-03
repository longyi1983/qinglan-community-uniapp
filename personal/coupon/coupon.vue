<template>
	<view class="container">
		<my-navbar title="我的优惠券" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="coupon-list">
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="index">
						<coupon-item :item="item" :owned="true" @refresh="refreshData"></coupon-item>
					</view>
					<u-loadmore :status="loadStatus"></u-loadmore>
				</view>
			</view>
		</view>
		<view class="bottom">
			<view class="button" @click="goSquare">
				优惠券广场
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import couponItem from '@/personal/components/coupon-item/coupon-item.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			couponItem
		},
		data() {
			return {
				current: 0,
				page: 1,
				loadStatus: 'loadmore',
				list: [],
			};
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad() {
			this.getData();
		},
		onReachBottom() {
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
		methods: {
			getData() {
				if (this.loadStatus === 'nomore') return;
				this.getUserCouponList();
			},
			goSquare() {
				uni.navigateTo({ url: '/personal/coupon/square/square' });
			},
			handleStatus(res) {
				if (res.code === 200 && Array.isArray(res.rows)) {
					const mapped = res.rows.map(r => {
						const c = r.coupon || {};
						return {
							id: c.id,
							couponName: c.couponName,
							remainingQuantity: 1, // 展示占位，用户券不再显示库存
							discountType: c.discountType,
							discountPercentage: c.discountPercentage,
							startTime: c.startTime,
							endTime: c.endTime,
							minAmount: c.minAmount,
							reductionAmount: c.reductionAmount,
							isReceived: true, // 已领取状态
							status: r.status // 1可用 2已使用 3已过期 4无效
						};
					});
					this.list = this.list.concat(mapped);
					if (res.rows.length < 10) {
						this.loadStatus = 'nomore';
					} else {
						this.loadStatus = 'loadmore';
					}
				} else {
					this.loadStatus = 'nomore';
				}
			},
			getUserCouponList() {
				this.loadStatus = 'loading';
				this.$H.get('UserCouponRecord/list', {
					pageNum: this.page,
					pageSize: 10
				})
				.then(res => {
					this.handleStatus(res)
				});
			},
			refreshData() {
				this.page = 1;
				this.list = [];
				this.loadStatus = 'loading';
				this.getData();
			}
		}
	};
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

	.coupon-list {
		margin-top: $gap;
		width: 100vw;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;
		padding-bottom: 180rpx;

		.content {
			padding: $gap;
		}
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
	}

	.button {
		width: 686rpx;
		height: 80rpx;
		border-radius: 16rpx;
		text-align: center;
		line-height: 80rpx;
		color: #FFFFFF;
		margin: 0 auto;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		font-weight: 600;
		font-size: 32rpx;
	}
</style>

