<template>
	<view class="swiper-post-list">
		<view class="content">
			<view class="item" v-for="(item, index) in postList" :key="item.id">
				<topic-item :item="item"></topic-item>
			</view>
			<u-loadmore :status="loadStatus" @loadmore="loadMore"></u-loadmore>
		</view>
	</view>
</template>

<script>
	import topicItem from '@/components/topic-item/topic-item.vue';
	
	export default {
		components: {
			topicItem
		},
		props: {
			tabIndex: {
				type: Number,
				default: 0
			},
			currentIndex: {
				type: Number,
				default: 0
			},
			uid: {
				type: [Number, String],
				default: 0
			},
			currUid: {
				type: [Number, String],
				default: 0
			},
			tabList: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				postList: [],
				loadStatus: "loading",
				page: 1,
				pageSize: 10,
				hasMore: true
			};
		},
		watch: {
			currentIndex: {
				handler(newVal) {
					if (newVal === this.tabIndex) {
						this.reload();
					}
				},
				immediate: true
			}
		},
		methods: {
			reload(callback) {
				this.page = 1;
				this.postList = [];
				this.hasMore = true;
				this.loadStatus = "loading";
				this.getPostList(() => {
					if (callback) callback();
				});
			},
			loadMore() {
				if (!this.hasMore) return;
				this.page++;
				this.getPostList();
			},
			doLoadMore() {
				this.loadMore();
			},
			clear() {
				this.postList = [];
				this.page = 1;
				this.hasMore = true;
			},
			getPostList(callback) {
				if (this.currUid == this.uid) {
					this.getMyPostList(callback);
				} else {
					this.getOtherPostList(callback);
				}
			},
			getMyPostList(callback) {
				let url = 'post/meHomepage';
				this.$H.get(url, {
					pageNum: this.page,
					pageSize: this.pageSize,
					uid: this.uid,
					sortType: this.tabList[this.tabIndex].sortType,
					type: this.tabList[this.tabIndex].sortType,
				}).then(res => {
					if (res.data && res.data.data) {
						this.postList = this.page === 1 ? res.data.data.records : [...this.postList, ...res.data.data.records];
						this.hasMore = res.data.data.records.length >= this.pageSize;
						this.loadStatus = this.hasMore ? "loadmore" : "nomore";
					} else {
						this.loadStatus = "nomore";
					}
					if (callback) callback();
				}).catch(() => {
					this.loadStatus = "loadmore";
					if (callback) callback();
				});
			},
			getOtherPostList(callback) {
				let url = 'post/othersHomepage';
				this.$H.get(url, {
					pageNum: this.page,
					pageSize: this.pageSize,
					uid: this.uid,
					sortType: this.tabList[this.tabIndex].sortType,
					type: this.tabList[this.tabIndex].sortType,
				}).then(res => {
					if (res.data && res.data.data) {
						this.postList = this.page === 1 ? res.data.data.records : [...this.postList, ...res.data.data.records];
						this.hasMore = res.data.data.records.length >= this.pageSize;
						this.loadStatus = this.hasMore ? "loadmore" : "nomore";
					} else {
						this.loadStatus = "nomore";
					}
					if (callback) callback();
				}).catch(() => {
					this.loadStatus = "loadmore";
					if (callback) callback();
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.swiper-post-list {
		.content {
			padding: $gap;
			padding-top: 0;
		}
	}
</style> 