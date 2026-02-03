<template>
	<view class="innerContainer" @click="jump">
		<view class="cover">
			<u-image width="300rpx" height="207rpx" :src="item.coverUrl" border-radius="16rpx"></u-image>
		</view>
		<view class="info">
			<view class="title">
				{{item.title}}
			</view>
			<view class="detail" v-if="!history">
				<view class="enrollCount">
					{{item.enrollCount}}人已报名
				</view>
				<view class="like" @click.stop="isLike ? unlike() : like()">
					<view class="">
						<u-image width="28rpx" height="28rpx" src="@/static/community/like-active.png"
							:show-loading="false" v-if="isLike"></u-image>
						<u-image width="28rpx" height="28rpx" src="@/static/community/like.png" v-else
							:show-loading="false"></u-image>
					</view>
					<text>{{likeCount}}</text>
				</view>
			</view>
			<view class="detail" v-else>
				<view class="enrollCount">
					{{item.enrollTime}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "activity-item",
		data() {
			return {
				isLike: false,
				likeCount: 0
			};
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			history: {
				type: Boolean,
				default: false
			}
		},
		watch: {
			item: {
				handler(newVal) {
					this.isLike = newVal.isLike;
					this.likeCount = newVal.likeCount;
				},
				immediate: true
			}
		},
		methods: {
			like() {
				this.isLike = true;
				this.likeCount++;
				this.$H.post('activity/like', {
					activityId: this.item.id
				}).then(res => {

				});
			},
			unlike() {
				this.isLike = false;
				this.likeCount--;
				this.$H.delete('activity/like/delete', {
					activityId: this.item.id
				}).then(res => {

				});
			},
			jump() {
				if (!this.history) {
					uni.navigateTo({
						url: '/main/activity/detail/detail?id=' + this.item.id
					})
				} else {
					uni.navigateTo({
						url:"/main/activity/enroll/enroll?historyId=" + this.item.id
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.innerContainer {
		margin: 0;
		padding: 0;
		margin-bottom: 60rpx;
		display: flex;
		gap: $gap;
		justify-content: space-between;

		.left {
			width: 300rpx;
			height: 207rpx;
			border-radius: 16rpx;
		}

		.info {
			width: 362rpx;
			height: 207rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.title {
				width: 355rpx;
				font-weight: bold;
				font-size: 32rpx;
				color: #1B1B26;
				// 两行省略
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}

			.detail {
				display: flex;
				justify-content: space-between;
			}

			.like {
				display: flex;
				gap: 12rpx;
			}
		}
	}
</style>