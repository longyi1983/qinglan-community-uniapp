<template>
	<view style="margin-bottom: 40rpx;">
		<view class="comment-item">
			<image @click="jumpUser(item.userInfo.uid)" class="avatar" :src="item.userInfo.avatar"></image>
			<view class="c-content" @click="onReply(item)">
				<view class="user">
					<text>{{ item.userInfo.username }}</text>
					<text v-if="item.userInfo.uid == postDetail.userInfo.uid" class="official">作者</text>
					<user-level :level="item.userInfo.level"></user-level>
				</view>
				<view class="" style="display: flex;">
					<!-- 回复信息（在详情页的子评论中显示） -->
					<view class="reply-info" v-if="showReplyInfo && item.toUser && item.toUser.uid">
						<text>回复 </text>
						<text class="reply-username" @click.stop="jumpUser(item.toUser.uid)">{{ item.toUser.username }}</text>
						<text>：</text>
					</view>
					<text class="c-txt">{{ item.content }}</text>
				</view>
				<image style="width: 200rpx; margin-top: 20rpx; border-radius: 16rpx" mode="widthFix"
					v-if="item.img&&item.img !== ''" :src="item.img"
					@click.stop="commentPreviewImage(item.img)" />
				<view class="bottom-item">
					<text class="time">
						{{ item.createTime | timeFormat }}
						<text>回复</text>
					</text>
					<block v-if="item.isThumbs">
						<view @click.stop="cancelThumbs(item.id, index)" class="thumbs">
							<u-image width="40rpx" height="40rpx" src="@/static/community/like-active.png"
								:showLoading="false"></u-image>
							<text class="num">{{ item.thumbs || 0 }}</text>
						</view>
					</block>
					<block v-else>
						<view @click.stop="onThumbs(item.id, index)" class="thumbs">
							<u-image width="40rpx" height="40rpx" src="@/static/community/like.png"
								:showLoading="false"></u-image>
							<text class="num">{{ item.thumbs || 0 }}</text>
						</view>
					</block>
					<view class="delete" @click.stop="handleMoreAction(item, index)">
						<u-icon name="more-dot-fill"></u-icon>
					</view>
				</view>
			</view>
		</view>
		<!-- 子评论 -->
		<view class="children-comment-container" v-if="!hideChildren && item.childrenCount">
			<view class="children-comment-item" v-for="(item2, index2) in item.children" :key="item2.id"
				@click="onChildReply(item2, index2)">
				<view class="author">
					{{ item2.userInfo.username }}：
				</view>
				<view class="detail">
					<text>回复</text>
					<navigator :url="'/pages/user/home?uid=' + item2.toUser.uid" hover-class="none"
						class="name" v-if="item2.toUser">
						{{ item2.toUser.username }}
					</navigator>
					<text>：{{ item2.content }}</text>
				</view>
			</view>
			<view class="more" v-if="item.childrenCount>2" @click="openDetail">
				查看{{item.childrenCount}}条评论
				<u-icon name="arrow-right"></u-icon>
			</view>
		</view>
		<u-line margin="40rpx 0 0 110rpx" length="85%"></u-line>
	</view>
</template>

<script>
	export default {
		name: "comment-item",
		props: {
			// 评论数据
			item: {
				type: Object,
				required: true
			},
			// 评论索引
			index: {
				type: Number,
				required: true
			},
			// 帖子详情
			postDetail: {
				type: Object,
				required: true
			},
			// 当前用户ID
			currentUserId: {
				type: [String, Number],
				default: ''
			},
			// 是否隐藏子评论区域（在详情页中使用）
			hideChildren: {
				type: Boolean,
				default: false
			},
			// 是否显示回复信息（在详情页的子评论中使用）
			showReplyInfo: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				
			};
		},
		methods: {
			// 跳转用户页面
			jumpUser(uid) {
				this.$emit('jumpUser', uid);
			},
			// 回复评论
			onReply(commentItem) {
				this.$emit('reply', commentItem);
			},
			// 回复子评论
			onChildReply(commentItem, childIndex) {
				this.$emit('reply', commentItem, this.index, childIndex);
			},
			// 预览评论图片
			commentPreviewImage(url) {
				this.$emit('previewImage', url);
			},
			// 点赞评论
			onThumbs(commentId, commentIndex) {
				this.$emit('thumbs', commentId, commentIndex);
			},
			// 取消点赞
			cancelThumbs(commentId, commentIndex) {
				this.$emit('cancelThumbs', commentId, commentIndex);
			},
			// 删除评论
			delComment(commentItem, commentIndex) {
				this.$emit('deleteComment', commentItem, commentIndex);
			},
			// 处理更多操作（删除或举报）
			handleMoreAction(commentItem, commentIndex) {
				let user = uni.getStorageSync('userInfo');
				if (commentItem.uid == user.uid) {
					// 如果是自己的评论，执行删除
					this.delComment(commentItem, commentIndex);
				} else {
					// 如果不是自己的评论，跳转到举报页面
					uni.navigateTo({
						url: `/pages/report/report?postId=${this.postDetail.id}&uid=${commentItem.userInfo.uid}&commentId=${commentItem.id}&type=comment`
					});
				}
			},
			// 查看更多评论详情
			openDetail() {
				this.$emit('openDetail', this.item);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comment-item {
		display: flex;
		padding: 20rpx;

		&:active {
			background-color: #F5F5F5;
		}

		.c-content {
			display: flex;
			flex-direction: column;
			flex: 1;

			.time {
				color: #999;
				font-size: 10px;
			}

			.user {
				display: flex;
				align-items: center;

				.official {
					color: #fff;
					font-size: 21rpx;
					text-align: center;
					width: 50rpx;
					min-width: 50rpx;
					height: 30rpx;
					min-height: 30rpx;
					line-height: 30rpx;
					border-radius: 4rpx;
					background-image: linear-gradient(to right, #e67577, #e5cad1);
					margin-left: 6rpx;
				}
			}
		}

		.bottom-item {
			display: flex;
			align-items: center;
			margin-top: 20rpx;

			.time {
				color: #999;
				font-size: 10px;

				text {
					color: #333;
					margin-left: 16rpx;
				}
			}

			.thumbs {
				margin-left: auto;
				display: flex;
				align-items: center;
				color: #bfbfbf;

				.num {
					margin: 0 10rpx;
				}
			}

			.delete {
				width: 50rpx;
				height: 50rpx;
				margin-left: 40rpx;
				color: #95959D;
			}
		}

		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}
	}

	.children-comment-container {
		width: 591rpx;
		box-sizing: border-box;
		padding: 24rpx;
		background: #F5F5F5;
		border-radius: 16rpx;
		margin-left: 128rpx;
		font-size: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.more {
			font-size: 24rpx;
			color: #6976FD;
			margin-top: 16rpx;
		}

		.children-comment-item {
			display: flex;
		}

		.author {
			color: #95959D;
		}

		.detail {
			display: flex;
		}

		.name {
			color: #55aaff;
			text-decoration: none;
		}
	}

	.reply-info {
		// font-size: 24rpx;
		color: #333;
		margin-bottom: 8rpx;

		.reply-username {
			color: #6986FD;
			font-weight: bold;
		}
	}

	.c-txt {
		word-break: break-all;
		white-space: pre-wrap;
		word-wrap: break-word;
		// margin: 10rpx 0;
	}
</style>