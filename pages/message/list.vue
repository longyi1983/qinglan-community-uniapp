<template>
	<view>
		<view class="read-tips">
			<text @click="readStatus">一键已读</text>
		</view>
		<block v-for="(item,index) in msgList" :key="index">
			<view class="comment-msg-item" @click="markAsRead(index, item)">
				<navigator :url="'/pages/user/home?uid='+ item.fromUid" hover-class="none">
					<u-avatar class="avatar" :src="item.userInfo.avatar"></u-avatar>
				</navigator>
				<view class="msg-c">
					<view class="msg-c-t">
						<text class="username">{{item.userInfo.username}}</text>
						<text class="time">{{item.createTime}}</text>
					</view>
					<view class="msg-c-txt">
						<text>{{item.content.replace(/用户【.*?】/, '')}}</text>
						<text v-if="item.status === 0" class="dot"></text>
					</view>
					<navigator v-if="msgType != 2" :url="'/pages/post/detail?id='+item.postId+'&mid='+item.mid"
						hover-class="none">
						<view class="post-c">
							<view class="line"></view>
							<view class="post-c-txt">{{item.postContent.substring(0,50)}}...</view>
						</view>
					</navigator>
				</view>
			</view>
		</block>
		<!-- 加载状态 -->
		<block v-if="msgList.length === 0 && loadStatus == 'nomore'">
			<u-empty margin-top="100" text="暂无内容" mode="favor"></u-empty>
		</block>
		<block v-else>
			<view style="margin: 30rpx 0;">
				<u-loadmore :status="loadStatus" />
			</view>
		</block>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				page: 1,
				current: 0,
				msgType: 0,
				msgList: [],
				loadStatus: 'loadmore',
			};
		},
		onLoad(options) {
			this.msgType = options.type;
			this.getMsgList();
			if (options.type == 2) {
				this.readAllWatchInfo();
			}
			uni.setNavigationBarTitle({
				title: options.type == 1 ? '收到的赞' : '收到的评论'
			})
		},
		onReachBottom() {
			this.page++;
			this.getMsgList();
		},
		destroyed() {
			this.readStatus();
		},
		methods: {
			readAllWatchInfo() {
				var that = this;
				this.$H.get("message/readAllWatchInfo", {}).then(res => {
					// that.getMsgList();
				})
			},
			getMsgList() {
				var that = this;
				this.$H.get("message/list", {
					type: this.msgType,
					page: this.page,
				}).then(res => {
					// this.msgList = res.result;
					that.msgList = that.msgList.concat(res.result.data);

					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
						this.loadStatus = 'nomore';
					} else {
						this.loadStatus = 'loadmore';
					}
				})
			},
			readStatus() {
				let that = this;
				this.$H.get("message/status", {
					type: this.msgType
				}).then(res => {
					this.msgList.forEach(function(item, index) {
						that.msgList[index].status = 1;
					});
				})
			},
			markAsRead(index, item) {
				if (item.status === 0) {
					this.$set(this.msgList, index, { ...item, status: 1 });
					// this.$H.get("message/status", { type: this.msgType, mid: item.mid });
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comment-msg-item {
		display: flex;
		background-color: #fff;
		border-bottom: 1px solid #f5f5f5;
		padding: 20rpx;
	}

	.comment-msg-item .msg-c {
		width: 100%;
	}

	.comment-msg-item .avatar {
		margin-right: 10rpx;
	}

	.comment-msg-item .post-c {
		font-size: 12px;
		line-height: 1.8;
		border-radius: 10rpx;
		font-size: 24rpx;
		color: #95959D;
		display: flex;

		.line {
			width: 8rpx;
			height: 40rpx;
			background: #F6F6FF;
			border-radius: 4rpx;
			margin-right: 10rpx;
			flex-shrink: 0;
		}
	}

	.comment-msg-item .post-c .post-c-txt {
		font-size: small;
		text-overflow: ellipsis;
		display: -webkit-box;
		word-break: break-all;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;
	}

	.comment-msg-item .msg-c {
		display: flex;
		flex-direction: column;
	}

	.comment-msg-item .msg-c .msg-c-t {
		display: flex;
	}

	.comment-msg-item .msg-c .msg-c-t .time {
		font-size: 10px;
		color: #999;
		margin-left: auto;
	}

	.comment-msg-item .msg-c .username {
		font-weight: bold;
		font-size: 28rpx;
		color: #1B1B26;
	}

	.comment-msg-item .msg-c .msg-c-txt {
		display: flex;
		align-items: center;
		font-size: small;
	}

	.comment-msg-item .msg-c .msg-c-txt .dot {
		width: 10rpx;
		height: 10rpx;
		background-color: #FA3534;
		border-radius: 50%;
		display: block;
		margin-left: 20rpx;
		flex-shrink: 0;
	}

	/*标记已读*/
	.read-tips {
		padding: 20rpx;
		background-color: #f5f5f5;
		display: flex;
	}

	.read-tips text {
		margin-left: auto;
	}
</style>