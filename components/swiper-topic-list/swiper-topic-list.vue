<template>
	<view class="content">
		<z-paging ref="paging" v-model="dataList" @query="queryList" use-page-scroll :scrollable="false"
			:hide-empty-view="hideEmptyView" :refresher-enabled="false" @contentHeightChanged="contentHeightChanged"
			:auto="false" :auto-clean-list-when-reload="false">
			<!-- <template v-if="tabIndex === 0 && !dataList.length && !hasLogin">
				<view class="login-tip">
					<view class="tip-text">登录后查看您关注用户的动态</view>
					<view class="login-btn" @click="goLogin">去登录</view>
				</view>
			</template> -->
			<template>
				<view class="waterfall-container">
					<view class="waterfall-column">
						<view class="demo-warter" v-for="(item, index) in leftList" :key="item.id">
							<topic-item-waterfall :item="item"></topic-item-waterfall>
						</view>
					</view>
					<view class="waterfall-column">
						<hot-list :list="hotList"></hot-list>
						<view class="demo-warter" v-for="(item, index) in rightList" :key="item.id">
							<topic-item-waterfall :item="item"></topic-item-waterfall>
						</view>
					</view>
				</view>
			</template>
		</z-paging>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	
	export default {
		data() {
			return {
				dataList: [],
				height: 0,
				hideEmptyView: true,
				completeFunc: null,
				page: 1,
				hotList: [],
				leftList: [],
				rightList: []
			}
		},
		computed: {
			hasLogin() {
				return this.$store.state.hasLogin || false
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
			}
		},
		watch: {
			hasLogin: {
				handler(newVal, oldVal) {
					if (!oldVal && newVal) {
						// 从false变为true时，重新加载数据
						this.$nextTick(() => {
							this.$refs.paging.reload();
						});
					}
				},
				immediate: true
			},
			currentIndex: {
				handler(newVal) {
					if (newVal === this.tabIndex) {
						this.$nextTick(() => {
							setTimeout(() => {
								this.$refs.paging.reload();
								// this.getHotList();
							}, 100);
						})
					}
				},
				immediate: true
			},
			dataList: {
				handler(newVal) {
					// 将数据列表分成左右两列
					this.leftList = [];
					this.rightList = [];
					newVal.forEach((item, index) => {
						if (index % 2 === 0) {
							this.leftList.push(item);
						} else {
							this.rightList.push(item);
						}
					});
				},
				immediate: true
			},
			
		},
		mounted() {
			console.log('开始监听事件: swiper-topic-list组件');
			
			// 监听收藏状态改变事件
			uni.$on('updateCollection', (data) => {
				console.log('swiper-topic-list监听到事件: updateCollection', data);
				this.updatePostInList(data.postId, {
					isCollection: data.isCollection,
					collectionCount: data.collectionCount
				});
			});
			
		},
		beforeDestroy() {
			// 移除事件监听，防止内存泄漏
			console.log('移除事件监听: swiper-topic-list组件');
			uni.$off('updateCollection');
		},
		methods: {
			updateDataList() {
				this.dataList[0].isFollow = false;
				this.dataList[0].commentCount = 100;
				this.dataList[0].collectionCount = 100;
				console.log('更新列表项', this.dataList[0]);
				this.$refs.uWaterfall.remove(99999999999999);
				// 强制数组更新
				this.dataList = [...this.dataList];
				this.dataList.splice(0, 0, this.dataList[0]);
			},
			queryList(pageNo, pageSize) {
				this.page = pageNo;

				// 如果是关注标签，且未登录，直接返回空数据
				// if (this.tabIndex === 0 && !this.hasLogin) {
				// 	this.$refs.paging.complete([]);
				// 	this.hideEmptyView = false;
				// 	if (this.completeFunc) {
				// 		this.completeFunc();
				// 	}
				// 	return;
				// }

				// 根据不同的标签页请求不同的数据
				if (this.tabIndex === 0) {
					this.getFollowUserPost(pageNo);
				} else {
					this.getRecommendPost(pageNo, pageSize);
				}
			},
			// 获取推荐帖子
			getRecommendPost(pageNo, pageSize) {
				this.$H.get('postrecommend/pagelist', {
					pageNum: pageNo,
					pageSize: pageSize
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
			// 获取关注用户帖子
			getFollowUserPost(pageNo) {
				this.$H.get('post/followUserPost', {
					page: pageNo
				}).then(res => {
					if (res.code == 0 && res.result) {
						this.$refs.paging.complete(res.result.data);
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
				const finalHeight = this.dataList.length ? height : 300;
				const minHeight = uni.getSystemInfoSync().windowHeight - uni.upx2px(80);
				this.$emit('heightChanged', Math.max(finalHeight, minHeight));
			},
			doLoadMore() {
				this.$refs.paging.doLoadMore();
			},
			clear() {
				this.leftList = [];
				this.rightList = [];
				this.$refs.paging.clear();
				this.hideEmptyView = true;
			},
			goLogin() {
				this.$f.login();
			},
			// 更新列表中的帖子信息
			updatePostInList(postId, updateData) {
				this.dataList.forEach(item => {
					if (item.id == Number(postId)) {
						Object.keys(updateData).forEach(key => {
							item[key] = updateData[key];
						});
						console.log('列表项已更新',item, {id: postId, ...updateData});
					}
				});
				
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		height: 100%;
	}

	.waterfall-container {
		width: calc(750rpx - 32rpx - 32rpx);
		display: flex;
		justify-content: space-between;
		// padding: 0 20rpx;
	}

	.waterfall-column {
		flex: 1;
		display: flex;
		flex-direction: column;
		// margin: 0 10rpx;
	}

	.demo-warter {
		width: 100%;
		height: 564rpx;
		border-radius: 8px;
		margin: 10rpx 0;
		position: relative;
	}

	.login-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 50rpx 0;

		.tip-text {
			font-size: 28rpx;
			color: #8A8A99;
			margin-bottom: 20rpx;
		}

		.login-btn {
			padding: 10rpx 30rpx;
			background: linear-gradient(226deg, #B9FFED 0%, #6986FD 100%);
			color: #fff;
			border-radius: 30rpx;
			font-size: 28rpx;
		}
	}

	.hot-list-container {
		margin-bottom: 20rpx;
	}
</style>