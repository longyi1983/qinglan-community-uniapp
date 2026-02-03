<template>
	<view class="innerContainer" @click="jump">
		<user-info :item="item"></user-info>
		<!-- 标题 -->
		<view class="title">
			{{item.title}}
		</view>
		<!-- 内容 -->
		<view class="content">
			<view class="text" :class="{ 'text-expand': isExpanded }">
				{{item.content}}
			</view>
			<view class="expand-btn" v-if="showExpandBtn && false" @click="toggleExpand">
				<text class="expand-text">{{ isExpanded ? '收起' : '查看全文' }}</text>
			</view>
		</view>
		<!-- 图片 -->
		<view class="imgs">
			<u-image width="216rpx" height="216rpx" :src="img" border-radius="16rpx" v-for="img in item.media"
				:key="img"></u-image>
		</view>
		<!-- 话题 -->
		<view class="topic" v-if="item.discussTitle">
			<view class="image">
				<image src="@/static/community/topic.png" mode="" v-if="scale"></image>
				<image src="@/static/community/topic.png" mode="" v-else></image>
			</view>
			<text>
				{{item.discussTitle}}
			</text>
		</view>
		<!-- 地址和时间 -->
		<view class="address-time">
			<!-- <text>
				广州市
			</text> -->
			<text>
				{{item.createTime}}
			</text>
		</view>
		<!-- 点赞评论分享 -->
		<view class="like-comment-share">
			<view class="left">
				<!-- 点赞 -->
				<view class="button" @click.stop="handleLike">
					<u-image width="40rpx" height="40rpx" src="@/static/community/like-active.png" v-if="localCollection" :showLoading="false"></u-image>
					<u-image width="40rpx" height="40rpx" src="@/static/community/like.png" v-else :showLoading="false"></u-image>
					<text>{{localCollectionCount}}</text>
				</view>
				<!-- 评论 -->
				<view class="button">
					<u-image width="40rpx" height="40rpx" src="@/static/community/comment.png" :showLoading="false"></u-image>
					<text>{{item.commentCount}}</text>
				</view>
				<!-- 分享 -->
				<!-- <view class="button">
					<u-image width="40rpx" height="40rpx" src="@/static/community/share.png"></u-image>
					<text>99+</text>
				</view> -->
			</view>
			<view class="right">
				<view class="button" @click.stop="handleMore">
					<u-icon name="more-dot-fill"></u-icon>
				</view>
			</view>
		</view>
		<view class="test" v-if="scale">
			我也测一个
		</view>
		<!-- 更多的弹窗 -->
		<u-popup v-model="showMore" mode="bottom" border-radius="30" :mask-close-able="false">
			<view class="popup">
				<view class="title" v-if="!isCurrentUser">
					内容反馈
				</view>
				<view class="feedback" v-if="!isCurrentUser">
					<view class="feedback-item" v-for="(item,index) in feedback" :key="index"
						:class="{active:feedbackIndex == index}">
						{{item}}
					</view>
				</view>
				<view class="title" v-if="!isCurrentUser">
					不感兴趣
				</view>
				<view class="handle" v-if="!isCurrentUser">
					<view class="handle-item" v-for="(item,index) in handle" :key="index">
						<view class="handle-icon">
							<image :src="item.icon" mode=""></image>
						</view>
						<view class="handle-text">
							{{item.name}}
						</view>
					</view>
				</view>
				<view class="delete-post" v-if="isCurrentUser" @click="deletePost">
					<view class="delete-text">删除帖子</view>
				</view>
				<u-button @click="showMore = false">取消</u-button>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		name: "topic-item",
		data() {
			return {
				showMore: false,
				feedback: ["色情低俗", '内容有误差活引导', '内容质量差', '广告过多'],
				feedbackIndex: -1,
				handle: [{
						name: '减少此类内容',
						icon: require("@/static/community/1.png")
					},
					{
						name: '不看该作者：用户昵称',
						icon: require("@/static/community/2.png")
					},
					{
						name: '减少该话题的推送',
						icon: require("@/static/community/3.png")
					},
					{
						name: '重复推荐',
						icon: require("@/static/community/4.png")
					}
				],
				isExpanded: false,
				showExpandBtn: false,
				localCollection: false,
				localCollectionCount: 0
			};
		},
		computed: {
			// 判断是否是当前用户的帖子
			isCurrentUser() {
				return this.$store.state.loginUserInfo.uid == this.item.userInfo.uid;
			}
		},
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			scale: {
				type: Boolean,
				default: false
			}
		},
		watch: {
			'item': {
				immediate: true,
				handler(newVal) {
					if (newVal) {
						this.localCollection = newVal.isCollection;
						this.localCollectionCount = newVal.collectionCount;
					}
				}
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.checkContentHeight();
			});
		},
		beforeDestroy() {
			// 移除事件监听，防止内存泄漏
			// console.log('移除事件监听: topic-item组件');
			// uni.$off('updateCollection');
			// uni.$off('updateCommentCount');
			// uni.$off('updateIsFollow');
		},
		methods: {
			handleMore() {
				if (this.isCurrentUser) {
					// 如果是自己的帖子，删除帖子
					this.deletePost();
				} else {
					// 如果是别人的帖子，举报
					uni.navigateTo({
									url: `/pages/report/report?postId=${this.item.id}&uid=${this.item.uid}`
								});
				}
			},
			// 删除帖子
			deletePost() {
				uni.showModal({
					title: '提示',
					content: '确定要删除该帖子吗？',
					success: (res) => {
						if (res.confirm) {
							this.$H
								.post('post/del', {
									id: this.item.id
								})
								.then(res => {
									if (res.code === 0) {
										uni.showToast({
											title: '删除成功',
											icon: 'success'
										});
										// 发出事件通知列表刷新，传递被删除帖子的完整信息
										uni.$emit('refreshPostList', {
											postId: this.item.id,
											topicId: this.item.topicId,
											action: 'delete'
										});
										// 通知父组件帖子已删除
										this.$emit('postDeleted', {
											postId: this.item.id,
											topicId: this.item.topicId
										});
									} else {
										uni.showToast({
											title: res.msg || '删除失败',
											icon: 'none'
										});
									}
								});
						}
					}
				});
			},
			jump() {
				uni.navigateTo({
					url: '/pages/post/detail?id=' + this.item.id
				})
			},
			handleLike() {
				if (this.localCollection) {
					this.cancelCollection();
				} else {
					this.addCollection();
				}
			},
			cancelCollection() {
				console.log('发起请求: 取消收藏', this.item.id);
				this.$H
					.post('post/cancelCollection', {
						id: this.item.id
					})
					.then(res => {
						if (res.code === 0) {
							this.localCollection = false;
							this.localCollectionCount--;
							console.log('本地状态更新: 取消收藏成功', {
								id: this.item.id,
								collectionCount: this.localCollectionCount
							});
							// 发出事件以更新其他组件
							uni.$emit('updateCollection', {
								postId: this.item.id,
								isCollection: false,
								collectionCount: this.localCollectionCount
							});
							console.log('事件发送: updateCollection', {
								postId: this.item.id,
								isCollection: false,
								collectionCount: this.localCollectionCount
							});
						}
					});
			},
			addCollection() {
				console.log('发起请求: 添加收藏', this.item.id);
				this.$H
					.post('post/addCollection', {
						id: this.item.id,
						uid: this.item.uid
					})
					.then(res => {
						if (res.code === 0) {
							this.localCollection = true;
							this.localCollectionCount++;
							console.log('本地状态更新: 添加收藏成功', {
								id: this.item.id,
								collectionCount: this.localCollectionCount
							});
							// 发出事件以更新其他组件
							uni.$emit('updateCollection', {
								postId: this.item.id,
								isCollection: true,
								collectionCount: this.localCollectionCount
							});
							console.log('事件发送: updateCollection', {
								postId: this.item.id,
								isCollection: true,
								collectionCount: this.localCollectionCount
							});
						}
					});
			},
			toggleExpand() {
				return;
				this.isExpanded = !this.isExpanded;
			},
			checkContentHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.text').boundingClientRect(data => {
					console.log(2222,data);
					if (data) {
						this.showExpandBtn = data.height >= 66;
					}
				}).exec();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.innerContainer {
		margin: 0;
		padding: 0;
		margin-bottom: 60rpx;

		&>view {
			margin-top: 20rpx;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.user {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.ifo {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: flex-start;
				gap: 10rpx;

				.nickname {
					display: flex;
					align-items: center;

					.name {
						font-weight: 600;
						font-size: 24rpx;
						color: #1B1B26;
						line-height: 24rpx;
						text-align: left;
						font-style: normal;
						margin-right: 23rpx;
					}

					.level {
						width: 44rpx;
						height: 24rpx;
						background: linear-gradient(172deg, #FFEBB6 0%, #FFC449 100%);
						border-radius: 4rpx;
						font-weight: 600;
						font-size: 16rpx;
						color: #946400;
						line-height: 24rpx;
						text-align: center;
					}
				}

				.tag {
					font-size: 20rpx;
					color: #999;
				}
			}
		}

		.follow {
			width: 120rpx;
			height: 52rpx;
			line-height: 52rpx;
			background: #F0F3FF;
			border-radius: 8rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #6986FD;
			text-align: center;
			font-style: normal;
		}

		.title {
			font-size: 30rpx;
			font-weight: 600;
		}

		.content {
			font-size: 28rpx;
			color: #333;
			line-height: 40rpx;
			margin: 20rpx 0;

			.text {
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 3;
				overflow: hidden;
				text-overflow: ellipsis;
				word-break: break-all;

				&.text-expand {
					-webkit-line-clamp: unset;
				}
			}

			.expand-btn {
				margin-top: 10rpx;
				
				.expand-text {
					color: #6986FD;
					font-size: 28rpx;
				}
			}
		}

		.imgs {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
		}

		.topic {
			width: 100%;
			height: 68rpx;
			border-radius: 8rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #6986FD;
			display: flex;
			align-items: center;
			box-sizing: border-box;

			view {
				height: 48rpx;
				background: #F0F3FF;
				display: flex;
				align-items: center;
				padding: 10rpx;
				border-radius: 8rpx 0 0 8rpx;
			}

			image {
				width: 28rpx;
				height: 28rpx;
			}

			text {
				height: 48rpx;
				display: flex;
				align-items: center;
				background: #F0F3FF;
				padding: 10rpx;
				border-radius: 0 8rpx 8rpx 0;
			}
		}

		.address-time {
			height: 24rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #95959D;
			line-height: 24rpx;
			margin: $gap;
			margin-left: 0;

			text {
				margin-right: $gap;
			}
		}

		.like-comment-share {
			display: flex;
			justify-content: space-between;

			.left,
			.right {
				display: flex;
				gap: $gap;
			}

			.button {
				display: flex;
				align-items: center;
				gap: 10rpx;
			}

			.right .button {
				transform: rotate(90deg)
			}
		}
	}

	.popup {
		width: 100vw;
		height: 800rpx;
		background-color: #fff;
		padding: $gap;

		.title {
			font-weight: 600;
			font-size: 36rpx;
			color: #1B1B26;
			margin-top: 40rpx;
		}

		.feedback {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
			margin-top: 20rpx;

			.feedback-item {
				width: 328rpx;
				height: 68rpx;
				background: #F5F5F5;
				border-radius: 8rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: 400;
				font-size: 24rpx;
				color: #1B1B26;
			}
		}

		.handle {
			display: flex;
			flex-direction: column;
			gap: 40rpx;
			margin-top: 20rpx;
			margin-bottom: 20rpx;

			.handle-item {
				display: flex;
				align-items: center;
				gap: 10rpx;

				.handle-icon {
					width: 36rpx;
					height: 36rpx;
					line-height: 36rpx;
				}

				image {
					width: 36rpx;
					height: 36rpx;
				}

				.handle-text {
					margin-left: 16rpx;
					font-weight: 400;
					color: #1B1B26;
					height: 36rpx;
					line-height: 36rpx;
				}
			}
		}

		.delete-post {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100rpx;
			margin: 20rpx 0;
			
			.delete-text {
				font-size: 32rpx;
				color: #e74c3c;
				font-weight: 500;
			}
		}
	}

	.test {
		width: 687rpx;
		height: 68rpx;
		line-height: 68rpx;
		background: #F0F3FF;
		border-radius: 16rpx;
		font-weight: 600;
		font-size: 24rpx;
		color: #6986FD;
		text-align: center;
	}
</style>