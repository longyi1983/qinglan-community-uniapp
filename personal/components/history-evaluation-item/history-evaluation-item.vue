<template>
	<view class="evaluation-item" @click="handleClick">
		<view class="content">
			<view class="suggestion">
				<text class="label">改善建议：</text>
				<text class="text">{{suggestion}}</text>
			</view>
			<view class="time">{{time}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			item: {
				type: Object,
				default: () => ({})
			}
		},
		computed: {
			suggestion() {
				try {
					const data = JSON.parse(this.item.aiResponseData);
					return data.output['改善建议'] || '';
				} catch (e) {
					return '';
				}
			},
			time() {
				return this.item.createdAt || '';
			}
		},
		methods: {
			handleClick() {
				uni.navigateTo({
					url: `/scale/evaluation/result/result?type=1&id=${this.item.id}`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
.evaluation-item {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	
	.content {
		.suggestion {
			margin-bottom: 20rpx;
			
			.label {
				color: #333;
				font-weight: bold;
				margin-right: 10rpx;
			}
			
			.text {
				color: #666;
				line-height: 1.6;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 3;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
		
		.time {
			color: #999;
			font-size: 24rpx;
		}
	}
}
</style> 