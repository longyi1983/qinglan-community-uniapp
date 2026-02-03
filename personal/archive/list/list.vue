<template>
	<view class="container">
		<my-navbar title="我的档案" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="archive-list">
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="index">
						<archive-item :item="item" @delete="deleteArchive"></archive-item>
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
				</view>
			</view>
			<view class="bottom">
				<view class="button" @click="goNewArchive">
					新建档案
				</view>
			</view>
			<!-- 悬浮问号按钮 -->
			<view class="floating-help" @click="showHelp = true">
				<text class="iconfont">?</text>
			</view>
			<!-- 教程弹窗 -->
			<u-popup v-model="showHelp" mode="bottom" :mask-close-able="true" :border-radius="24" height="50vh">
				<view class="help-popup-content bottom-popup"
					style="padding: 32rpx 24rpx; border-radius: 24rpx 24rpx 0 0; background: #f8f9fa; overflow: hidden;padding-bottom: 200rpx;">
					<view
						style="font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; text-align: center;">
						欢迎使用档案管理
					</view>
					<view style="color: #555; line-height: 2;">
						1. 点击 <text style='color:#4a90e2; font-weight:bold;'>新建档案</text> 可添加个人或家人档案。<br />
						2. 点击档案卡片可查看和管理详细信息。<br />
						3. 支持为不同家庭成员建立独立档案，便于分类管理。<br />
						<view style="margin-top: 18rpx; color: #888;">如有疑问，请联系客服获取帮助。</view>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import archiveItem from '@/personal/components/archive-item/archive-item.vue';
	export default {
		components: {
			archiveItem
		},
		mixins: [scrollMixin],
		data() {
			return {
				// 列表相关
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				showHelp: false // 控制教程弹窗显示
			};
		},
		computed: {},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onShow() {
			// 每次页面显示时重置分页和列表，重新获取数据
			this.page = 1;
			this.list = [];
			this.loadStatus = 'loadmore';
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
			deleteArchive(deleteItem) {
				this.list = this.list.filter(item => item.id !== deleteItem.id);
			},
			goNewArchive() {
				uni.navigateTo({
					url: '/personal/archive/edit/edit'
				});
			},
			getData() {
				if (this.loadStatus == 'nomore') return;
				this.getArchiveList();
			},
			handleStatus(res) {
				if (res.code == 200 && res.rows) {
					this.list = this.list.concat(res.rows);
					if (res.rows.length < 10) {
						this.loadStatus = 'nomore';
					}
				} else {
					this.loadStatus = 'nomore';
				}
			},
			// 获取档案列表
			getArchiveList() {
				this.loadStatus = 'loading';
				this.$H.get('archiveBag/list', {
						pageNum: this.page,
						pageSize: 10
					})
					.then(res => {
						this.handleStatus(res)
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

	.archive-list {
		margin-top: $gap;
		width: 686rpx;
		box-sizing: border-box;
		border-radius: 30rpx 30rpx 0 0;
		padding-bottom: 150rpx;

		.content {
			// padding: $gap;
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
		z-index: 999;

		.button {
			width: 686rpx;
			height: 80rpx;
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
			margin: 0 auto;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			font-weight: 600;
			font-size: 32rpx;
			color: #FFFFFF;
			position: relative;
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

	.help-popup-content {
		padding: 40rpx 32rpx;
		font-size: 30rpx;
		color: #333;
		text-align: left;
		max-width: 500rpx;
		line-height: 1.7;
		padding-bottom: 200rpx;
	}

	.help-popup-content.bottom-popup {
		max-width: none;
		width: 100vw;
		box-sizing: border-box;
		border-radius: 32rpx 32rpx 0 0;
		background: #fff;
	}
</style>