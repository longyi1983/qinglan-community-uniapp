<template>
	<view>
		<view class="page-body">
			<block v-for="(item,index) in msgList" :key="index">
				<view class="notification-content">
					<text class="date">{{item.createTime}}</text>
					<view class="notification-card">
						<view class="notification-header">
							<u-icon name="volume-up-fill" color="#f56c6c" size="28"></u-icon>
							<text class="notification-title">{{item.title}}</text>
						</view>
						<u-line></u-line>
						<view class="notification-body">
							<text class="notification-text">
								{{item.content}}
							</text>
						</view>
					</view>
				</view>
			</block>
			<!-- 加载状态 -->
			<block v-if="msgList.length === 0 && page==1">
				<u-empty margin-top="100" text="暂无系统消息" mode="favor"></u-empty>
			</block>
			<view style="height: 130rpx;"></view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mTxt: "",
				msgList: [],
				userInfo: uni.getStorageSync("userInfo"),
				user: {},
				page: 1,
				isTop: true, //上拉到顶后加锁处理
				timer: null, //定时器
			};
		},
		onLoad(options) {
			this.getMessage(1);
			this.timer = setInterval(() => {
				this.getMessage(1);
			}, 30000);
		},
		onPullDownRefresh() {
			this.page++;
			if (this.isTop) {
				this.getMessage(0);
			}
			uni.stopPullDownRefresh();
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		},
		onReachBottom() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
			this.timer = setInterval(() => {
				this.getMessage(1);
			}, 30000);
		},
		onUnload() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		},
		methods: {
			//如果为1说明是初始加载或发送消息后的更新，如果参数为0说明是上拉加载
			getMessage(e) {
				if (e == 1) {
					this.page = 1;
				}
				this.$H.post("user/systemInfoList", {
					page: this.page,
					uid: this.user.uid
				}).then(res => {

					if (e == 1) {
						this.msgList = res.result;
						this.page = 1;
					} else {
						if (res.result.length == 0) {
							this.$u.toast('到顶啦！');
							this.isTop = false;
						}
						this.msgList = res.result.concat(this.msgList);
					}

					this.updateChatStatus();
				})
			},

			sendMessage() {
				if (!this.mTxt) {
					this.$u.toast('内容不能为空');
					return;
				}
				this.isTop = true;
				this.$H.post("user/sendMessage", {
					uid: this.user.uid,
					content: this.mTxt
				}).then(res => {
					if (res.code == 0) {
						this.getMessage(1);
						this.mTxt = "";
					}
				})
			},
			// 更新阅读状态
			updateChatStatus() {
				this.$H.post("message/updateSystemStatus", {
					uid: this.user.uid
				}).then(res => {

				})
			},

			goWatch(uid) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + uid
				})
			},
			goPost(id) {
				uni.navigateTo({
					url: '/pages/post/detail?id=' + id
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page-body {
		padding: 0 20rpx;
		font-size: 28rpx;
	}

	.container {
		background-color: #f8f8f8;
		min-height: 100rpx;
	}

	.notification-content {
		padding: 30rpx;
	}

	.date {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		margin-bottom: 6rpx;
		display: block;
	}

	.notification-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 16rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
	}

	.notification-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.notification-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-left: 16rpx;
	}

	.notification-body {
		// padding-left: 50rpx;
	}

	.notification-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}
</style>