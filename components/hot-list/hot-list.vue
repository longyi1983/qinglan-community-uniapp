<template>
	<view class="content">
		<view class="title">
			<u-image width="36rpx" height="36rpx" src="@/static/index/hot.png"></u-image>
			<text>热门测试</text>
		</view>
		<u-line color="#E6E6EA"></u-line>
		<view class="list">
			<view class="item" v-for="(item,index) in hotList" :key="item" @click="goDetail(item)">
				<view class="num">
					{{index+1}}
				</view>
				<view class="name">
					{{ item.scaleName }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "hot-list",
		data() {
			return {
				hotList: []
			};
		},
		mounted() {
			this.getHotList();
		},
		methods: {
			getHotList() {
				this.$H.get('scale/list',{
					page:1,
					pageSize:5,
					levelId:999
				}).then(res => {
					if(res.code == 200 && res.rows){
						this.hotList = res.rows;
					}
				})
			},
			goDetail(item) {
				uni.navigateTo({
					url: `/scale/detail/detail?id=${item.id}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		width: 333rpx;
		// height: 446rpx;
		background: linear-gradient(45deg, #FFFFFF 0%, #FFF1F0 100%);
		border-radius: 16rpx;
		margin-top: 20rpx;
		box-sizing: border-box;
		padding: 20rpx;

		.title {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			font-weight: 600;
			color: #1B1B26;
			margin-bottom: 20rpx;

			text {
				margin-left: 10rpx;
			}
		}

		.list {
			display: flex;
			flex-direction: column;

			.item {
				display: flex;
				align-items: center;
				margin-top: 30rpx;

				.num {
					width: 28rpx;
					height: 28rpx;
					background: #F6F6F6;
					border-radius: 8rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 20rpx;
					font-weight: 600;
					color: #1B1B26;
					margin-right: 20rpx;
					background: linear-gradient(154deg, #FFA384 0%, #FE6C44 100%);
					color: white;
				}

				.name {
					width: 260rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					font-size: 24rpx;
					font-weight: 400;
					color: #1B1B26;
				}
			}
		}
	}
</style>