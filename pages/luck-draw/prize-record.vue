<template>
	<view class="prize-record-container">
		<block v-if="lists.length!=0">
			<view v-for="(item, index) in lists" :key="index" class="prize-record-item row">
				<custom-image :src="item.prizeImage" style="width: 90rpx;height: 90rpx" radius="6rpx" />
				<view class="prize-record-info">
					<view class="lg" v-if="item.prizeType==1">{{item.prizeName}}＋{{item.number}}</view>
					<view class="lg" v-else-if="item.prizeType==2">{{item.prizeName}}</view>
					<view class="lg" v-else-if="item.prizeType==3">{{item.prizeName}}￥{{item.number}}</view>
					<view class="lg" v-else-if="item.prizeType==4">{{item.prizeName}}{{item.number}}件(联系客服领取)</view>
					<view class="xs lighter" v-if="item.prizeType==1 ||item.prizeType==3 ">领取时间：{{item.createTime}}</view>
					<view class="xs lighter" v-if="item.prizeType==2">抽奖时间：{{item.createTime}}</view>
					<view class="xs lighter" v-if="item.prizeType==4">中奖时间：{{item.createTime}}</view>
				</view>
			</view>
		</block>
		<block v-else>
			<view class="data-null column-center">
				<image :src="$IMG+'/images/null_gift.png'" class="img-null"></image>
				<text class="xs muted">暂无抽奖记录～</text>
			</view>
		</block>
	</view>
</template>

<script>
	import customImage from "@/components/custom-image/custom-image.vue"

	export default {
		data() {
			return {
				$IMG: this.$IMG,
				loadStatus: "loading",
				page: 1,
				lists: []
			};
		},
		components: {
			customImage
		},
		onLoad: function(options) {
			this.getUserRecordFun();
		},


		onReachBottom: function() {
			this.page++;
			this.getUserRecordFun();
		},

		methods: {
			getUserRecordFun() {
				this.loadStatus = "loading";
				this.$H.get('luckDraw/record/' + this.page).then(res => {
					this.lists = this.lists.concat(res.result.data);
					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
						this.loadStatus = "nomore";
					} else {
						this.loadStatus = "loadmore"
					}
				})
			}

		}
	};
</script>
<style lang="scss">
	.prize-record-container {
		padding: 0 20rpx;

		.prize-record-item {
			margin-top: 20rpx;
			background-color: white;
			padding: 26rpx 24rpx;
			border-radius: 10rpx;

			.prize-record-info {
				margin-left: 24rpx;
				flex: 1
			}
		}
	}

	.data-null {
		padding-top: 200rpx;
	}

	.row {
		display: flex;
		align-items: center;
	}

	.lg {
		font-size: 32rpx;
	}

	.xs {
		font-size: 24rpx;
	}

	.muted {
		color: #606266;
	}

	.lighter {
		color: #7a7c81;
	}

	.column-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
