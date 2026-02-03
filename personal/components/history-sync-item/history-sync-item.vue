<template>
	<view class="scale-item" @click="goDetail">
		<view class="left">
			<view class="title-row">
				<view class="checkbox" :class="{ checked }" @click.stop="toggleChecked">
					<u-icon v-if="checked" name="checkmark" color="#fff" size="20"></u-icon>
				</view>
				<view class="title">{{ item.scaleName }}</view>
			</view>
			<view class="desc">
				<view class="test">{{ timeDisplay }}</view>
			</view>
		</view>
		<view class="right">
			<view class="sync-btn" @click.stop="emitSync">同步</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'history-sync-item',
	props: {
		item: {
			type: Object,
			default: () => ({})
		},
		checked: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			defaultImg: '/static/scale/share.png'
		};
	},
	computed: {
		timeDisplay() {
			const t = this.item && this.item.responseTime;
			return t ? t : '';
		}
	},
	methods: {
		toggleChecked() {
			this.$emit('toggle', this.item);
		},
		emitSync() {
			this.$emit('sync', this.item);
		},
		goDetail() {
			if (!this.item || !this.item.id) return;
			uni.navigateTo({
				url: '/scale/result/result?id=' + this.item.id + '&history=true'
			});
		}
	}
}
</script>

<style scoped lang="scss">
.scale-item {
	width: 686rpx;
	height: 202rpx;
	background: #FFFFFF;
	border-radius: 24rpx;
	box-sizing: border-box;
	padding: $gap;
	margin-bottom: 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	overflow: hidden;

	.left {
		flex: 1;
		min-width: 0;
		padding-right: $gap;

		.title-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 16rpx;

			.checkbox {
				width: 36rpx;
				height: 36rpx;
				border-radius: 8rpx;
				border: 2rpx solid #6A8BFF;
				display: flex;
				align-items: center;
				justify-content: center;
				background: transparent;
			}

			.checkbox.checked {
				background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
				border-color: transparent;
			}
		}

		.title {
			font-size: 28rpx;
			font-weight: bold;
			color: #1B1B26;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}

		.desc {
			width: auto;
			max-width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			gap: 16rpx;

			.test {
				font-size: 24rpx;
				font-weight: 400;
				color: #95959D;
			}

		}
	}

	.right {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		.sync-btn {
			padding: 14rpx 24rpx;
			border-radius: 12rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			color: #fff;
			font-size: 24rpx;
			font-weight: 600;
		}
	}
}
</style>


