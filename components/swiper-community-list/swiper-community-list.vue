<template>
	<view class="content">
		<z-paging ref="paging" v-model="dataList" @query="queryList" use-page-scroll :scrollable="false"
			:hide-empty-view="hideEmptyView" :refresher-enabled="false" @contentHeightChanged="contentHeightChanged"
			:auto="false" :auto-clean-list-when-reload="false">
			<view class="item" v-for="(item,index) in dataList" :key="item.id">
				<topic-item :item="item" @postDeleted="handlePostDeleted"></topic-item>
			</view>
		</z-paging>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dataList: [],
				height: 0,
				hideEmptyView: true,
				completeFunc: null
			}
		},
		props: {
			tabIndex: {
				type: Number,
				default: function() {
					return 0
				}
			},
			currentIndex: {
				type: Number,
				default: function() {
					return 0
				}
			},
			tabItem: {
				type: Object,
				default: function() {
					return {}
				}
			}
		},
		watch: {
			currentIndex: {
				handler(newVal) {
					if (newVal === this.tabIndex) {
						this.$nextTick(() => {
							setTimeout(() => {
								this.$refs.paging.reload();
							}, 100);
						})
					}
				},
				immediate: true
			}
		},
		mounted() {
			console.log('开始监听事件: swiper-community-list组件');
			
			// 监听收藏状态改变事件
			uni.$on('updateCollection', (data) => {
				console.log('swiper-community-list监听到事件: updateCollection', data);
				this.updatePostInList(data.postId, {
					isCollection: data.isCollection,
					collectionCount: data.collectionCount
				});
			});
			
			// 监听评论数改变事件
			uni.$on('updateCommentCount', (data) => {
				console.log('swiper-community-list监听到事件: updateCommentCount', data);
				this.updatePostInList(data.postId, {
					commentCount: data.commentCount
				});
			});
			
			// 监听关注状态改变事件
			uni.$on('updateUserFollow', (data) => {
				console.log('swiper-community-list监听到事件: updateUserFollow', data);
				this.dataList.forEach(item => {
					if (item.uid == Number(data.uid)) {
						item.isFollow = data.isFollow;
						console.log('更新列表项关注状态', item, {uid: data.uid, isFollow: data.isFollow});
					}
				});
			});
			
			// 监听帖子删除事件
			uni.$on('refreshPostList', (data) => {
				console.log('swiper-community-list监听到事件: refreshPostList', data);
				if (data && data.action === 'delete') {
					// 如果是删除操作，从列表中移除该帖子
					this.removePostFromList(data.postId);
				} else {
					// 如果是其他刷新操作，重新加载列表
					this.$refs.paging.reload();
				}
			});
		},
		beforeDestroy() {
			// 移除事件监听，防止内存泄漏
			console.log('移除事件监听: swiper-community-list组件');
			uni.$off('updateCollection');
			uni.$off('updateCommentCount');
			uni.$off('updateUserFollow');
			uni.$off('refreshPostList');
		},
		methods: {
			queryList(pageNo, pageSize) {
				if (!this.tabItem || !this.tabItem.topicId) {
					this.$refs.paging.complete([]);
					this.hideEmptyView = false;
					if (this.completeFunc) {
						this.completeFunc();
					}
					return;
				}

				this.$H.get('post/sectionPost', {
					pageNum: pageNo,
					pageSize: 10,
					topicId: this.tabItem.topicId
				}).then(res => {
					if (res.code == 200 && res.rows) {
						this.$refs.paging.complete(res.rows);
						this.hideEmptyView = false;
					} else {
						this.$refs.paging.complete(false);
					}
					if (this.completeFunc) {
						this.completeFunc();
					}
				}).catch(res => {
					this.$refs.paging.complete(false);
					if (this.completeFunc) {
						this.completeFunc();
					}
				})
			},
			reload(completeFunc) {
				this.completeFunc = completeFunc;
				this.$refs.paging.reload();
			},
			contentHeightChanged(height) {
				const finalHeight = this.dataList.length ? height : 0;
				const minHeight = uni.getSystemInfoSync().windowHeight - uni.upx2px(80);
				this.$emit('heightChanged', Math.max(finalHeight, minHeight));
			},
			doLoadMore() {
				this.$refs.paging.doLoadMore();
			},
			clear() {
				this.$refs.paging.clear();
				this.hideEmptyView = true;
			},
			// 从列表中移除帖子
			removePostFromList(postId) {
				const index = this.dataList.findIndex(item => item.id == Number(postId));
				if (index !== -1) {
					this.dataList.splice(index, 1);
					console.log('帖子已从列表中移除', {id: postId});
					// 更新高度
					this.$nextTick(() => {
						const query = uni.createSelectorQuery().in(this);
						query.select('.content').boundingClientRect(data => {
							if (data) {
								this.contentHeightChanged(data.height);
							}
						}).exec();
					});
				}
			},
			
			// 处理帖子删除事件
			handlePostDeleted(data) {
				console.log('处理帖子删除事件', data);
				this.removePostFromList(data.postId);
			},
			
			// 更新列表中的帖子信息
			updatePostInList(postId, updateData) {
				this.dataList.forEach(item => {
					if (item.id == Number(postId)) {
						Object.keys(updateData).forEach(key => {
							item[key] = updateData[key];
						});
						console.log('列表项已更新', item, {id: postId, ...updateData});
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		height: 100%;
		padding: $gap;
	}

	.item {
		margin-bottom: $gap;
	}
</style>