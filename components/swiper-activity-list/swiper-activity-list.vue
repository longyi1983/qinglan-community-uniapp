<template>
	<view class="content">
		<z-paging ref="paging" v-model="dataList" @query="queryList" use-page-scroll :scrollable="false" :hide-empty-view="hideEmptyView"
			:refresher-enabled="false" @contentHeightChanged="contentHeightChanged" :auto="false" :auto-clean-list-when-reload="false">
			<view class="item" v-for="(item,index) in dataList" :key="index">
				<activity-item :item="item"></activity-item>
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
				default: function(){
					return 0
				}
			},
			currentIndex: {
				type: Number,
				default: function(){
					return 0
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
		methods: {
			queryList(pageNo, pageSize) {
				this.$H.get('activity/list', {
					page: pageNo,
					type: this.tabIndex
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
			contentHeightChanged(height){
				const finalHeight = this.dataList.length ? height : 0;
				const minHeight = uni.getSystemInfoSync().windowHeight - uni.upx2px(80);
				this.$emit('heightChanged',Math.max(finalHeight, minHeight));
			},
			doLoadMore(){
				this.$refs.paging.doLoadMore();
			},
			clear(){
				this.$refs.paging.clear();
				this.hideEmptyView = true;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		height: 100%;
		// padding: $gap;
	}

	.item {
		margin-bottom: $gap;
	}
</style> 