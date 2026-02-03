<template>
	<view class="archive-item" @click.stop="goDetail">
		<view class="left">
			<view class="title">{{ item.archiveBagName }}</view>
			<view class="date">{{ (item.createTime || '2025-05-20').slice(0, 10) }}</view>
		</view>
		<view class="right">
			<view class="action-group">
				<view class="view-btn" @click.stop="goDetail">查看档案</view>
				<view class="delete-btn" @click.stop="deleteArchive">
					<u-icon name="trash" color="#6A8BFF" size="36"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "archive-item",
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
		watch: {
			item: {
				handler(newVal) {
					this.isFollow = newVal.isFollow;
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			goDetail() {
				uni.navigateTo({
					url: '/personal/archive/archive?id=' + this.item.id
				})
			},
			deleteArchive() {
                let params = {
                    ...this.item,
                    status:0
                }
				// 提示是否确认删除
				uni.showModal({
					title: '提示',
					content: '是否确认删除该档案？',
					success: (res) => {
						if (res.confirm) {
							this.$H.put('archiveBag',params).then(res => {
							console.log(res)
							if(res.code == 200) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
                                this.$emit('delete', this.item)
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
.archive-item {
    width: 684rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 20rpx;
	margin-bottom: 24rpx;
}
.left {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1B1B26;
	margin-bottom: 12rpx;
}
.date {
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
.divider {
	width: 2rpx;
	height: 40rpx;
	background: #E3E8F0;
	margin-right: 16rpx;
}
.delete-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 8rpx;
}
</style>