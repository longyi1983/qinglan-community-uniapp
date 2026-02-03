<template>
	<view class="container">
		<my-navbar title="栖心港" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 输入框 -->
			<view class="header">
				<u-search placeholder="搜AI视觉疗愈" v-model="keyword" :showAction="false" bgColor="#FFFFFF"></u-search>
			</view>
			<view class="hot-topic">
				<view class="title">
					<image src="/static/index/hot.png" mode=""></image>
					热门话题
				</view>
				<!-- 列表 -->
				<view class="swiper">
					<swiper class="swiper" :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
						:duration="duration" next-margin="200rpx">
						<swiper-item v-for="hots in newHot">
							<view class="hot-topic-list">
								<view class="hot-topic-item" v-for="innerItem in hots" @click="goTopic(innerItem)">
									<image src="/static/images/topic.png" mode=""></image>
									{{innerItem.title}}
								</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
			</view>
			<view class="topic-list">
				<!-- 分类 -->
				<u-sticky>
					<view class="tabs">
						<u-tabs :list="tabs" @click="click" font-size="$gap"
							:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
							:current="current" @change="change"></u-tabs>
					</view>
				</u-sticky>
				<!-- 话题 -->
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="index">
						<topic-item :item="item"></topic-item>
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
					type: "hot"
				}, {
					name: '按互动',
					type: null
				}, ],
				// 帖子相关
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				hotTopic: [],
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
			this.getHotTopic();
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
		methods: {
			getData() {
				if (this.loadStatus == 'nomore') return;
				this.getTopicList();
			},
			handleStatus(res) {
				console.log(111111, res)
				if (res.code == 200 && res.rows) {
					this.list = this.list.concat(res.rows);
					// this.getDetailInfo(res.rows);
					console.log(11111111, this.list)
				} else {
					this.loadStatus = 'nomore';
				}
			},
			getDetailInfo(arr) {
				if (arr.length <= 0) return;
				const postId = arr.map((item) => item.id);
				this.$H.get('post/postIsFollow', {
					postId
				}).then(res => {
					let obj = res.data;
					for (const key in obj) {
						const postId = obj[key].postId;
						const item = this.list.find((item) => item.id === postId);
						if (item) {
							item.isCollection = obj[key].isCollection;
							item.isFollow = obj[key].isFollow;
						}
					}
				})
			},
			// 获取帖子
			getTopicList() {
				this.loadStatus = 'loading';
				this.$H.get('post/getDiscussSquarePostPage', {
						pageNum: this.page,
						pageSize: 10,
						sortType: this.tabs[this.current].type,
					})
					.then(res => {
						this.handleStatus(res)
					});
			},
			// 获取热门话题
			getHotTopic() {
				this.loadStatus = 'loading';
				this.$H.get('discuss/hotDiscussList', {

					})
					.then(res => {
						this.hotTopic = res.result;
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
			goTopic(item) {
				console.log(11111111111, item.id)
				uni.navigateTo({
					url: '/pages/discuss/detail?id=' + item.id
				});
			}
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
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 68rpx;
		padding: $gap;
	}


	.topic-list {
		width: 100vw;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
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