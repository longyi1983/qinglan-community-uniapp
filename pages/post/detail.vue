<template>
	<view class="container">
		<view class="info-box">
			<user-info :item="postDetail"></user-info>
			<view v-if="showType=='1'&&postDetail.media&&postDetail.media.length>0">
				<u-swiper :list="postDetail.media" :height="imgHeight" bgColor="none" img-mode="aspectFit"
					@click="showImage" @change="changeSwiper"></u-swiper>
			</view>
			<u-line v-if="showType=='1'&&postDetail.media&&postDetail.media.length>0"
				margin="28rpx 0rpx"></u-line>
			<view class="hr"></view>
			<view class="post-title">{{ postDetail.title }}</view>
			<!-- 付费贴简介 -->
			<view class="post-text" v-if="postDetail.cut==1">
				<mp-html :content="postDetail.brief" selectable="true" />
			</view>
			<!-- 帖子内容 -->
			<view class="post-text">
				<mp-html :content="postDetail.content" selectable="true" />
			</view>
			<!-- 图片 -->
			<block v-if="postDetail.type == 1 && showType=='0'">
				<!--一张图片-->
				<block v-if="postDetail.media.length == 1">
					<image class="img-style-1" @tap.stop="previewImage" mode="aspectFill"
						:data-current="postDetail.media[0]" :data-image="postDetail.media" :src="postDetail.media[0]">
					</image>
				</block>
				<!--二张图片-->
				<block v-else-if="postDetail.media.length == 2">
					<view class="img-style-2">
						<image v-for="(mediaItem, index2) in postDetail.media" :key="index2" @tap.stop="previewImage"
							mode="aspectFill" :data-current="mediaItem" :data-image="postDetail.media" :src="mediaItem">
						</image>
					</view>
				</block>
				<!--四张图-->
				<block v-else-if="postDetail.media.length == 4">
					<view class="img-style-4">
						<image v-for="(mediaItem, index2) in postDetail.media" :key="index2" @tap.stop="previewImage"
							mode="aspectFill" :data-current="mediaItem" :data-image="postDetail.media" :src="mediaItem">
						</image>
					</view>
				</block>
				<!--其他张数图片-->
				<block v-else>
					<view class="other-img-flex" :class="imageClass[postDetail.media.length]">
						<view :class="'wrap-style ' + 'wrap-style-' + (imageIndex + 1)"
							v-for="(image, imageIndex) in postDetail.media" :key="imageIndex">
							<image class="show-flex" mode="aspectFill" @tap.stop="previewImage" :data-current="image"
								:data-image="postDetail.media" :src="image"></image>
						</view>
					</view>
				</block>
			</block>
			<block v-if="postDetail.type == 2 && postDetail.media.length > 0">
				<video :controls="true" :autoplay="true" :loop="true" :src="postDetail.media[0]"></video>
			</block>
			<!-- 投票 -->
			<view v-if="postDetail.type === 4" class="vote-box">
				<view class="title">{{ postDetail.voteInfo.title }}</view>
				<view class="expire-time" v-if="postDetail.voteInfo.type === 1">单选</view>
				<view class="expire-time" v-if="postDetail.voteInfo.type === 2">多选</view>
				<!-- 是否投票失效 -->
				<view class="expire-box" v-if="isVoteExpire">投票已过期</view>
				<view v-else class="expire-time">截止：{{ postDetail.voteInfo.time }}</view>
				<view class="vote-item" @click="castVote(index2, postDetail.voteInfo.type)"
					:class="{ active: item2.checked }" v-for="(item2, index2) in postDetail.voteInfo.options"
					:key="index2">
					<text v-if="postDetail.isVoteResult || isVoteExpire">{{ item2.content }}<text
							style="color: #999;margin-left: 20rpx;">({{ item2.ticketNum }}票)</text></text>
					<text v-else="postDetail.isVoteResult">{{ item2.content }}</text>
				</view>
				<lf-button v-if="!postDetail.isVoteResult && isVoteExpire === false" @click="voteSubmit">投票</lf-button>
			</view>

			<!-- 话题 -->
			<view class="detail-tag" v-if="postDetail.discussId > 0 && postDetail.type == 1">
				<view @click="toDiscuss(postDetail.discussId)">
					<image mode="aspectFill" src="../static/images/topic.png"></image>
					<view>{{postDetail.discussName}}</view>
				</view>
			</view>
			<!-- 地址信息 -->
			<view v-if="postDetail.address" @click="openLocation" class="post-address">
				<view>
					<u-icon class="icon" name="map-fill"></u-icon>
					<view>{{postDetail.address}}</view>
				</view>
			</view>
			<view class="icon">
				<text>{{ postDetail.createTime | timeFormat }}</text>
			</view>
			<!-- 圈子信息 -->
			<navigator class="topic-info" :url="'/pages/topic/detail?id=' + postDetail.topicId" v-if="false">
				<image mode="aspectFill" class="cover" :src="postDetail.topicInfo.coverImage"></image>
				<view class="center">
					<view class="desc">{{ postDetail.topicInfo.topicName.substring(0, 12) }}</view>
					<view class="count-txt">{{ postDetail.topicInfo.userCount | numberFormat}}位成员 /
						{{ postDetail.topicInfo.postCount | numberFormat }}篇作品
					</view>
				</view>
				<view class="right">
					<text>去看看</text>
					<u-icon name="arrow-right-double"></u-icon>
				</view>
			</navigator>
			<!--点赞、分享、评论-->
			<view class="p-footer">
				<block>
					<view class="p-item">
						<u-image width="40rpx" height="40rpx" src="@/static/community/like-active.png"
							v-if="postDetail.isCollection" @click="cancelCollection" :show-loading="false"></u-image>
						<u-image width="40rpx" height="40rpx" src="@/static/community/like.png" v-else
							@click="addCollection" :show-loading="false"></u-image>
						<text style="margin-left: 10rpx;">{{ postDetail.collectionCount }}</text>
					</view>
				</block>
				<view class="p-item" @click="focusCommentInput">
					<u-image width="40rpx" height="40rpx" src="@/static/community/comment.png"
						:showLoading="false"></u-image>
					<text>{{ postDetail.commentCount }}</text>
				</view>
				<!-- #ifdef MP -->
				<view class="p-item" @click="openShare()">
					<u-image width="40rpx" height="40rpx" src="@/static/community/share.png"
						:showLoading="false"></u-image>
					<text>分享</text>
				</view>
				<!-- #endif -->
				<!-- #ifdef H5 -->
				<view class="p-item" @click="showShare = true">
					<u-image width="40rpx" height="40rpx" src="@/static/community/share.png"
						:showLoading="false"></u-image>
					<text>分享</text>
				</view>
				<!-- #endif -->
				<!-- #ifdef APP-PLUS -->
				<view class="p-item">
					<text class="iconfont icon-yuedu"></text>
					<text>{{ postDetail.readCount }}</text>
				</view>
				<!-- #endif -->

			</view>
		</view>

		<view class="comment-box">
			<!-- 评论分类 -->
			<view class="tabs">
				<u-tabs :list="tabs" @click="click" font-size="$gap"
					:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
					:current="current" @change="change" bg-color="#FFFFFF"></u-tabs>
			</view>
			<comment-item v-for="(item, index) in commentList" :key="item.id" :item="item" :index="index"
				:postDetail="postDetail" :currentUserId="$store.state.loginUserInfo.uid" @jumpUser="jumpUser"
				@reply="onReply" @previewImage="commentPreviewImage" @thumbs="onThumbs" @cancelThumbs="cancelThumbs"
				@deleteComment="delComment" @openDetail="openDetail" />
			<!-- 加载状态 -->
			<block v-if="commentList!=null&&commentList.length > 0">
				<view style="margin: 30rpx;">
					<u-loadmore :status="loadStatus" />
				</view>
			</block>
			<block v-else>
				<u-empty text="暂无评论" mode="message"></u-empty>
			</block>
		</view>
		<view style="height: 100rpx;"></view>
		<!-- 评论输入框 -->
		<comment-tool v-if="!showDetail" ref="mainCommentTool" :placeholder="placeholder" :focus="focus" :isSubmitD="isSubmitD"
			@blur="onBlur" @addComment="handleAddComment" />
		<!-- 分享选择弹窗 -->
		<lf-popup v-model="showShare" height="240rpx">
			<view class="share-wrap" @click="closeShare">
				<!-- #ifdef MP-WEIXIN -->
				<button open-type="share" class="share-item-wx u-reset-button">
					<image src="/static/wechat.png"></image>
					<text>微信好友</text>
				</button>
				<!-- #endif -->
				<!-- #ifdef H5 -->
				<view class="share-item2" @click="copyPageUrl">
					<image src="/static/images/share.png"></image>
					<text>分享链接</text>
				</view>

				<!-- #endif -->
				<!-- #ifdef H5 || MP-WEIXIN -->
				<!-- <view class="share-item" @click="shareCanvas">
					<image src="/static/images/share2.png"></image>
					<text>分享海报</text>
				</view> -->
				<!-- #endif -->
			</view>
		</lf-popup>
		<!-- 分享海报弹窗-->
		<u-popup v-model="showCanvas" mode="center" width="80%">
			<view class="share-box">
				<image :src="posterUrl" class="images"></image>
			</view>
			<view class="footer">
				<u-button :custom-style="shareBtnStyle" @click="saveImg" type="success" shape="circle">保存分享</u-button>
			</view>
		</u-popup>
		<!-- 打赏弹框 -->
		<u-popup v-model="showReward" mode="center">
			<view class="show-reward">
				<image class="show-reward-image" @click="jumpUser(postDetail.uid)" :src="postDetail.userInfo.avatar" />
				<text
					style="font-weight: 600;font-size:30rpx;margin-bottom: 20rpx;">{{postDetail.userInfo.username}}</text>

				<view class="show-reward-view">
					<view @tap.stop.prevent="changeRewardSelect" :class="rewardCount == 5 ? 'check-it' : ''"
						data-price="5">$5</view>
					<view @tap.stop.prevent="changeRewardSelect" :class="rewardCount == 20 ? 'check-it' : ''"
						data-price="20">$20</view>
					<view @tap.stop.prevent="changeRewardSelect" :class="rewardCount == 50 ? 'check-it' : ''"
						data-price="50">$50</view>
					<view @tap.stop.prevent="changeRewardSelect" :class="rewardCount == 100 ? 'check-it' : ''"
						data-price="100">$100</view>
				</view>
				<view class="show-reward-pop">
					<text>$</text>
					<input class="show-input-pop" @input="rewardChange" :value="rewardCount"
						placeholder-class="count-input" type="number" placeholder="请输入打赏积分" />
				</view>
				<view class="show-reward-btn" @tap.stop.prevent="submitReward">确认打赏</view>
			</view>
		</u-popup>
		<!-- 子评论 -->
		<u-popup mode="bottom" v-model="showDetail" border-radius="20" z-index="100">
			<view class="detail-comment">
				<view class="head">
					<text>评论详情</text>
					<u-icon name="close-circle" @click="closeDetailPopup"></u-icon>
				</view>
				<scroll-view scroll-y="true" style="height: 1000rpx;" @scrolltolower="loadMoreDetailComments">
					<!-- 原始评论 -->
					<view v-if="currentDetailComment" class="original-comment">
						<comment-item :item="currentDetailComment" :index="-1" :postDetail="postDetail"
							:currentUserId="$store.state.loginUserInfo.uid" :hideChildren="true" @jumpUser="jumpUser"
							@reply="onReply" @previewImage="commentPreviewImage" @thumbs="onThumbs"
							@cancelThumbs="cancelThumbs" @deleteComment="delComment" />
					</view>
					<view class="head" style="padding-top: 0;">
						<text>全部回复</text>
					</view>
					<!-- 子评论 -->
					<view class="children-comments" v-if="detailCommentList.length > 0">
						<view v-for="(item, index) in detailCommentList" :key="item.id">
							<comment-item :item="item" :index="index" :postDetail="postDetail"
								:currentUserId="$store.state.loginUserInfo.uid" :hideChildren="true"
								:showReplyInfo="true" @jumpUser="jumpUser" @reply="onReply"
								@previewImage="commentPreviewImage" @thumbs="onThumbs" @cancelThumbs="cancelThumbs"
								@deleteComment="delComment" />
						</view>
					</view>

					<!-- 加载状态 -->
					<view v-if="detailCommentList.length > 0" style="margin: 30rpx;">
						<u-loadmore :status="detailLoadStatus" />
					</view>
					<view v-else-if="currentDetailComment">
						<u-empty text="暂无回复" mode="message"></u-empty>
					</view>
				</scroll-view>

				<comment-tool ref="detailCommentTool" :placeholder="placeholder" :focus="detailFocus" :isSubmitD="isSubmitD"
					@blur="onBlur" @addComment="handleAddComment" />
			</view>
		</u-popup>
		<!-- 自定义加载 -->
		<toast color="#fff" type="rotate3"></toast>
	</view>
