<template>
	<view class="innerContainer">
		<view class="left">
			<view class="avatar">
				<u-avatar :src="newInfo.userInfo.avatar" :size="100"></u-avatar>
			</view>
			<view class="ifo">
				<view class="nickname">
					<view class="">
						{{newInfo.userInfo.username}}
					</view>
				</view>
				<view class="message">
					{{newInfo.content}}
				</view>
			</view>
		</view>

		<view class="right">
			{{newInfo.createTime}}
		</view>
	</view>
</template>

<script>
	export default {
		name: "message-item",
		data() {
			return {
				userInfo: {},
				newInfo: {

				}
			};
		},
		props: {
			item: {
				type: Object,
				default: () => {}
			}
		},
		watch: {
			item: {
				handler(newVal) {
					this.newInfo = newVal;
					if (this.newInfo.information) {
						let {
							senderName,
							senderAvatar,
							applyMessage,
							createTime
						} = JSON.parse(this.newInfo.information);
						this.newInfo.userInfo = {
							username: senderName,
							avatar: senderAvatar
						}
						this.newInfo.content = applyMessage;
					}
					
				},
				immediate: true
			}
		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>
	.innerContainer {
		padding: 0;
		margin: 0;
		display: flex;
		justify-content: space-between;
		// align-items: center;
		width: 100%;
		margin: 50rpx 0;

		.left {
			display: flex;

			.avatar {
				width: 100rpx;
				height: 110rpx;
				display: flex;
				justify-content: center;
			}

			.ifo {
				height: 100rpx;
				// display: flex;
				// flex-direction: column;
				// justify-content: space-around;
				padding-left: 20rpx;
				padding-top: 10rpx;

				.nickname {
					font-weight: 600;
					font-size: 28rpx;
					color: #1B1B26;
				}

				.message {
					width: 450rpx;
					overflow: hidden;
					font-weight: 400;
					font-size: 24rpx;
					color: #95959D;
					// 省略两行
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
				}
			}
		}

		.right {
			width: 120rpx;
			padding-left: 20rpx;
			font-weight: 400;
			font-size: 20rpx;
			color: #95959D;
		}
	}
</style>