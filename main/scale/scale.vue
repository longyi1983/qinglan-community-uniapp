<template>
	<view class="container">
		<my-navbar title="栖心港" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- banner -->
			<view class="banner">
				<u-swiper :list="bannerList" :height="360" imgMode="widthFix" bgColor="none"></u-swiper>
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
						<topic-item scale :item="item"></topic-item>
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
				}, {
					name: '按热度',
				}, {
					name: '按最新',
				}, {
					name: '精华',
				}, ],
				// 帖子相关
				page: 1,
				loadStatus: 'loadmore',
				list: [{}, {}, {}],
				bannerList: [
					"https://ceping.qinglanxinqing.com/uniapp/new/index/banner.png"
				],
			};
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
		methods: {
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
				this.$H.get('post/followUserPost', {
						page: this.page
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
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;

		.content {
			padding: $gap;
		}
	}
</style>