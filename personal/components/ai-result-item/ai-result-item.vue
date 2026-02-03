<template>
	<view class="result-item" @click="goDetail">
		<view class="content-container" :class="{ 'has-cards': hasCardImages && mode === 'OH' }">
			<view class="result-content">
				<view class="content-text">
					{{ $f.removeHashAndStar(item.resultContent) }}
				</view>
				<view class="time">
					{{ item.createTime }}
				</view>
			</view>
			<!-- OH卡模块 -->
			<view class="oh-card-container" v-if="mode === 'OH' && hasCardImages">
				<view class="card-wrapper">
					<view class="background-card" v-if="item.wordCardUrl">
						<image class="background-image" :src="item.wordCardUrl" mode="cover"></image>
					</view>
					<view class="foreground-card" v-if="item.flashcardsUrl">
						<image class="foreground-image" :src="item.flashcardsUrl" mode="cover"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "ai-result-item",
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			mode: {
				type: String,
				default: ''
			},
			back:{
				type: Boolean,
				default: false
			}
		},
		computed: {
			hasCardImages() {
				return this.item.wordCardUrl || this.item.flashcardsUrl;
			}
		},
		methods: {
			goDetail() {
				uni.navigateTo({
					url: `/ai/ohCard/result/result?id=${this.item.id}&mode=${this.mode}&back=${this.back}`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.result-item {
		background: #FFFFFF;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.content-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.result-content {
		flex: 1;
		margin-right: 20rpx;
		height: 260rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.content-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		margin-bottom: 20rpx;
		white-space: pre-wrap;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.oh-card-container {
		flex-shrink: 0;
		width: 200rpx;
		height: 260rpx;
	}

	.card-wrapper {
		position: relative;
		width: 200rpx;
		height: 260rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.background-card {
		position: absolute;
		width: 200rpx;
		height: 260rpx;
		border-radius: 12rpx;
		overflow: hidden;
		z-index: 1;
	}

	.foreground-card {
		position: absolute;
		width: 150rpx;
		height: 200rpx;
		border-radius: 8rpx;
		overflow: hidden;
		border: 2rpx solid #d05369;
		z-index: 2;
	}

	.background-image,
	.foreground-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-label {
		text-align: center;
		font-size: 24rpx;
		color: #666;
		margin-top: 10rpx;
	}
</style> 