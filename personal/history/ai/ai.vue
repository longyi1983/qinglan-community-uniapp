<template>
	<view class="container">
		<my-navbar :title="title[mode]" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="evaluation-list">
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="index">
						<ai-result-item :item="item" :mode="mode" :back="true"></ai-result-item>
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import aiResultItem from '@/personal/components/ai-result-item/ai-result-item.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			aiResultItem
		},
		data() {
			return {
				current: 0,
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				title: {
					"CC":"聊愈记录",
					"OH":"爱卡记录",
					"ED":"探梦记录",
				},
				mode: "",
			};
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(option) {
			this.mode = option.mode || '';
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
				this.getResultList();
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
			getResultList() {
				this.loadStatus = 'loading';
				this.$H.get('userHistory/result', {
					pageNum: this.page,
					pageSize: 10,
					mode: this.mode
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
