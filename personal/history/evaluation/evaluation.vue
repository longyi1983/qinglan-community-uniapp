<template>
	<view class="container">
		<my-navbar :title="title" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="evaluation-list">
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="index">
						<history-evaluation-item :item="item"></history-evaluation-item>
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import historyEvaluationItem from '@/personal/components/history-evaluation-item/history-evaluation-item.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			historyEvaluationItem
		},
		data() {
			return {
				current: 0,
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				title: "心理评估历史",
				id: ""
			};
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(option) {
			this.id = option.id;
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
				this.getEvaluationList();
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
			getEvaluationList() {
				this.loadStatus = 'loading';
				this.$H.get('psychologicalAssessment/list', {
					pageNum: this.page,
					pageSize: 10,
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

	.evaluation-list {
		margin-top: $gap;
		width: 100vw;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;
		padding-bottom: 100rpx;

		.content {
			padding: $gap;
		}
	}
</style>