</template>

<script>
	import linfengAd from "@/components/linfeng-ad/linfeng-ad.vue";
	import commentItem from "@/components/comment-item/comment-item.vue";
	import commentTool from "@/components/comment-tool/comment-tool.vue";

	export default {
		components: {
			linfengAd,
			commentItem,
			commentTool
		},
		data() {
			return {
				tabs: [{
					name: '全部',
					key: ""
				}, {
					name: '热门',
					key: "hot"
				}, {
					name: '最新的',
					key: "latest"
				}, {
					name: '最早',
					key: "earliest"
				}, ],
				current: 0,
				$IMG: this.$IMG,
				btnStyle: {
					borderRadius: '100rpx',
					color: "#fff",
					backgroundColor: '#000000',
					width: '166rpx',
					height: '60rpx',
					fontSize: '30rpx'
				},
				postId: 0,
				postDetail: {
					comment: [],
					media: [],
					commentList: {
						data: []
					},
					topicInfo: {
						topicName: ''
					},
					userInfo: {

					},
					voteInfo: {},
					content: ''
				},
				focus: false,
				detailFocus: false, // 详情页输入框的焦点状态
				isSubmitD: false,
				commentList: [],
				placeholder: '说点什么...',
				form: {
					pid: 0,
					type: 1,
					toUid: '',
					postId: '',
					content: '',
					img: '',
					uid: '',
					userInfo: null,
					toUser: null,
					createTime: ''
				},
				showShare: false,
				showCanvas: false,
				shareBtnStyle: {
					backgroundColor: '#333'
				},
				page: 1,
				loadStatus: 'loadmore',
				isVoteExpire: false,
				isVip: 0,
				posterUrl: "",
				showTel: false,
				imageClass: ['', 'one-img', 'two-img', 'three-img', 'four-img', 'five-img', 'six-img', 'seven-img',
					'eight-img', 'nine-img'
				],
				h5Adpid: '',
				wxAdpid: '',
				adIsOpen: '',
				showType: '0',
				rewardBtn: '0',
				showReward: false,
				rewardCount: '',
				imgHeight: 980,
				tmpHeight: 0,

				showDetail: false, //子评论弹窗
				currentDetailComment: null, // 当前查看详情的评论
				detailCommentList: [], // 详情页的所有子评论列表
				detailPage: 1, // 详情页的分页
				detailLoadStatus: 'loadmore', // 详情页的加载状态
				replyToUser: null, // 当前回复的目标用户信息
			};
		},
		onLoad(options) {
			this.postId = options.id;

			if (options.scene) {
				this.postId = options.scene;
			}
			if (options.mid) {
				this.messageRead(options.mid);
			}

			this.form.postId = this.postId;
			this.getPostDetail();
			this.getCommentList();
			this.getAdConfig();
			let userInfo = uni.getStorageSync('userInfo');
			if (userInfo) {
				this.isVip = uni.getStorageSync('userInfo').vip
			}

			// 监听关注/取消关注事件
			// uni.$on('updateIsFollow', (data) => {
			// 	// 如果事件中的用户ID与当前帖子的用户ID相同，则更新关注状态
			// 	if (this.postDetail && this.postDetail.uid === data.uid) {
			// 		this.postDetail.isFollow = data.isFollow;
			// 		console.log('收到事件: updateIsFollow', data);
			// 	}
			// });

			//#ifdef MP-WEIXIN
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
			//#endif
		},
		onUnload() {
			// 页面卸载时，取消事件监听，防止内存泄漏
			uni.$off('updateIsFollow');
		},
		onReachBottom() {
			this.page++;
			if (this.loadStatus == 'loadmore') {
				this.getCommentList();
			}
		},
		onShareAppMessage(res) {

			let imgURL;
			if (this.postDetail.media != null) {
				if (this.postDetail.media.length > 0) {
					imgURL = this.postDetail.media[0];
				}
			}
			let content = this.postDetail.content;
			if (this.postDetail.cut == 1) {
				content = this.postDetail.brief
				imgURL = "https://demo.linfeng.tech/resource/images/user-bg.png"
			}
			return {
				title: content,
				path: '/pages/post/detail?id=' + this.postId,
				imageUrl: imgURL
			};
		},
		onShareTimeline() {
			let imgURL = this.postDetail.media[0];
			let content = this.postDetail.content;
			if (this.postDetail.cut == 1) {
				content = this.postDetail.brief
				imgURL = "https://demo.linfeng.tech/resource/images/user-bg.png"
			}
			return {
				title: content,
				imageUrl: imgURL,
				query: 'id=' + this.postId
			};
		},
		methods: {
			// 聚焦评论输入框
			focusCommentInput() {
				if (this.showDetail && this.currentDetailComment) {
					// 在详情页面，聚焦详情页输入框
					this.detailFocus = true;
					this.$nextTick(() => {
						if (this.$refs.detailCommentTool) {
							this.$refs.detailCommentTool.focusInput();
						}
					});
				} else {
					// 在主页面，聚焦主页输入框
					this.focus = true;
					this.$nextTick(() => {
						if (this.$refs.mainCommentTool) {
							this.$refs.mainCommentTool.focusInput();
						}
					});
				}
			},
			openDetail(commentItem) {
				this.currentDetailComment = commentItem;
				this.detailCommentList = [];
				this.detailPage = 1;
				this.detailLoadStatus = 'loadmore';
				this.showDetail = true;
				this.form.pid = commentItem.id;
				
				// 重置回复状态为回复父评论
				this.placeholder = '回复：' + commentItem.userInfo.username;
				this.replyToUser = {
					uid: commentItem.userInfo.uid,
					username: commentItem.userInfo.username,
					avatar: commentItem.userInfo.avatar || ''
				};
				this.form.toUid = commentItem.userInfo.uid;
				
				// 重置focus状态
				this.focus = false;
				this.detailFocus = false;
				
				this.getDetailCommentList();
			},
			// 获取详情页评论列表（所有子评论）
			getDetailCommentList() {
				if (!this.currentDetailComment) return;

				this.detailLoadStatus = 'loading';
				this.$H
					.get('commentVo/sonList', {
						postId: this.postId,
						parentId: this.currentDetailComment.id,
						pageNum: this.detailPage,
						pageSize: 20
					})
					.then(res => {
						if (res.code == 200) {
							if (this.detailPage === 1) {
								this.detailCommentList = res.rows || [];
							} else {
								this.detailCommentList = this.detailCommentList.concat(res.rows || []);
							}

							// 如果返回的数据少于请求的pageSize，说明没有更多数据了
							if ((res.rows || []).length < 20) {
								this.detailLoadStatus = 'nomore';
							} else {
								this.detailLoadStatus = 'loadmore';
							}
						} else {
							this.detailLoadStatus = 'nomore';
						}
					})
					.catch(() => {
						this.detailLoadStatus = 'nomore';
					});
			},
			// 详情页加载更多
			loadMoreDetailComments() {
				if (this.detailLoadStatus === 'loadmore') {
					this.detailPage++;
					this.getDetailCommentList();
				}
			},
			// 关闭详情弹窗
			closeDetailPopup() {
				this.showDetail = false;
				this.currentDetailComment = null;
				this.detailCommentList = [];
				
				// 重置回复状态
				this.placeholder = '留下你的精彩评论...';
				this.replyToUser = null;
				this.form.pid = 0;
				this.form.toUid = '';
				this.form.toUser = null;
				this.form.uid = '';
				this.form.createTime = '';
				
				// 重置focus状态
				this.focus = false;
				this.detailFocus = false;
			},
			change(index) {
				this.current = index;
				this.page = 1;
				this.loadStatus = 'loading'; // 重置为loading状态，确保重新加载
				this.commentList = []; // 清空评论列表
				this.getCommentList();
			},
			//获取广告配置
			getAdConfig() {
				this.$H.get('system/getAd').then(res => {
					if (res.code == 0) {
						this.adIsOpen = res.adIsOpen;
						this.h5Adpid = res.h5Adpid;
						this.wxAdpid = res.wxAdpid;
					}
				});
			},
			close(e) {
				this.showTel = e
			},
			openShare() {
				this.showShare = true
			},
			messageRead(mid) {
				this.$H
					.post('message/readMessage', {
						postId: this.postId,
						mid: mid
					})
					.then(res => {

					});
			},
			voteSubmit() {
				let voteDate = [];
				this.postDetail.voteInfo.options.forEach(item => {
					if (item.checked) {
						voteDate.push(item.id);
					}
				});
				
				// 验证用户是否至少选择了一个选项
				if (voteDate.length === 0) {
					uni.showToast({
						title: "请至少选择一个选项",
						icon: "none",
						duration: 2000,
					});
					return;
				}
				
				this.$H
					.post('post/vote/userVote', {
						id: this.postDetail.voteInfo.id,
						vote: voteDate
					})
					.then(res => {
						if (res.code == 0) {
							this.getPostDetail();
							uni.showToast({
								title: "投票成功",
								icon: "none",
								duration: 2000,
							});
						}
					});
			},
			castVote(index, type) {
				if (!this.postDetail.isVoteResult && !this.isVoteExpire) {
					if (type === 1) {
						this.postDetail.voteInfo.options.forEach(item => {
							this.$set(item, 'checked', false);
						});
					}
					let checked = this.postDetail.voteInfo.options[index].checked;
					if (checked) {
						this.$set(this.postDetail.voteInfo.options[index], 'checked', false);
					} else {
						this.$set(this.postDetail.voteInfo.options[index], 'checked', true);
					}
				}
			},
			closeShare() {
				this.showShare = false
			},
			copyPageUrl() {
				let that = this;
				uni.setClipboardData({
					data: this.$c.shareH5Url + 'pages/post/detail?id=' + this.postId,
					success: function() {
						uni.hideToast();
						that.$f.toast('链接复制成功', 'none');
						that.showShare = false;
					}
				});
			},
			// 删除评论
			delComment(e, index, index2) {
				console.log('test', 11111111111111111, e, index, index2);
				let that = this;
				let user = uni.getStorageSync('userInfo');

				if (e.uid != user.uid) {
					return;
				}

				uni.showModal({
					title: '提示',
					content: '确定删除自己的评论嘛？',
					success: function(res) {
						if (res.confirm) {
							that.$H
								.post('comment/del', {
									id: e.id
								})
								.then(res2 => {
									if (res2.code == 0) {
										// 如果是在详情页
										if (that.showDetail && that.currentDetailComment) {
											if (index === -1) {
												// 删除的是原始评论，关闭详情页并从主列表删除
												that.closeDetailPopup();
												// 找到主列表中对应的评论并删除
												let mainIndex = that.commentList.findIndex(item => item
													.id === e.id);
												if (mainIndex !== -1) {
													that.commentList.splice(mainIndex, 1);
												}
											} else {
												// 删除详情页的子评论
												that.detailCommentList.splice(index, 1);
												// 同时更新原始评论的子评论数量
												if (that.currentDetailComment.childrenCount > 0) {
													that.currentDetailComment.childrenCount--;
												}
											}
										} else {
											// 主列表页的删除逻辑
											if (index2 || index2 === 0) {
												that.commentList[index].children.splice(index2, 1);
												that.commentList[index].childrenCount--;
											} else {
												that.commentList.splice(index, 1);
											}
										}
										that.$u.toast('删除成功');
									}
								});
						}
					}
				});
			},
			onCopy() {

				this.$f.copy(this.postDetail.content);
			},
			// 保存海报到相册
			saveImg() {
				// #ifdef MP-WEIXIN
				uni.getImageInfo({
					src: this.posterUrl,
					success: function(image) {
						uni.saveImageToPhotosAlbum({
							filePath: image.path,
							success: function() {
								uni.showToast({
									title: '图片保存成功'
								});
							},
							fail: function() {
								uni.showModal({
									title: '图片保存失败',
									content: '请确认是否已开启授权',
									confirmText: '开启授权',
									success(res) {
										if (res.confirm) {
											uni.openSetting({
												success(settingdata) {
													if (settingdata.authSetting[
															"scope.writePhotosAlbum"
														]) {
														uni.showToast({
															title: '授权成功，请重试哦~',
															icon: "none"
														});
													} else {
														uni.showToast({
															title: '请确定已打开保存权限',
															icon: "none"
														});
													}
												}
											})
										}
									}
								})
							},
						});
					},
					fail() {}
				});
				// #endif
				// #ifdef H5
				var oA = document.createElement('a');
				oA.download = ''; // 设置下载的文件名，默认是'下载'
				oA.href = this.posterUrl;
				document.body.appendChild(oA);
				oA.click();
				oA.remove(); // 下载之后把创建的元素删除
				// #endif
			},
			// 生成分享海报
			shareCanvas() {
				this.showCanvas = true;
				uni.showLoading({
					mask: true,
					title: '正在生成海报'
				});
				// #ifdef H5
				let origin = "h5";
				let url = this.$c.shareH5Url + "pages/post/detail?id=" + this.postId
				// #endif
				// #ifdef MP-WEIXIN
				origin = "weixin";
				url = "pages/post/detail?id=" + this.postId
				// #endif
				this.$H
					.get('post/qrCode', {
						postId: this.postId,
						origin: origin,
						url: url
					})
					.then(res => {
						if (res.code == 0) {
							this.posterUrl = res.result
						} else {
							this.showCanvas = false;
						}
						uni.hideLoading();
					});



			},
			toDiscuss(id) {
				uni.navigateTo({
					url: '/pages/discuss/detail?id=' + id
				});
			},

			openLocation() {
				uni.openLocation({
					address: this.postDetail.address,
					latitude: parseFloat(this.postDetail.latitude),
					longitude: parseFloat(this.postDetail.longitude),
					success: () => {
						console.log('success');
					}
				});
			},
			// 点赞
			onThumbs(id, index, index2) {
				this.$H
					.post('comment/thumbs', {
						id: id
					})
					.then(res => {
						if (res.code == 0) {
							// 如果是在详情页（index为-1表示原始评论，其他数字表示详情页的子评论）
							if (this.showDetail && this.currentDetailComment) {
								if (index === -1) {
									// 原始评论
									this.currentDetailComment.isThumbs = true;
									this.currentDetailComment.thumbs++;
								} else {
									// 详情页的子评论
									this.detailCommentList[index].isThumbs = true;
									this.detailCommentList[index].thumbs++;
								}
							} else {
								// 主列表页
								if (index2 || index2 == 0) {
									this.commentList[index].children[index2].isThumbs = true;
									this.commentList[index].children[index2].thumbs++;
								} else {
									this.commentList[index].isThumbs = true;
									this.commentList[index].thumbs++;
								}
							}
						}
					});
			},
			// 取消点赞
			cancelThumbs(id, index, index2) {
				this.$H
					.post('comment/cancelThumbs', {
						id: id
					})
					.then(res => {
						if (res.code == 0) {
							// 如果是在详情页
							if (this.showDetail && this.currentDetailComment) {
								if (index === -1) {
									// 原始评论
									this.currentDetailComment.isThumbs = false;
									this.currentDetailComment.thumbs--;
								} else {
									// 详情页的子评论
									this.detailCommentList[index].isThumbs = false;
									this.detailCommentList[index].thumbs--;
								}
							} else {
								// 主列表页
								if (index2 || index2 == 0) {
									this.commentList[index].children[index2].isThumbs = false;
									this.commentList[index].children[index2].thumbs--;
								} else {
									this.commentList[index].isThumbs = false;
									this.commentList[index].thumbs--;
								}
							}
						}
					});
			},
			focusEvent(event) {

			},
						// 回复评论
			onReply(e, index, index2) {
				this.placeholder = '回复：' + e.userInfo.username;

				// 保存回复目标用户信息
				this.replyToUser = {
					uid: e.userInfo.uid,
					username: e.userInfo.username,
					avatar: e.userInfo.avatar || ''
				};

				// 如果是在详情页
				if (this.showDetail && this.currentDetailComment) {
					// 在详情页中，所有回复都应该是回复原始评论
					this.form.pid = this.currentDetailComment.id;
					// 重置并聚焦详情页的输入框
					this.detailFocus = false;
					this.$nextTick(() => {
						this.detailFocus = true;
						if (this.$refs.detailCommentTool) {
							this.$refs.detailCommentTool.focusInput();
						}
					});
				} else {
					// 主列表页的逻辑
					let pid = e.pid;
					if (pid === 0) {
						this.form.pid = e.id;
					} else {
						this.form.pid = e.pid;
					}
					// 重置并聚焦主页的输入框
					this.focus = false;
					this.$nextTick(() => {
						this.focus = true;
						this.$refs.mainCommentTool.focusInput();
					});
				}
				
				this.form.toUid = e.userInfo.uid;
				this.form.postId = this.postId;
			},
			// 输入框失去焦点时
			onBlur() {
				// 延时执行，避免点击评论时过早清除回复信息
				setTimeout(() => {
					// 检查当前是否真的失去焦点
					let actuallyBlurred = false;
					if (this.showDetail && this.currentDetailComment) {
						// 详情页面
						if (!this.detailFocus) {
							actuallyBlurred = true;
						}
					} else {
						// 主页面
						if (!this.focus) {
							actuallyBlurred = true;
						}
					}

					if (actuallyBlurred) {
						// 如果在详情页，保持回复当前评论的状态
						if (this.showDetail && this.currentDetailComment) {
							// 如果有明确的回复目标用户，显示该用户名，否则显示父评论用户名
							if (this.replyToUser) {
								this.placeholder = '回复：' + this.replyToUser.username;
							} else {
								this.placeholder = '回复：' + this.currentDetailComment.userInfo.username;
							}
							// 不清空 replyToUser，保持回复状态
						} else {
							this.placeholder = '留下你的精彩评论...';
							this.replyToUser = null; // 清空回复目标用户信息
						}
					}
				}, 100);
				
				// 重置对应的focus状态
				if (this.showDetail && this.currentDetailComment) {
					this.detailFocus = false;
				} else {
					this.focus = false;
				}
			},
			// 处理评论组件发送的评论事件
			handleAddComment(commentData) {
				this.isSubmitD = true;
				
				// 设置表单数据
				this.form.content = commentData.content;
				this.form.img = commentData.commentImg || commentData.img || '';
				
				// 添加当前用户信息
				const currentUserInfo = this.$store.state.loginUserInfo || uni.getStorageSync('userInfo');
				this.form.userInfo = currentUserInfo;
				this.form.uid = currentUserInfo?.uid || '';
				
				// 添加回复目标用户信息
				this.form.toUser = this.replyToUser;
				
				// 添加创建时间
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');
				const seconds = String(now.getSeconds()).padStart(2, '0');
				this.form.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.0`;
				
				uni.showLoading({
					mask: true,
					title: '发布中'
				});

				this.$H.post('post/addComment', this.form).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						if (res.check) {
							uni.showModal({
								title: '提示',
								content: '评论审核通过后发布哦，请耐心等待',
								showCancel: false,
								success: function(res) {
									if (res.confirm) {}
								}
							});
						} else {
							this.$u.toast('评论成功');
							this.postDetail.commentCount += 1;
							// 发送评论数改变事件
							uni.$emit('updateCommentCount', {
								postId: this.postId,
								commentCount: this.postDetail.commentCount
							});
							console.log('事件发送: updateCommentCount', {
								postId: this.postId,
								commentCount: this.postDetail.commentCount
							});
							
							// 如果返回了新评论对象且加载状态是nomore，直接添加到列表
							if (res.request) {
								res.request.childrenCount = 0;
								res.request.children = [];
								// 如果在详情页，推送到详情页评论列表最后
								if (this.showDetail && this.currentDetailComment && this.detailLoadStatus === 'nomore') {
									this.detailCommentList.push(res.request);
									// 更新原始评论的子评论数量
									if (this.currentDetailComment.childrenCount >= 0) {
										this.currentDetailComment.childrenCount++;
									}
									
									// 清空输入框内容
									this.$nextTick(() => {
										if (this.$refs.detailCommentTool) {
											this.$refs.detailCommentTool.clearContent();
										}
									});
									
									// 重置提交状态
									this.isSubmitD = false;
									// 不需要重新请求评论列表
									return;
								} else if (!this.showDetail && this.loadStatus === 'nomore') {
									if(res.request.pid){
										// 推送到子回复中去
										console.log("推送到子回复中去",res.request,this.commentList)
										this.commentList.forEach(item => {
											if(item.id == res.request.pid){
												item.childrenCount++;
												if(!item.children){
													item.children = [];
												}
												if(item.children.length<2){
													item.children.push(res.request);
												}
											}
										});
									} else if (this.current === 2) { // "最新的" tab
										this.commentList.unshift(res.request); // 添加到第一项
									} else {
										this.commentList.push(res.request); // 添加到最后一项
									}
									
									// 清空输入框内容
									this.$nextTick(() => {
										if (this.$refs.mainCommentTool) {
											this.$refs.mainCommentTool.clearContent();
										}
									});
									
									// 重置提交状态
									this.isSubmitD = false;
									// 不需要重新请求评论列表
									return;
								}
							}
						}
						
						// 如果在详情页，保持回复当前评论的状态
						if (this.showDetail && this.currentDetailComment) {
							// 保持回复当前查看的评论
							this.form.pid = this.currentDetailComment.id;
							// 如果有明确的回复目标用户，保持回复状态
							if (this.replyToUser) {
								this.form.toUid = this.replyToUser.uid;
								this.placeholder = '回复：' + this.replyToUser.username;
							} else {
								// 如果没有明确的回复目标用户，则回复评论作者
								this.form.toUid = this.currentDetailComment.userInfo.uid;
								this.placeholder = '回复：' + this.currentDetailComment.userInfo.username;
							}
						} else {
							// 主页面，清空回复状态
							this.form.pid = 0;
							this.form.toUid = '';
							this.form.toUser = null;
							this.form.uid = '';
							this.form.createTime = '';
							this.replyToUser = null;
							this.placeholder = '留下你的精彩评论...';
						}

						// 重置参数并重新请求评论列表
						this.page = 1;
						this.commentList = [];
						this.getCommentList();
						
						// 如果是在详情页，也重新获取详情页评论列表
						if (this.showDetail && this.currentDetailComment) {
							this.detailPage = 1;
							this.detailCommentList = [];
							this.getDetailCommentList();
							// 确保详情页输入框状态正确
							this.$nextTick(() => {
								if (this.$refs.detailCommentTool) {
									this.$refs.detailCommentTool.clearContent();
								}
							});
						} else {
							// 确保主页输入框状态正确
							this.$nextTick(() => {
								if (this.$refs.mainCommentTool) {
									this.$refs.mainCommentTool.clearContent();
								}
							});
						}
					} else if (res.code == 500) {
						this.$u.toast(res.msg);
					}
					this.isSubmitD = false;
				});
			},
			// 获取评论列表
			getCommentList() {
				this.loadStatus = 'loading';
				this.$H
					.get('commentVo/list', {
						postId: this.postId,
						pageNum: this.page,
						pageSize: 10,
						sortType: this.tabs[this.current]['key']
					})
					.then(res => {
						if (res.code == 200) {
							// 如果是第一页，直接赋值；否则追加数据
							if (this.page === 1) {
								this.commentList = res.rows;
							} else {
								this.commentList = this.commentList.concat(res.rows);
							}

							// 判断是否还有更多数据
							if (res.rows.length < 10) {
								this.loadStatus = 'nomore';
							} else {
								this.loadStatus = 'loadmore';
							}
						} else {
							// 请求失败时重置状态
							this.loadStatus = 'loadmore';
						}
					})
					.catch(err => {
						// 请求异常时重置状态
						this.loadStatus = 'loadmore';
						console.error('获取评论列表失败:', err);
					});
			},
			jumpUser(uid) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + uid
				});
			},

			commentPreviewImage(url) {
				uni.previewImage({
					urls: [url]
				})
			},
			getPostDetail() {
				this.$loading(true);
				var that = this
				this.$H
					.get('post/detail', {
						id: this.postId
					})
					.then(res => {
						if (res.code == 500) {
							uni.hideLoading();
							this.$u.toast(res.msg);
							this.$loading(false);
							setTimeout(function() {
								uni.switchTab({
									url: '/pages/index/index'
								});
							}, 1500);
						} else if (res.code == 999) {
							uni.hideLoading();
							this.$u.toast(res.msg);
							this.$loading(false);
							setTimeout(function() {
								uni.redirectTo({
									url: '/pages/post/confirm?id=' + that.postId + '&type=1'
								});
							}, 1500);
						} else {
							this.$loading(false);
							this.postDetail = res.result;
							//处理不换行的问题
							this.postDetail.content = this.postDetail.content.replace(/\n/g, '<br>');
							//修改链接
							this.postDetail.content = this.$f.formatText(res.result.content)
							if (res.result.showType) {
								this.showType = res.result.showType;
							}
							this.rewardBtn = res.result.rewardBtn;
							//这里一定要再判断是否为长文
							if (this.postDetail.type == 3) {
								uni.redirectTo({
									url: '/subpages/content/article/article?id=' + this.postId
								})

							}
							if (this.postDetail.type == 2) {
								var res = this.$f.decryptUrl(this.postDetail.media[0]);
								var list = JSON.parse(res)
								this.postDetail.media[0] = list[0]
							}

							if (this.postDetail.type == 1 && this.postDetail.media && this.postDetail.media[0]) {
								this.getImageHeight(this.postDetail.media[0])
							}

							// 投票帖子
							if (this.postDetail.type == 4 && this.postDetail.voteId && this.postDetail.voteId > 0) {
								this.postDetail.voteInfo.options.forEach(item => {
									this.$set(item, 'checked', false);
								});

								let timestamp = Date.parse(new Date()) / 1000;
								if (this.postDetail.voteInfo.expireTime < timestamp) {
									this.isVoteExpire = true;
								}
							}

						}

					});
			},
			cancelCollection() {
				this.$H
					.post('post/cancelCollection', {
						id: this.postId
					})
					.then(res => {
						if (res.code === 0) {
							this.postDetail.isCollection = false;
							this.postDetail.collectionCount--;
							// 发送取消收藏状态改变事件
							uni.$emit('updateCollection', {
								postId: this.postId,
								isCollection: false,
								collectionCount: this.postDetail.collectionCount
							});
							console.log('事件发送: updateCollection', {
								postId: this.postId,
								isCollection: false,
								collectionCount: this.postDetail.collectionCount
							});
						}
					});
			},
			addCollection() {
				this.$H
					.post('post/addCollection', {
						id: this.postId,
						uid: this.postDetail.uid
					})
					.then(res => {
						if (res.code === 0) {
							this.postDetail.isCollection = true;
							this.postDetail.collectionCount++;
							// 发送收藏状态改变事件
							uni.$emit('updateCollection', {
								postId: this.postId,
								isCollection: true,
								collectionCount: this.postDetail.collectionCount
							});
							console.log('事件发送: updateCollection', {
								postId: this.postId,
								isCollection: true,
								collectionCount: this.postDetail.collectionCount
							});
						}
					});
			},
			addThumb() {
				this.$H
					.post('post/addThumb', {
						id: this.postId
					})
					.then(res => {
						if (res.code === 0) {
							this.postDetail.isThumb = true;
						}
					});
			},
			cancelThumb() {
				this.$H
					.post('post/cancelThumb', {
						id: this.postId,
						uid: this.postDetail.uid
					})
					.then(res => {
						if (res.code === 0) {
							this.postDetail.isThumb = false;
						}
					});
			},
			follow() {
				this.$H
					.post('user/addFollow', {
						id: this.postDetail.uid
					})
					.then(res => {
						if (res.code === 0) {
							this.postDetail.isFollow = true;
							// 发送关注状态改变事件
							uni.$emit('updateIsFollow', {
								uid: this.postDetail.uid,
								isFollow: true
							});
							console.log('事件发送: updateIsFollow', {
								uid: this.postDetail.uid,
								isFollow: true
							});
						} else {
							this.$refs.uToast.show({
								title: res.msg,
								type: 'error'
							});
						}
					});
			},
			cancelFollow() {
				console
				this.$H
					.post('user/cancelFollow', {
						id: this.postDetail.uid
					})
					.then(res => {
						if (res.code === 0) {
							this.postDetail.isFollow = false;
							// 发送取消关注状态改变事件
							uni.$emit('updateIsFollow', {
								uid: this.postDetail.uid,
								isFollow: false
							});
							console.log('事件发送: updateIsFollow', {
								uid: this.postDetail.uid,
								isFollow: false
							});
						}
					});
			},
			previewImage(e) {
				uni.previewImage({
					current: e.currentTarget.dataset.current, // 当前显示图片的http链接
					urls: e.currentTarget.dataset.image // 需要预览的图片http链接列表
				});
			},
			showImage(index) {
				uni.previewImage({
					current: this.postDetail.media[index], // 当前显示图片的http链接
					urls: this.postDetail.media // 需要预览的图片http链接列表
				});
			},
			isInteger(obj) {
				return obj % 1 === 0;
			},
			changeRewardSelect(value) {
				// console.log(value.currentTarget.dataset.price)
				this.rewardCount = value.currentTarget.dataset.price
			},
			rewardChange(value) {
				this.rewardCount = value.detail.value
			},
			openRewardBtn() {
				this.showReward = true
				this.rewardCount = ''
			},
			//打赏
			submitReward() {
				if (!uni.getStorageSync('hasLogin')) {
					this.$u.toast("请先登录");
					this.$f.jump('/pages/user/go-login')
					return;
				}
				if (this.rewardCount < 0) {
					this.$u.toast("输入数值违法");
					return;
				}
				if (!this.isInteger(this.rewardCount)) {
					this.$u.toast('必须为整数');
					return;
				}
				this.showReward = false
				var that = this;
				uni.showModal({
					title: '提醒',
					content: '打赏后不可撤回，你确定给该帖子作者打赏' + that.rewardCount + '积分吗',
					success: function(res) {
						if (res.confirm) {
							that.$H.post('bill/reward', {
									rewardCount: that.rewardCount,
									postId: that.postId,
								})
								.then(res => {
									if (res.code == 0) {
										that.showReward = false
										that.$u.toast('打赏成功');
									}
								});
						}
					}
				});
			},
			remainComment(item, index) {

				this.$H
					.get('comment/remainComment', {
						id: item.id
					})
					.then(res => {
						if (res.code == 0) {
							this.$set(this.commentList[index], 'children', this.commentList[index].children.concat(res
								.result));
							// this.commentList[index].children = this.commentList[index].children.concat(res.result);
							this.commentList[index].showBtn = false
						}
					});
			},
			changeSwiper(index) {
				this.getImageHeight(this.postDetail.media[index])
			},
			//获取图片高度
			getImageHeight(url) {
				var that = this
				uni.getImageInfo({
					src: url,
					success: function(image) {
						// console.log(image.height)
						// 动态获取所有图片里的最大高度作为tmpHeight，这么做可以尽量减少轮播高度改变造成的页面抖动
						if (image.height > that.tmpHeight) {
							that.tmpHeight = image.height
						}
						if (that.tmpHeight < 980 && that.tmpHeight > 450) {
							that.imgHeight = that.tmpHeight;
						} else if (that.tmpHeight > 980) {
							that.imgHeight = 980
						} else if (that.tmpHeight < 450) {
							that.imgHeight = 450
						}
					}
				});
			}

		}
	};
</script>

<style lang="scss" scoped>
	.container {
		width: 750rpx;
		padding: 0;
		margin: 0;
		overflow-x: hidden;
	}

	.post-title {
		margin: 20rpx 0;
		font-size: 36rpx;
		font-weight: 600;
	}

	.info-box {
		padding: 20rpx;
		background-color: #ffffff;
	}

	.icon text {
		font-size: 12px;
		color: #999;
		margin-right: 20rpx;
	}

	.detail-tag,
	.post-address {
		display: flex;
		align-items: center;
		padding: 12rpx 0;
	}

	.post-address>view,
	.detail-tag>view {
		display: flex;
		align-items: center;
		height: 56rpx;
		line-height: 56rpx;
		border-radius: 8rpx;
		background: #F0F3FF;
		padding: 16rpx;
		margin-right: 16rpx;
		font-weight: 400;
		font-size: 24rpx;
		color: #6986FD;
	}

	.post-address>view view,
	.detail-tag>view view {
		margin-left: 8rpx;
		font-size: 26rpx;
		font-weight: 400;
	}

	.post-address image,
	.detail-tag image {
		height: 30rpx;
		width: 30rpx;
	}

	/*关注*/

	.user-item-0 {
		display: flex;

		.user-item-user {

			.diyTag {
				display: flex;
				align-items: center;

				.user-name {
					font-size: 36rpx;
				}

				.image3 {
					width: 75rpx;
					height: 30rpx;
					margin-left: 5rpx;
				}
			}

			flex: 1;

			.postIntro {
				font-size: 12px;
				color: #999;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
		}

		.avatar-z {
			width: 80rpx;
			height: 80rpx;
			float: left;
			margin-right: 10rpx;
			border-radius: 50%;
			margin-top: 10rpx;
		}
	}

	.user-item-1 {
		display: flex;
		border-radius: 30rpx;
		padding: 20rpx $gap;

		.user-item-user {

			.diyTag {
				display: flex;
				align-items: center;

				.user-name {
					font-size: 36rpx;
				}

				.image3 {
					width: 75rpx;
					height: 30rpx;
					margin-left: 5rpx;
				}
			}

			flex: 1;

			.postIntro {
				font-size: 12px;
				color: #999;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
		}

		.avatar-z {
			width: 80rpx;
			height: 80rpx;
			float: left;
			margin-right: 10rpx;
			border-radius: 50%;
			margin-top: 10rpx;
		}
	}

	.followStyle {
		width: 120rpx;
		height: 52rpx;
		line-height: 52rpx;
		background: #F0F3FF;
		border-radius: 8rpx;
		font-weight: 400;
		font-size: 24rpx;
		color: #6986FD;
		text-align: center;
	}

	.followStyle1 {
		width: 120rpx;
		height: 52rpx;
		line-height: 52rpx;
		border-radius: 8rpx;
		border: 1rpx solid #BFBFC6;
		font-weight: 400;
		font-size: 24rpx;
		color: #BFBFC6;
		text-align: center;
	}

	.postStatus {
		width: 120rpx;
		height: 52rpx;
		line-height: 52rpx;
		background: #F0F3FF;
		border-radius: 8rpx;
		font-weight: 400;
		font-size: 24rpx;
		color: #6986FD;
		text-align: center;

		&.status-pending {
			background: #FFF0F0;
			color: #FF4D4F;
		}

		&.status-offline {
			background: #FFE7E7;
			color: #FF4D4F;
		}
	}

	/*底部操作*/
	.p-footer {
		margin: 30rpx;
		display: flex;
		font-size: 24rpx;
		color: #616161;

		.p-item {
			display: flex;
			align-items: center;
			gap: 10rpx;

			.iconfont {
				font-size: 40rpx;
			}

			&:nth-child(2) {
				margin: 0 auto;
			}

			.iconfont {
				margin-right: 10rpx;
			}
		}
	}

	/*评论列表*/
	.comment-box {
		background-color: #ffffff;
		margin-top: 20rpx;
		padding: 20rpx;
	}

	.comment-box>.title {
		margin-bottom: 20rpx;
	}



	.sub-comment-item {
		margin-left: 100rpx;
		padding: 20rpx;
		background-color: #F3F2F2;

		&:active {
			background-color: #F5F5F5;
		}

		.user {
			display: flex;
			align-items: center;

			.name {
				color: #616161;
			}

			.avatar {
				margin-right: 10rpx;
			}

			.u-head {
				flex: 1;
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
					margin-top: 12rpx;
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
			}
		}

		.reply {
			.time {
				margin-left: auto;
				font-size: 20rpx;
				color: #999;
			}

			.name {
				display: inline-block;
				color: #55aaff;
				font-weight: 600;
			}
		}
	}



	/*文章图片*/
	.img-style-1 {
		display: block;
		width: 100%;
		max-height: 600rpx;
		border-radius: 5px;
	}

	.img-style-2 {
		display: flex;
	}

	.img-style-2 image {
		margin: 5rpx;
		border-radius: 5px;
		width: 100%;
		height: 294rpx;
	}

	.img-style-3 {
		display: flex;
		flex-wrap: wrap;
	}

	.img-style-3 image {
		width: 31.3%;
		height: 200rpx;
		margin: 1%;
		border-radius: 5px;
	}

	.img-style-4 {
		display: flex;
		flex-wrap: wrap;
	}

	.img-style-4 image {
		width: 48%;
		height: 320rpx;
		margin: 0.5%;
	}

	// 圈子信息
	.topic-info {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		background-color: #F1F3F5;
		margin: 20rpx 0;
		padding: 24rpx;
		border-radius: 12rpx;

		.cover {
			width: 100rpx;
			height: 100rpx;
			margin-right: 20rpx;
		}

		.center {
			flex: 1;

			.count-txt {
				color: #999;
			}
		}

		.right {
			margin-left: 20rpx;
			color: #55aaff;
		}
	}

	// 分享弹窗
	.share-wrap {
		display: flex;
		padding: 30rpx;
		width: 45%;
		margin: 0 auto;

		.share-item-wx {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			&:nth-child(1) {
				margin-right: auto;
			}

			image {
				width: 88rpx;
				height: 88rpx;
			}

			text {
				font-size: 24rpx;
				margin-top: 26rpx;
			}
		}

		.share-item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			&:nth-child(1) {
				margin-right: auto;
			}

			image {
				width: 100rpx;
				height: 100rpx;
			}

			text {
				font-size: 24rpx;
				margin-top: 20rpx;
			}
		}

		.share-item2 {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			&:nth-child(1) {
				margin: auto;
			}

			image {
				width: 94rpx;
				height: 94rpx;
			}

			text {
				font-size: 24rpx;
				margin-top: 20rpx;
			}
		}
	}

	//海报弹窗
	.share-box {
		height: 530px;
		position: relative;

		.images {
			width: 100%;
			height: 100%;
		}

	}

	.footer {
		// position: absolute;
		bottom: 20rpx;
		left: 20rpx;
		right: 20rpx;
	}

	// 投票
	.vote-box {
		background-color: #F5F5F5;
		border-radius: 20rpx;
		padding: 20rpx;
		margin: 20rpx;

		.title {
			font-weight: bold;
		}

		.expire-time {
			font-size: 24rpx;
			margin: 20rpx 0;
		}

		.vote-item {
			font-size: 24rpx;
			font-weight: bold;
			padding: 20rpx;
			border-radius: 20rpx;
			border: 1px solid #999;
			text-align: center;
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.active {
			background-color: #333;
			color: #fff;
		}
	}

	.expire-box {
		background-color: #999;
		color: #fff;
		font-size: 24rpx;
		display: inline-block;
		padding: 0 20rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}

	video {
		width: 100%;
	}

	.post-text {
		white-space: pre-wrap;
	}

	.other-img-flex {
		display: flex;
		align-items: center;
		position: relative;
		margin: 10rpx 0;
		width: 674rpx;

		.wrap-style .show-flex {
			width: 100%;
			height: 100%;
		}
	}

	.two-img {
		justify-content: space-between;
		align-items: center;
	}

	.two-img .wrap-style-1,
	.two-img .wrap-style-2 {
		height: 332rpx;
		width: 332rpx;
	}

	.two-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 0 0 12rpx;
	}

	.two-img .wrap-style-2 .show-flex {
		border-radius: 0 12rpx 12rpx 0;
	}

	.three-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.three-img .wrap-style-1,
	.three-img .wrap-style-2,
	.three-img .wrap-style-3 {
		height: 332rpx;
		width: 332rpx;
	}

	.three-img .wrap-style-1 {
		height: 446rpx;
		width: 674rpx;
		margin-bottom: 10rpx;
	}

	.three-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 12rpx 0 0;
	}

	.three-img .wrap-style-2 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.three-img .wrap-style-3 .show-flex {
		border-radius: 0 0 12rpx 0;
	}

	.four-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.four-img .wrap-style-1,
	.four-img .wrap-style-2,
	.four-img .wrap-style-3,
	.four-img .wrap-style-4 {
		height: 218rpx;
		width: 218rpx;
	}

	.four-img .wrap-style-1 {
		height: 446rpx;
		width: 674rpx;
		margin-bottom: 10rpx;
	}

	.four-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 12rpx 0 0;
	}

	.four-img .wrap-style-2 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.four-img .wrap-style-3 .show-flex {
		border-radius: 0 0 12rpx 0;
	}

	.five-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.five-img .wrap-style-1,
	.five-img .wrap-style-2,
	.five-img .wrap-style-3,
	.five-img .wrap-style-4,
	.five-img .wrap-style-5 {
		height: 332rpx;
		width: 332rpx;
	}

	.five-img .wrap-style-1 {
		height: 446rpx;
		width: 446rpx;
		margin-bottom: 10rpx;
	}

	.five-img .wrap-style-2 {
		height: 218rpx;
		width: 218rpx;
		margin-top: -238rpx;
	}

	.five-img .wrap-style-3 {
		height: 218rpx;
		width: 218rpx;
		position: absolute;
		right: 0;
		top: 228rpx;
	}

	.five-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 0 0 0;
	}

	.five-img .wrap-style-2 .show-flex {
		border-radius: 0 12rpx 0 0;
	}

	.five-img .wrap-style-4 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.five-img .wrap-style-5 .show-flex {
		border-radius: 0 0 12rpx 0;
	}

	.six-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.six-img .wrap-style-1,
	.six-img .wrap-style-2,
	.six-img .wrap-style-3,
	.six-img .wrap-style-4,
	.six-img .wrap-style-5,
	.six-img .wrap-style-6 {
		height: 218rpx;
		width: 218rpx;
	}

	.six-img .wrap-style-1 {
		height: 446rpx;
		width: 446rpx;
		margin-bottom: 10rpx;
	}

	.six-img .wrap-style-2 {
		margin-top: -238rpx;
	}

	.six-img .wrap-style-3 {
		position: absolute;
		right: 0;
		top: 228rpx;
	}

	.six-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 0 0 0;
	}

	.six-img .wrap-style-2 .show-flex {
		border-radius: 0 12rpx 0 0;
	}

	.six-img .wrap-style-4 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.six-img .wrap-style-6 .show-flex {
		border-radius: 0 0 12rpx 0;
	}

	.seven-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.seven-img .wrap-style-1,
	.seven-img .wrap-style-2,
	.seven-img .wrap-style-3,
	.seven-img .wrap-style-4,
	.seven-img .wrap-style-5,
	.seven-img .wrap-style-6,
	.seven-img .wrap-style-7 {
		height: 218rpx;
		width: 218rpx;
		margin-bottom: 10rpx;
	}

	.seven-img .wrap-style-1 {
		height: 446rpx;
		width: 674rpx;
	}

	.seven-img .wrap-style-5,
	.seven-img .wrap-style-6,
	.seven-img .wrap-style-7 {
		margin: 0;
	}

	.seven-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 12rpx 0 0;
	}

	.seven-img .wrap-style-5 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.seven-img .wrap-style-7 .show-flex {
		border-radius: 0 0 12rpx 0;
	}

	.eight-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.eight-img .wrap-style-1,
	.eight-img .wrap-style-2,
	.eight-img .wrap-style-3,
	.eight-img .wrap-style-4,
	.eight-img .wrap-style-5,
	.eight-img .wrap-style-6,
	.eight-img .wrap-style-7,
	.eight-img .wrap-style-8 {
		height: 218rpx;
		width: 218rpx;
		margin-bottom: 10rpx;
	}

	.eight-img .wrap-style-6,
	.eight-img .wrap-style-7,
	.eight-img .wrap-style-8 {
		margin: 0;
	}

	.eight-img .wrap-style-1,
	.eight-img .wrap-style-2 {
		height: 332rpx;
		width: 332rpx;
	}

	.eight-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 0 0 0;
	}

	.eight-img .wrap-style-2 .show-flex {
		border-radius: 0 12rpx 0 0;
	}

	.eight-img .wrap-style-6 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.eight-img .wrap-style-8 .show-flex {
		border-radius: 0 0 12rpx 0;
	}

	.nine-img {
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.nine-img .wrap-style-1,
	.nine-img .wrap-style-2,
	.nine-img .wrap-style-3,
	.nine-img .wrap-style-4,
	.nine-img .wrap-style-5,
	.nine-img .wrap-style-6,
	.nine-img .wrap-style-7,
	.nine-img .wrap-style-8,
	.nine-img .wrap-style-9 {
		height: 218rpx;
		width: 218rpx;
		margin-bottom: 10rpx;
	}

	.nine-img .wrap-style-7,
	.nine-img .wrap-style-8,
	.nine-img .wrap-style-9 {
		margin: 0;
	}

	.nine-img .wrap-style-1 .show-flex {
		border-radius: 12rpx 0 0 0;
	}

	.nine-img .wrap-style-3 .show-flex {
		border-radius: 0 12rpx 0 0;
	}

	.nine-img .wrap-style-7 .show-flex {
		border-radius: 0 0 0 12rpx;
	}

	.nine-img .wrap-style-9 .show-flex {
		border-radius: 0 0 12rpx 0;
	}



	.detail-comment {
		height: 80vh;

		.head {
			display: flex;
			justify-content: space-between;
			padding: $gap;
			font-size: 36rpx;
			font-weight: bold;
		}

		.original-comment {
			padding: 0 20rpx;
		}

		.children-comments {
			padding: 0 20rpx;
		}
	}
</style>