<template>
	<view class="container">
		<my-navbar title="搜索" :navBg="navBg"></my-navbar>
		<view class="inner-box">
			<u-search placeholder="搜AI视觉疗愈" v-model="keyword" bgColor="#FFFFFF" @custom="onSearch"
				@search="onSearch"></u-search>

			<view class="empty-box">
				<view class="search-history" v-if="userSearch.length > 0" style="margin-right: auto;">
					<label>搜索记录</label>
					<image @click="deleteSearchByUId" style="width: 35rpx;height: 35rpx;"
						src="../static/images/search-del.png" mode=""></image>
				</view>
				<view class="item-wrap">
					<view v-for="(item, index) in userSearch" :key="item.searchId">
						<view class="item" @click="historyKeyword(item.content)">
							{{ item.content }}
						</view>
					</view>
				</view>
				<view v-if="hotSearch.length > 0" style="margin-right: auto;margin-top: 20rpx;">
					<label>热门搜索</label>
				</view>
				<view class="item-wrap">
					<view class="item" v-for="(item, index) in filteredHotSearch" :key="index">
						<view @click="historyKeyword(item)">{{ item }}</view>
					</view>
				</view>
			</view>
			<!-- 帖榜 -->
			<post-recommend title="搜索发现" desc="热帖排行" :hotPost="hotPost"></post-recommend>
		</view>
	</view>
</template>

<script>
import postRecommend from "@/components/post-recommend/post-recommend.vue";
import scrollMixin from '@/mixins/scrollMixin.js';
export default {
	mixins: [scrollMixin],
	components: {
		postRecommend
	},
	computed: {
		filteredHotSearch() {
			if (!Array.isArray(this.hotSearch)) return []
			return this.hotSearch.filter(item => {
				if (item === null || item === undefined) return false
				const str = String(item).trim()
				return str.length > 0
			})
		}
	},
	data() {
		return {
			keyword: '',
			hotSearch: [],
			userSearch: [],
			hotList: [],
			hotPost: [],
			navBg: 0
		}
	},
	onLoad() {
		this.getUserSearchHistory()
		this.getHotSearchHistory()
		this.getHotPost()
	},
	onPageScroll(e) {
		this.handlePageScroll(e)
		const top = uni.upx2px(100)
		const {
			scrollTop
		} = e
		let percent = scrollTop / top > 1 ? 1 : scrollTop / top
		this.navBg = percent
	},
	methods: {
		getHotPost() {
			this.$H.get('post/hotPost').then(res => {
				if (res.code == 0) {
					this.hotPost = res.hotPost;
					this.hotList = res.hotList;
				}
			});
		},
		onSearch() {
			if (this.keyword && this.keyword.trim()) {
				// 跳转到搜索结果页面
				uni.navigateTo({
					url: `/pages/search-result/search-result?keyword=${encodeURIComponent(this.keyword)}`
				})
			}
		},
		//删除所有历史搜索消息
		deleteSearchByUId() {
			this.$H.post('search/deleteSearchByUId').then(res => {
				if (res.code == 0) {
					this.userSearch = []
				}
			})
		},
		//获取热门搜索列表
		getHotSearchHistory() {
			this.$H.get('search/getHotSearchHistory').then(res => {
				if (res.code == 0) {
					this.hotSearch = res.result
				}
			})
		},
		//获取用户搜索历史列表
		getUserSearchHistory() {
			this.$H.get('search/getUserSearchHistory').then(res => {
				if (res.code == 0) {
					this.userSearch = res.result.reverse()
				}
			})
		},
		//点击内容跳转搜索
		historyKeyword(keyWord) {
			this.keyword = keyWord
			this.onSearch()
		}
	}
}
</script>
<style>
page {
	background-color: #fff !important;
}
</style>
<style lang="scss" scoped>
@import 'search.scss';

.container {
	position: relative;
	width: 100vw;
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

.inner-box {
	padding: 0 $gap;
}

.search-history {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
</style>