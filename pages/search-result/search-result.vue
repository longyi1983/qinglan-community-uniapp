<template>
	<view class="container">
		<my-navbar title="搜索结果" :navBg="navBg"></my-navbar>
		<view class="inner-box">
			<u-search placeholder="搜AI视觉疗愈" v-model="keyword" bgColor="#FFFFFF" @custom="onChange"
				@search="onChange"></u-search>
			<!-- tabs -->
			<!-- <view class="tabs-box">
				<u-tabs :list="tabList" :is-scroll="false" :current="current" @change="tabChange" bg-color="none"></u-tabs>
			</view> -->
			<view v-show="current === 0">
				<view style="margin-top: 100rpx;">
					<u-empty v-if="loadStatus !== 'loading' && postList.length === 0" text="暂无相关帖子" mode="search"></u-empty>
				</view>
				<view class="item" v-for="(item,index) in postList" :key="item.id">
					<topic-item :item="item"></topic-item>
				</view>
			</view>
			<view v-show="current === 1">
				<view style="margin-top: 100rpx;">
					<u-empty v-if="loadStatus !== 'loading' && userList.length === 0" text="暂无相关用户" mode="search"></u-empty>
				</view>
				<user-list :list="userList" :loadStatus="loadStatus"></user-list>
			</view>
			<view v-show="current === 2">
				<view style="margin-top: 100rpx;">
					<u-empty v-if="loadStatus !== 'loading' && topicList.length === 0" text="暂无相关圈子" mode="search"></u-empty>
				</view>
				<topic-list :list="topicList" :loadStatus="loadStatus" loadmoreBgColor="#fff"></topic-list>
			</view>
		</view>
	</view>
</template>

<script>
	import postList from '@/components/post-list/post-list.vue'
	import topicList from '@/components/topic-list/topic-list.vue'
	import userList from '@/components/user-list/user-list.vue'
	import topicItem from '@/components/topic-item/topic-item.vue'
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		components: {
			postList,
			topicList,
			userList,
			topicItem
		},
		data() {
			return {
				keyword: '',
				tabList: [{
						name: '动态'
					},
					{
						name: '用户'
					},
					{
						name: '圈子'
					}
				],
				current: 0,
				postList: [],
				userList: [],
				topicList: [],
				pagePost: 1,
				pageUser: 1,
				topicPage: 1,
				loadStatus: 'loadmore',
				navBg: 0
			}
		},
		onLoad(options) {
			// 接收从搜索页面传递的关键词
			if (options.keyword) {
				this.keyword = decodeURIComponent(options.keyword)
				this.onChange()
			}
		},
		onReachBottom() {
			let type = this.current
			if (type === 0) {
				this.pagePost++
				this.getPostList()
			}

			if (type === 1) {
				this.pageUser++
				this.getUserList()
			}

			if (type === 2) {
				this.topicPage++
				this.getTopicList()
			}
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
			onChange() {
				if (this.keyword) {
					let type = this.current

					this.pagePost = 1
					this.pageUser = 1
					this.topicPage = 1

					if (type === 0) {
						this.postList = []
						this.getPostList()
					}

					if (type === 1) {
						this.userList = []
						this.getUserList()
					}

					if (type === 2) {
						this.topicList = []
						this.getTopicList()
					}
				}
			},
			getUserList() {
				this.loadStatus = 'loading'
				this.$H
					.get('user/search', {
						keyword: this.keyword,
						page: this.pageUser
					})
					.then(res => {
						if (res.code == 0) {
							this.userList = this.userList.concat(res.result.data)
							if (
								res.result.current_page >= res.result.total ||
								res.result.last_page === 0
							) {
								this.loadStatus = 'nomore'
							} else {
								this.loadStatus = 'loadmore'
							}
						}

					})
			},
			getTopicList() {
				this.loadStatus = 'loading'
				this.$H
					.get('topic/search', {
						keyword: this.keyword,
						page: this.topicPage
					})
					.then(res => {
						if (res.code == 0) {
							this.topicList = this.topicList.concat(res.result.data)
							if (
								res.result.current_page >= res.result.total ||
								res.result.last_page === 0
							) {
								this.loadStatus = 'nomore'
							} else {
								this.loadStatus = 'loadmore'
							}
						}

					})
			},
			getPostList() {
				this.loadStatus = 'loading'
				this.$H
					.get('post/searchV2', {
						keyword: this.keyword,
						page: this.pagePost
					})
					.then(res => {
						if (res.code == 200) {
							this.postList = this.postList.concat(res.rows)
							if (res.rows.length < 10) {
								this.loadStatus = 'nomore'
							} else {
								this.loadStatus = 'loadmore'
							}
						}
					})
			},
			tabChange(index) {
				this.current = index

				if (index === 0) {
					this.postList = []
					this.getPostList()
				}

				if (index === 1) {
					this.userList = []
					this.getUserList()
				}

				if (index === 2) {
					this.topicList = []
					this.getTopicList()
				}
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
	.search-history{
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>