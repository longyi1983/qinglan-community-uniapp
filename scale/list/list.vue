<template>
	<view class="container">
		<my-navbar :title="title" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- banner -->
			<view class="banner">
				<my-swiper code="scale-swiper"></my-swiper>
			</view>
			<view class="topic-list">
				<!-- 分类 -->
				<u-sticky v-if="false">
					<view class="tabs">
						<u-tabs :list="tabs" @click="click" font-size="$gap"
							:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
							:current="current" @change="change"></u-tabs>
					</view>
				</u-sticky>
				<!-- 话题 -->
				<view class="content">
					<view class="item" v-for="(item,index) in list" :key="index">
						<history-scale-item :item="item"></history-scale-item>
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
					name: '推荐',
					type: 0
				}, {
					name: '社区活动',
					type: 1
				}, {
					name: '线下活动',
					type: 2
				}],
				// 帖子相关
				page: 1,
				loadStatus: 'loadmore',
				list: [],
				bannerList: [
					"https://ceping.qinglan.cn/uniapp/new/index/banner.png"
				],
				title:"",
				id:""
			};
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(option) {
			this.title = option.title;
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
				this.getTopicList();
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
			// 获取帖子
			getTopicList() {
				this.loadStatus = 'loading';
				this.$H.get('scale/list', {
						pageNum: this.page,
						pageSize: 10,
						levelId: this.id
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

	.banner {
		margin-top: $gap;
		padding: $gap;
		height: 392rpx;
	}


	.topic-list {
		margin-top: $gap;
		width: 100vw;
		// background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;
		padding-bottom: 100rpx;

		.content {
			padding: $gap;
		}
	}
</style>