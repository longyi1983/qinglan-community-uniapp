<template>
	<view class="container">
		<my-navbar title="我的活动" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 输入框 -->
			<!-- <view class="header">
				<u-search placeholder="搜索已邀请的人" v-model="keyword" :showAction="false" bgColor="#FFFFFF"></u-search>
			</view> -->
			<view class="topic-list">
				<!-- 话题 -->
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="item.uid">
						<activity-item-personal :item="item"></activity-item-personal>
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import activityItemPersonal from '@/personal/components/activity-item-personal/activity-item-personal.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			activityItemPersonal
		},
		data() {
			return {
				current: 0,
				tabs: [{
					name: '热门帖子',
				}, {
					name: '按互动',
				}, ],
				// 帖子相关
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				hotTopic: [1, 2, 3, 4, 5, 6, 7, 8, 9],
				imgUrl: "",
				balance: 0
			};
		},
		computed: {
			newHot() {
				// 将数组进行分割
				return this.$f.splitArray(this.hotTopic, 4)
			},
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad() {

		},
		onShow() {
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
				if (this.loadStatus == 'nomore') return;
				this.getTopicList();
			},
			handleStatus(res) {
				console.log("res", res)
				if (res.code == 200 && res.rows) {
					this.list = this.list.concat(res.rows);
					if (res.rows.length < 10) {
						this.loadStatus = 'nomore';
					} else {
						this.loadStatus = 'loadmore';
					}
				} else {
					this.loadStatus = 'nomore';
				}
			},
			// 获取帖子
			getTopicList() {
				this.loadStatus = 'loading';
				this.$H.get('userCoin/meActivity', {
						pageNum: this.page,
						pageSize: 10
					})
					.then(res => {
						this.handleStatus(res)
					});
			},
			change(index) {
				this.current = index;
				this.loadStatus = 'loading';
				this.page = 1;
				this.list = [];
				this.getData();
			},
			goTo(item) {
				uni.navigateTo({
					url: item.url
				});
			},
		}
	};
</script>
<style lang="scss" scoped>
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
	
	.topic-list {
		width: 100vw;
		overflow: hidden;
	
		.content {
			padding: $gap;
		}
	}
</style>