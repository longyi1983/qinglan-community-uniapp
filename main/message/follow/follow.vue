<template>
	<view class="container">
		<my-navbar title="新增关注" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="topic-list">
				<!-- 话题 -->
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="item.uid">
						<user-info :item="item" :message="true" @click="setRead(item)"></user-info>
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
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
			this.$refs.uWaterfall.clear();
			this.loadStatus = 'loading';
			this.getData();
			uni.stopPullDownRefresh();
		},
		destroyed() {
			// 一键已读
			this.readStatus();
		},
		methods: {
			setRead(){
				// 点击后标记为已读
				this.item.is_read = 1;
			},
			readStatus() {
				this.$H.get("message/readAllWatchInfo", {}).then(res => {
					// that.getMsgList();
				})
			},
			getData() {
				if (this.loadStatus == 'nomore') return;
				this.getTopicList();
			},
			handleStatus(res) {
				if (res.code == 0 && res.result) {
					this.list = this.list.concat(res.result.data);
					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
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
				this.$H.get("message/list", {
					type: 2,
					page: this.page,
				}).then(res => {
					// this.msgList = res.result;
					this.handleStatus(res)
				})
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

	.header {
		height: 68rpx;
		padding: $gap;
	}


	.topic-list {
		width: 100vw;
		overflow: hidden;

		.content {
			padding: $gap;
		}
	}

	.hot-topic {
		padding: $gap;

		.title {
			display: flex;
			align-items: center;
			font-weight: 600;
			font-size: 36rpx;
			color: #1B1B26;

			image {
				width: 36rpx;
				height: 36rpx;
				margin-right: 16rpx;
			}
		}
	}

	.swiper {
		height: 400rpx;
	}

	.hot-topic-list {
		.hot-topic-item {
			width: 450rpx;
			display: flex;
			align-items: center;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #5B5B6E;
			margin: 50rpx 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			image {
				width: 28rpx;
				height: 28rpx;
				margin-right: 10rpx;
			}
		}
	}
</style>