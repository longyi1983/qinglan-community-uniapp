<template>
	<view>
		<view v-if="type&&type==3">
			<article-list :list="postList"></article-list>
		</view>
		<view v-else>
			<post-list :list="postList" :loadStatus="loadStatus"></post-list>
		</view>

		<!-- 返回顶部 -->
		<lf-back-top :show-tag="showTag"></lf-back-top>
	</view>
</template>

<script>
	import postList from '@/components/post-list/post-list.vue';
	import articleList from '@/components/article-list/article-list.vue'
	export default {
		components: {
			postList,
			articleList
		},
		data() {
			return {
				postList: [],
				loadStatus: "loading",
				page: 1,
				type: '',
				showTag: false,
			};
		},
		onLoad(options) {
			if (options.type) {
				this.type = options.type
				this.getPostListByType();
			} else {
				this.getPostList();
			}

		},
		onPageScroll: function onPageScroll(e) {
			if (e.scrollTop > 750) {
				this.showTag = true
			} else {
				this.showTag = false
			}
		},
		onReachBottom() {
			if (this.type == '') {
				this.page++;
				this.getPostList();
			} else {
				this.page++;
				this.getPostListByType();
			}

		},
		methods: {
			getPostListByType() {
				this.loadStatus = "loading";
				this.$H.get('post/getPostListByType', {
					page: this.page,
					type: this.type
				}).then(res => {
					this.postList = this.postList.concat(res.result.data);
					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
						this.loadStatus = "nomore";
					} else {
						this.loadStatus = "loadmore"
					}
				})
			},
			getPostList() {
				this.loadStatus = "loading";
				this.$H.get('post/myPost', {
					page: this.page
				}).then(res => {
					this.postList = this.postList.concat(res.result.data);
					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
						this.loadStatus = "nomore";
					} else {
						this.loadStatus = "loadmore"
					}
				})
			}
		}
	}
</script>

<style>
	page {
		background-color: #F5F5F5;
	}
</style>