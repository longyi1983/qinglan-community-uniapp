<template>
	<view class="sync-item" @click.stop="goDetail">
		<view class="left">
			<view class="user-info">
				<u-avatar :src="item.userInfo.avatar" :size="60"></u-avatar>
				<view class="user-details">
					<view class="nickname">{{ item.userInfo.username }}</view>
					<view class="archive-name">{{ item.archiveBagName || '暂无档案' }}</view>
				</view>
			</view>
			<view class="sync-time">{{ (item.createTime || '2025-05-20').slice(0, 10) }}</view>
		</view>
		<view class="right">
			<view class="action-group">
				<view class="view-btn" @click.stop="goDetail">查看档案</view>
				<view class="sync-btn" @click.stop="syncArchive">
					<u-icon name="download" color="#6A8BFF" size="36"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "sync-item",
		data() {
			return {

			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
		},
		methods: {
			goDetail() {
				uni.navigateTo({
					url: '/personal/archive/archive?id=' + this.item.id
				})
			},
			syncArchive() {
				// 提示是否确认同步
				uni.showModal({
					title: '提示',
					content: '是否确认同步该档案？',
					success: (res) => {
						if (res.confirm) {
							this.$H.post('archiveBag/sync', {
								archiveId: this.item.id
							}).then(res => {
								if(res.code == 200) {
									uni.showToast({
										title: '同步成功',
										icon: 'success'
									});
									this.$emit('sync', this.item)
								} else {
									uni.showToast({
										title: res.msg || '同步失败',
										icon: 'none'
									});
								}
							});
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.sync-item {
    width: 684rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 20rpx;
	margin-bottom: 24rpx;
	background: #fff;
	padding: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.left {
	display: flex;
	flex-direction: column;
	justify-content: center;
	flex: 1;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 12rpx;
}

.user-details {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.nickname {
	font-size: 32rpx;
	font-weight: bold;
	color: #1B1B26;
}

.archive-name {
	font-size: 26rpx;
	color: #6A8BFF;
}

.sync-time {
	font-size: 24rpx;
	color: #B0B4C0;
}

.right {
	display: flex;
	align-items: center;
	height: 100%;
}

.action-group {
	display: flex;
	align-items: center;
}

.view-btn {
	border: 2rpx solid #6A8BFF;
	color: #6A8BFF;
	padding: 8rpx 28rpx;
	border-radius: 8rpx;
	font-size: 26rpx;
	margin-right: 16rpx;
}

.sync-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 8rpx;
}
</style>
