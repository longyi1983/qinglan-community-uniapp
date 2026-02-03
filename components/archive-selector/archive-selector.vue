<template>
	<view class="archive-selector-wrapper">
		<u-popup v-model="visible" mode="center" width="560rpx" height="auto" :border-radius="20" :mask-close-able="true"
			@close="handleClose" :z-index="999">
			<view class="archive-selector-container">
				<!-- 头像 -->
				<view class="avatar">
					<image :src="sheep" mode="widthFix"></image>
				</view>
				<!-- 文字说明 -->
				<view class="intro">
					<text v-if="archiveList.length > 0 && selectedArchive">本次解析结果将加入【{{selectedArchive.archiveBagName}}】档案，如需加入其他档案请点击【选择档案】</text>
					<text v-else>您还没有档案，请点击【新建档案】</text>
				</view>
				<!-- 选择档案 -->
				<view class="choose-archive" @click="openPicker">
					{{selectedArchive ? selectedArchive.archiveBagName : '请新建档案'}}
				</view>

				<!-- 底部按钮 -->
				<view class="footer">
					<view class="btn confirm-btn" @click="newArchive">新建档案</view>
					<view class="btn confirm-btn" @click="handleConfirm">确认</view>
				</view>
			</view>
		</u-popup>
		
		<!-- picker放在弹窗外部，但仍在同一个根元素内 -->
		<u-picker mode="selector" v-model="showPicker" :default-selector="[0]" :range="archiveList"
			range-key="archiveBagName" @confirm="selectArchive" :z-index="1000"></u-picker>
	</view>
</template>

<script>
	export default {
		name: 'ArchiveSelector',
		props: {
			show: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				visible: false,
				showPicker: false,
				archiveList: [],
				selectedArchive: null,
				sheep: this.$f.geturl("/uniapp/new/scale/sheep.png"),
				isNavigatingToNewArchive: false,
			};
		},
		watch: {
			show: {
				handler(newVal) {
					this.visible = newVal;
					console.log(111111111111111,newVal);
					if (newVal) {
						// 先重置selectedArchive，避免显示旧的档案信息
						this.selectedArchive = null;
						this.loadArchives();
					}
				},
				immediate: true
			}
		},
		mounted() {
			// 监听页面显示事件，当从新建档案页面返回时刷新列表
			uni.$on('pageShow', this.handlePageShow);
		},
		beforeDestroy() {
			// 移除事件监听
			uni.$off('pageShow', this.handlePageShow);
		},
		methods: {
			newArchive() {
				// 记录当前状态，表示即将跳转到新建档案页面
				this.$emit('newArchive');
				
				uni.navigateTo({
					url: '/personal/archive/edit/edit',
					success: () => {
						// 跳转成功后，设置一个标记
						this.isNavigatingToNewArchive = true;
					}
				});
			},
			openPicker() {
				if (this.archiveList.length === 0) {
					uni.showToast({
						title: '您还没有档案，请点击【新建档案】',
						icon: 'none'
					});
					return;
				}
				this.showPicker = true;
			},
			// 加载档案列表
			loadArchives() {
				// 先重置selectedArchive，避免显示旧的档案信息
				this.selectedArchive = null;
				
				this.$H.get('archiveBag/list', {
						pageNum: 1,
						pageSize: 9999
					})
					.then(res => {
						if (res.code == 200 && res.rows) {
							this.archiveList = res.rows;
							// 如果有档案，默认选择第一个
							if (this.archiveList.length > 0) {
								this.selectedArchive = this.archiveList[0];
							} else {
								this.selectedArchive = null;
							}
						} else {
							this.archiveList = [];
							this.selectedArchive = null;
						}
					})
					.catch(err => {
						console.error('加载档案列表失败:', err);
						this.archiveList = [];
						this.selectedArchive = null;
					});
			},

			// 选择档案
			selectArchive(e) {
				console.log("test",e);
				const index = e[0];
				if (this.archiveList[index]) {
					this.selectedArchive = this.archiveList[index];
					console.log('选择的档案:', this.selectedArchive);
				}
			},

			// 关闭弹窗
			handleClose() {
				this.visible = false;
				// this.selectedArchive = null;
				this.$emit('close');
			},

			// 确认选择
			handleConfirm() {
				if (!this.selectedArchive) {
					// 如果没有选择档案，提示用户新建档案
					uni.showModal({
						title: '提示',
						content: '您还没有档案，是否现在新建一个档案？',
						success: (res) => {
							if (res.confirm) {
								this.newArchive();
							}
						}
					});
					return;
				}

				this.$emit('confirm', this.selectedArchive);
				this.handleClose();
			},

			// 处理页面显示事件
			handlePageShow() {
				// 如果之前跳转到新建档案页面，现在返回了，则刷新列表
				if (this.isNavigatingToNewArchive) {
					this.isNavigatingToNewArchive = false;
					this.loadArchives();
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.archive-selector-wrapper {
		position: relative;
	}

	.archive-selector-container {
		width: 560rpx;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		padding: $gap;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		padding: $gap 0;
		flex-shrink: 0;
		gap: 20rpx;
	}

	.btn {
		flex: 1;
		height: 80rpx;
		border-radius: 16rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		font-weight: bold;
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.95);
		}
	}

	.confirm-btn {
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: #fff;

		&.disabled {
			background: #ccc;
			color: #999;
			pointer-events: none;
		}
	}

	.avatar {
		width: 180rpx;
		height: 180rpx;
		background: linear-gradient(180deg, #BECDFF 0%, #91A7FF 100%);
		border-radius: 16rpx;
		margin: 0 auto;
		overflow: hidden;

		image {
			width: 90%;
			height: 90%;
			margin: 10% 5%;
		}
	}

	.intro {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 28rpx;
		color: #5B5B6E;
		padding: $gap 0;
	}

	.choose-archive {
		// width: 475rpx;
		height: 68rpx;
		line-height: 68rpx;
		padding: 0 $gap;
		box-sizing: border-box;
		background: #F6F6FF;
		border-radius: 16rpx;
		font-family: PingFangSC, PingFang SC;
		font-size: 28rpx;
		color: #95959D;
	}
</style>