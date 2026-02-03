<template>
	<view class="wrap">
		<view style="position: absolute;">
			<u-navbar :custom-back="onBack" back-icon-color="#fff" :background="background" :border-bottom="false">
			</u-navbar>
		</view>
		<view class="head">
			<image mode="aspectFill" class="bg" :src="topicInfo.bgImage"></image>
		</view>
		<view class="body">
			<view class="head-c">
				<text class="name">{{ topicInfo.topicName }}</text>
				<view class="count">
					<text>{{ topicInfo.userCount | numberFormat }}人已加入</text>
					<text>{{ topicInfo.postCount | numberFormat }}篇内容</text>
				</view>
				<view>
					<block v-if="topicInfo.isJoin">
						<u-button class="mg-left-auth" @click="showShare = true" :custom-style="btnStyle">
							<u-icon size="25rpx" name="share"></u-icon>
							<text style="font-size: 25rpx;">分享</text>
						</u-button>
					</block>
					<block v-else>
						<u-button class="mg-left-auth" :custom-style="btnStyle" @click="joinTopic">
							<text style="font-size: 25rpx;">加入圈子</text>
						</u-button>
					</block>
				</view>
			</view>
			<!-- 简介 -->
			<navigator class="member-wrap" :url="'/pages/topic/topic-user?id=' + topicId">
				<view class="member-wrap-head">
					<text class="notice-txt u-line-1">{{ topicInfo.description | replace }}</text>
					<u-icon class="icon" name="arrow-right" style="font-size: 20rpx;margin-top: 20rpx;margin-bottom: 20rpx;"></u-icon>
				</view>
			</navigator>
			<!-- 私密圈子不可见 -->
			<view v-if="!topicInfo.isJoin && topicInfo.isPrivacy==1">
				<u-empty margin-top="100" text="私密圈子加入后才能浏览帖子~" mode="permission"></u-empty>
			</view>
			<!-- 进圈用户或公开圈子可见 -->
			<view v-else>
				<!-- 私密圈子提醒 -->
				<u-notice-bar v-if="!closePrivacy && topicInfo.isPrivacy==1"  type="none" mode="vertical" :close-icon="true" :list="privacyTip" @close="closePrivacyNotice"></u-notice-bar>
				<!-- 置顶 -->
				<view class="post-top-box">
					<navigator @longpress="onTopDel(item, index)" class="post-item"
						:url="'/pages/post/detail?id=' + item.id" v-for="(item, index) in topicInfo.topPost" :key="index">
						<view class="tag">置顶</view>
						<view class="title">{{ item.title || item.content.substring(0, 15) }}</view>
					</navigator>
				</view>
				<!-- 圈话题 -->
				<view class="member-wrap" v-if="topicInfo.discussList.length > 0">
					<view class="member-wrap-head">
						<text style="font-size: 30rpx;font-weight: 600;">圈内话题</text>
						<navigator :url="'../discuss/list?topicId=' + topicId" class="user-num" hover-class="none">
							<text style="font-size: 26rpx;font-weight: 400;color: #999999;">查看更多</text>
						</navigator>
					</view>
					<scroll-view :scroll-x="true" style="height: 130rpx;">
						<view class="dis-wrap">
							<navigator :url="'/pages/discuss/detail?id=' + item.id" class="d-item"
								v-for="(item, index) in topicInfo.discussList" :key="item.id">
								<view class="u-line-2">#{{ item.title.substring(0, 10) }}</view>
							</navigator>
						</view>
					</scroll-view>
				</view>
				<!-- 用户列表滚动 -->
				<topic-user-scroll :users="topicInfo.userList" :topicId="topicInfo.id"></topic-user-scroll>
				<!-- 分类tab -->
				<view class="tabs-box">
					<view class="tab-left">
						<u-tabs :list="tabList" :is-scroll="false" :current="current" @change="tabsChange"></u-tabs>
					</view>
				</view>
				<view v-show="current == 0">
					<post-list :showTopic="false" :handle="true" :uid="topicInfo.uid" :list="postNews"
						:loadStatus="loadStatus" :admin="topicInfo.isAdmin"></post-list>
				</view>
				<view v-show="current == 1">
					<post-list :showTopic="false" :handle="true" :uid="topicInfo.uid" :list="postHot"
						:loadStatus="loadStatus" :admin="topicInfo.isAdmin"></post-list>
				</view>
				<view v-show="current == 2">
					<post-list :showTopic="false" :handle="true" :uid="topicInfo.uid" :list="postType12"
						:loadStatus="loadStatus" :admin="topicInfo.isAdmin"></post-list>
				</view>
				<view v-show="current == 3">
					<post-list :showTopic="false" :handle="true" :uid="topicInfo.uid" :list="postType4"
						:loadStatus="loadStatus" :admin="topicInfo.isAdmin"></post-list>
				</view>
				<view v-show="current == 4">
					<post-list :showTopic="false" :handle="true" :uid="topicInfo.uid" :list="postType3"
						:loadStatus="loadStatus" :admin="topicInfo.isAdmin"></post-list>
				</view>
						
			</view>
			
		</view>
		<!-- 底部菜单 -->
		<view class="tabbar">
			<view @click="showPopupChange" class="tab-item mid-button">
				<u-icon name="plus" size="50"></u-icon>
			</view>
		</view>
		<!-- 菜单弹框 -->
		<lf-popup v-model="showMenu">
			<view class="popup-head">
				<text>菜单</text>
				<u-icon @click="showMenu = false" size="40" class="close" color="#999" name="close"></u-icon>
			</view>
			<u-grid :col="4" :border="false">
				<!-- 如果是圈主或管理员 -->
				<block v-if="topicInfo.uid == sessionUser.uid || topicInfo.isAdmin">
					<u-grid-item @click="jumpMenu('/pages/discuss/add?topicId=' + topicId)">
						<image class="menu-icon" src="../static/add-dis.png"></image>
						<view class="grid-text">新建话题</view>
					</u-grid-item>
					<u-grid-item @click="jumpMenu('/pages/topic/info-edit?topicId=' + topicId)">
						<image class="menu-icon" src="../static/topic.png"></image>
						<view class="grid-text">圈子编辑</view>
					</u-grid-item>
					<u-grid-item @click="jumpMenu('/subpages/content/member-management/member-management?type=0&id=' + topicId)">
						<image class="menu-icon" src="../static/topic-user.png"></image>
						<view class="grid-text">成员管理</view>
					</u-grid-item>
					<u-grid-item @click="jumpMenu('/subpages/content/member-management/member-management?type=1&id=' + topicId)">
						<image class="menu-icon" src="../static/block.png"></image>
						<view class="grid-text">黑名单管理</view>
					</u-grid-item>
					<u-grid-item @click="jumpMenu('/subpages/content/apply-list/apply-list?types=0&id=' + topicId)">
						<image class="menu-icon" src="../static/check.png"></image>
						<view class="grid-text">进圈审核</view>
					</u-grid-item>
					<!-- 如果是圈主 -->
					<block v-if="topicInfo.uid == sessionUser.uid">
						<u-grid-item @click="jumpMenu('/pages/topic/admin?id=' + topicId)">
							<image class="menu-icon" src="../static/admin.png"></image>
							<view class="grid-text">管理员</view>
						</u-grid-item>
						<u-grid-item @click="giveTopic()">
							<image class="menu-icon" src="../static/give-topic.png"></image>
							<view class="grid-text">转让圈子</view>
						</u-grid-item>
						<u-grid-item @click="delTopicModel = true">
							<image class="menu-icon" src="../static/jiesan.png"></image>
							<view class="grid-text">解散圈子</view>
						</u-grid-item>
					</block>
				</block>
				<!-- 普通成员 -->
				<block v-else>
					<u-grid-item @click="outTopic">
						<image class="menu-icon" src="../static/jiesan.png"></image>
						<view class="grid-text">退出圈子</view>
					</u-grid-item>
				</block>
			</u-grid>
		</lf-popup>
		<!-- 加入圈子弹窗 -->
		<u-modal v-model="joinTopicModel" :show-cancel-button="true" confirm-text="加入圈子"
			:content="'是否加入【' + topicInfo.topicName + '】?'" @confirm="joinTopic"></u-modal>
		<!-- 解散圈子弹窗 -->
		<u-modal v-model="delTopicModel" :show-cancel-button="true" confirm-color="red" confirm-text="确认"
			:content="'解散【' + topicInfo.topicName + '】后，将不可恢复，是否确认解散？'" @confirm="topicDel"></u-modal>
		<!-- 选择分享弹窗 -->
		<u-popup v-model="showShare" mode="center" border-radius="20" width="80%">

			<view class="share-type">
				<!-- #ifdef MP -->
				<button open-type="share" class="type-item u-reset-button">
					<u-icon class="icon" name="weixin-fill" color="#00b33c"></u-icon>
					<text>发给微信好友</text>
				</button>
				<!-- #endif -->
				<!-- #ifdef MP-WEIXIN || H5 -->
				<view class="type-item" @click="shareCanvas">
					<u-icon class="icon" name="photo" color="#aaaaff"></u-icon>
					<text>生成分享海报</text>
				</view>
				<!-- #endif -->
				<!-- #ifdef H5 || APP-PLUS -->
				<view class="type-item" @click="copyPageUrl">
					<u-icon class="icon" name="cut" color="#0099ff"></u-icon>
					<text>复制链接</text>
				</view>
				<!-- #endif -->

			</view>
		</u-popup>

		<!-- 分享海报弹窗-->
		<u-popup v-model="showCanvas" mode="center" width="80%">
			<view class="share-box">
				<image :src="posterUrl" class="images"></image>
			</view>
			<view class="footer">
				<u-button :custom-style="shareBtnStyle" @click="saveImg" type="success" shape="circle">保存分享</u-button>
			</view>
		</u-popup>
		<!-- 操作按钮弹窗 -->
		<lf-popup v-model="showPopup">
			<view class="handle-wrap">
				<view @click="handleJump(item)" class="item" v-for="(item,index) in popup" :key="index">
					<image mode="widthFix" class="icon" :src="item.icon"></image>
					<text class="txt">{{item.text}}</text>
				</view>
			</view>
		</lf-popup>
		<!-- 发布弹窗 -->
		<u-popup v-model="showPlusPost" mode="center" border-radius="20" width="80%">
			<view class="share-type">
				<view @click="onTrigger(1)" class="type-item">
					<u-icon class="icon" size="40" name="photo" color="#aaaaff"></u-icon>
					<text>发布帖子</text>
				</view>
				<view @click="onTrigger(2)" class="type-item" v-if="isOpen==1">
					<u-icon class="icon" size="40" name="play-circle-fill" color="#aa55ff"></u-icon>
					<text>发布视频</text>
				</view>
				<view @click="onTrigger(4)" class="type-item">
					<u-icon class="icon" size="36" name="order" color="#e34b00"></u-icon>
					<text>发布长文</text>
				</view>
				<view @click="onTrigger(3)" class="type-item">
					<image class="icon" src="../static/h_1.png"></image>
					<text>发布投票</text>
				</view>
				
			</view>
		</u-popup>
		<view style="height: 200rpx;"></view>
		<!-- 返回顶部 -->
		<lf-back-top :show-tag="showTag"></lf-back-top>
		<!-- 自定义加载 -->
		<toast  color="#fff" type="round"></toast>
	</view>
</template>

<script>
	import postList from '@/components/post-list/post-list.vue';
	import disList from '@/components/discuss-list/discuss-list.vue';
	import userList from '@/components/user-list/user-list.vue';
	import topicUserScroll from '@/components/topic-user-scroll/topic-user-scroll.vue';
	export default {
		components: {
			postList,
			disList,
			userList,
			topicUserScroll
		},
		data() {
			return {
				customStyle: {
					height: '40rpx',
					width: '120rpx'
				},
				isOpen: getApp().globalData.isOpen,
				showPlusPost: false,
				showCanvas: false,
				showShare: false,
				joinTopicModel: false,
				delTopicModel: false,
				showMenu: false,
				showPopup: false,
				showTag: false,
				current: 0,
				tabList: [{
						name: '最新'
					},
					{
						name: '最热'
					},
					{
						name: '图文'
					},
					{
						name: '投票'
					},
					{
						name: '长文'
					}
				],
				btnStyle: {
					marginRight: 0,
					width: '150rpx',
					fontSize: '20rpx',
					height: '60rpx',
					lineHeight: '60rpx',
					backgroundColor: '#333',
					color: '#fff'
				},
				shareBtnStyle: {
					backgroundColor: '#333'
				},
				topicId: 0,
				topicInfo: {
					memberList: [],
					discussList: [],
					description: '',
					userInfo: {
						username: ''
					}
				},
				postHot: [],
				postNews: [],
				postType12: [],
				postType3: [],
				postType4: [],
				loadStatus: 'loading',
				page1: 1,
				page2: 1,
				page3: 1,
				page4: 1,
				page5: 1,
				background: {
					backgroundColor: 'unset'
				},
				sessionUser: uni.getStorageSync('userInfo'),
				popup: [{
						icon: '../static/images/topic-menu.png',
						text: '菜单',
						url: 'menu'
					},
					{
						icon: '../static/images/topic-post.png',
						text: '发布',
						url: 'release'
					}
				],
				posterUrl: "",
				privacyTip: ['当前圈子为私密圈子,请遵守平台规定哦'],
				closePrivacy: false,
				isTopicAdmin: false,//当前访问用户是否为圈子管理员
				applyInfoNum:0,//待管理员审核消息数量
			};
		},
		onLoad(options) {
			this.topicId = options.id;

			if (options.scene) {
				this.topicId = options.scene;
			}

			this.getTopicInfo();
			
		},
		onReachBottom() {
			if (this.current == 0) {
				this.page1++;
			}else if (this.current == 1) {
				this.page2++;
			}else if (this.current == 2) {
				this.page3++;
			}else if (this.current == 3) {
				this.page4++;
			}else if (this.current == 4) {
				this.page5++;
			}
			this.getPostList();
		},
		onPageScroll: function onPageScroll(e) {
			if (e.scrollTop > 750) {
				this.showTag = true
			} else {
				this.showTag = false
			}
		},
		onPullDownRefresh() {
			if (this.current == 0) {
				this.page1 = 1;
				this.postNews = [];
			}else if (this.current == 1) {
				this.page2 = 1;
				this.postHot = [];
			}else if (this.current == 2){
				this.page3 = 1;
				this.postType12 = [];
			}else if (this.current == 3){
				this.page4 = 1;
				this.postType4 = [];
			}else if (this.current == 4){
				this.page5 = 1;
				this.postType3 = [];
			}

			this.getTopicInfo();
			uni.stopPullDownRefresh();
		},
		onShareAppMessage(res) {
			if (res.from === 'button') {
				// 来自页面内分享按钮
				console.log(res.target);
			}
			return {
				title: this.topicInfo.topicName + '-' + this.topicInfo.description,
				path: '/pages/topic/detail?id=' + this.topicId,
				imageUrl: this.topicInfo.bgImage
			};
		},
		onShareTimeline() {
			return {
				title: this.topicInfo.topicName + '-' + this.topicInfo.description,
				imageUrl: this.topicInfo.bgImage,
				query: 'id=' + this.topicId
			};
		},
		filters: {
			substr: function(e) {
				return e.substr(0, 5);
			},
			replace(str) {
				str = str.replace(/\n/g, '');
				return str;
			}
		},
		methods: {
			showPopupChange() {
				this.showPopup = !this.showPopup
			},
			onTopDel(e, index) {
				if(this.topicInfo.uid != this.sessionUser.uid){
					return
				}
				let that = this;
				uni.showModal({
					title: '提示',
					content: '是否解除置顶?',
					success: function(res) {
						if (res.confirm) {
							that.$H
								.post('post/topPostDel', {
									postId: e.id,
									topicId: e.topicId
								})
								.then(res => {
									if (res.code == 0) {
										that.topicInfo.topPost.splice(index, 1);
									}
								});
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			copyPageUrl() {
				let that = this;
				uni.setClipboardData({
					data: this.$c.shareH5Url + 'pages/topic/detail?id=' + this.topicId,
					success: function() {
						uni.hideToast();
						that.$f.toast('复制成功', 'success');
						that.showShare = false;
					}
				});
			},
			onMenu() {
				if (this.topicInfo.isJoin) {
					this.showMenu = true;
				} else {
					this.joinTopicModel = true;
				}
			},
			onPlus() {
				if (this.topicInfo.isJoin) {
					this.showPlusPost = true;
				} else {
					this.joinTopicModel = true;
				}
			},
			handleJump(e) {
				this.showPopup = false;
				if (e.url == 'menu') {
					if (this.topicInfo.isJoin) {
						this.showMenu = true;
					} else {
						this.joinTopicModel = true;
					}
				} else if (e.url == 'release') {
					if (this.topicInfo.isJoin) {
						this.showPlusPost = true;
					} else {
						this.joinTopicModel = true;
					}
				}
			},
			closePrivacyNotice(){
				this.closePrivacy=true
			},

			shareCanvas() {
				this.showShare = false;
				this.showCanvas = true;
				uni.showLoading({
					mask: true,
					title: '正在生成海报'
				});
				// #ifdef H5
				let origin = "h5";
				let url = this.$c.shareH5Url + "pages/topic/detail?id=" + this.topicId
				// #endif
				// #ifdef MP-WEIXIN
				let origin = "weixin";
				let url = "pages/topic/detail?id=" + this.topicId
				// #endif

				this.$H
					.get('topic/qrCode', {
						topicId: this.topicId,
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
			// 解散圈子
			topicDel() {
				uni.showLoading({
					mask: true,
					title: '操作中'
				});
				this.$H
					.get('topic/topicDel', {
						id: this.topicId
					})
					.then(res => {
						if (res.code == 200 || res.code == 0) {
							this.$u.toast('该圈子已成功解散');

							setTimeout(function() {
								uni.switchTab({
									url: '/pages/index/index'
								});
							}, 1500);
						}
						uni.hideLoading();
					});
			},
			jumpUser() {
				uni.navigateTo({
					url: '/pages/topic/topic-user?id=' + this.topicId
				});
			},
			onBack() {
				let pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack();
				} else {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}
			},
			tabsChange(index) {
				this.current = index;
				if (index == 1 && this.postHot.length == 0) {
					this.getPostList();
				}else if(index == 2 && this.postType12.length == 0){
					this.getPostList();
				}else if(index == 3 && this.postType4.length == 0){
					this.getPostList();
				}else if(index == 4 && this.postType3.length == 0){
					this.getPostList();
				}
			},
			onTrigger(type) {
				if (!this.topicInfo.isJoin) {
					this.joinTopicModel = true;
					return;
				}

				this.showPlusPost = false;
				if (type == 3) {
					uni.navigateTo({
						url: '/pages/vote/vote?topicId=' + this.topicId
					});
				} else if(type == 4){
					uni.navigateTo({
						url: '/subpages/content/article/add?topicId=' + this.topicId
					});
				}else{
					uni.navigateTo({
						url: '/pages/post/add?topicId=' + this.topicId + '&topicName=' + this.topicInfo.topicName +
							'&type=' + type
					});
				}
			},
			jump(uid) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + uid
				});
			},
			joinTopic() {
				var that = this
				this.$H
					.get('topic/joinTopic', {
						id: this.topicId
					})
					.then(res => {
						if (res.code === 0) {
							if(res.result==1){
								uni.showModal({
									title: '提示',
									content: '圈主开启了进圈验证，请先回答圈主设置的问题',
									showCancel: false,
									success: function (res) {
										if (res.confirm) {
											uni.navigateTo({
												url:"/subpages/content/topic-apply/topic-apply?id="+that.topicId
											})
										}
									}
								});
							}else if(res.result==2){
								uni.showModal({
									title: '提示',
									content: '你已提交审核，请耐心等待管理员审核',
									showCancel: false,
									success: function (res) {
										if (res.confirm) {
											
										}
									}
								});
							}else{
								this.topicInfo.isJoin = true;
								this.joinTopicModel = false;
							}
							
						}
					});
			},
			outTopic() {
				this.$H
					.get('topic/userTopicDel', {
						id: this.topicId
					})
					.then(res => {
						if (res.code === 0) {
							this.topicInfo.isJoin = false;
							this.showMenu = false;
						}
					});
			},
			getTopicInfo() {
				this.$loading(true);
				this.$H
					.get('topic/detail', {
						id: this.topicId
					})
					.then(res => {
						if (res.code == 500) {
							this.$u.toast(res.msg);
							setTimeout(function() {
								uni.switchTab({
									url: '/pages/square/square'
								});
							}, 1500);
						}
						this.topicInfo = res.result;
						this.$loading(false);
						this.getPostList();
						this.isTopicAdmin = res.result.isAdmin;
						this.checkTopicApplyByAdmin();
					});
			},
			checkTopicApplyByAdmin(){
				var that = this
				if(this.isTopicAdmin){
					//如果当前用户为圈子管理员，那么需要查询是否有管理员待处理的申请消息
					this.$H
						.get('topic/checkTopicApplyByAdmin', {
							topicId: this.topicId
						})
						.then(res => {
							if (res.code === 0) {
								this.applyInfoNum = res.result
								if(this.applyInfoNum>0){
									uni.showModal({
										title: '平台提醒',
										content: '您有'+this.applyInfoNum+'条进圈申请待审核',
										confirmText: '去处理',
										cancelText: '稍后处理',
										success: function (res) {
											if (res.confirm) {
												uni.navigateTo({
													url: '/subpages/content/apply-list/apply-list?types=0&id=' + that.topicId
												});
											} else if (res.cancel) {
												
											}
										}
									});

								}
								
							}
						});
				}
			},
			jumpMenu(url) {
				this.showMenu = false;
				uni.navigateTo({
					url: url
				});
			},
			getPostList() {
				if(!this.topicInfo.isJoin && this.topicInfo.isPrivacy==1){
					return;
				}
				this.loadStatus = 'loading';
				let page = this.page1;
				let order = 'id desc';

				if (this.current == 1) {
					page = this.page2;
					order = 'read_count desc';
				}else if(this.current == 2){
					page = this.page3;
					order = '12';
				}else if(this.current == 3){
					page = this.page4;
					order = '4';
				}else if(this.current == 4){
					page = this.page5;
					order = '3';
				}

				this.$H
					.post('post/getListByTopicId', {
						topicId: this.topicId,
						page: page,
						order: order
					})
					.then(res => {
						if (this.current == 0) {
							this.postNews = this.postNews.concat(res.result.data);
						}else if (this.current == 1) {
							this.postHot = this.postHot.concat(res.result.data);
						}else if (this.current == 2){
							this.postType12 = this.postType12.concat(res.result.data);
						}else if (this.current == 3){
							this.postType4 = this.postType4.concat(res.result.data);
						}else if (this.current == 4){
							this.postType3 = this.postType3.concat(res.result.data);
						}

						if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
							this.loadStatus = 'nomore';
						} else {
							this.loadStatus = 'loadmore';
						}
					});
			},
			giveTopic(){
				uni.navigateTo({
					url:'/pages/topic/admin?type=1&id='+this.topicId
				})
			},
		}
	};
</script>

<style>
	page {
		background-color: #f5f5f5;
	}
</style>
<style lang="scss" scoped>
	.wrap {
		height: calc(100vh);
	}

	.mg-left-auth {
		// margin-left: 10rpx;
	}

	.mg-left-20 {
		margin-left: 20rpx;
	}

	.tabs-box {
		background-color: #FFFFFF;
		margin-top: 20rpx;

		.tab-left {
			width: 90%;
		}
	}

	.notice-txt {
		color: #999;
		font-size: 12px;
		margin-top: 20rpx;
		margin-bottom: 20rpx;
	}

	.grid-text {
		font-size: 12px;
		color: #616161;
		margin-bottom: 30rpx;
	}

	.head {
		position: relative;
		height: 260rpx;
	}

	.body {
		position: absolute;
		top: 250rpx;
		left: 0;
		width: 750rpx;
		border-top-left-radius: 30rpx;
		border-top-right-radius: 30rpx;
		overflow: hidden;
	}

	.head-c {
		background-color: #FFFFFF;
		width: 100%;
		display: flex;
		padding: 30rpx;
		padding-right: 0;
	}

	.head-c .count {
		font-size: 10px;
		display: flex;
		align-items: center;
		margin-right: 20rpx	;
	}

	.head-c .count text {
		margin: 0 5rpx;
		color: #8a8989;
	}

	.head-c .name {
		font-size: 20px;
		font-weight: bold;
		width: 250rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.margin-left {
		margin-left: auto;
		margin-right: 20rpx;
	}

	.head .bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* 管理员 */
	.member-wrap {
		margin-top: -25rpx;
		padding: 0 30rpx 15rpx;
		background-color: #fff;
		border-bottom: 1px solid #eee;
	}

	.member-wrap .avatar {
		margin-bottom: 10rpx;
	}

	.member-wrap .member-wrap-head {
		display: flex;
		
		.tag {
			width: 70rpx;
			height: 42rpx;
			font-size: 20rpx;
			text-align: center;
			border-radius: 10rpx;
			border: .5px solid #dddddd;
			margin-right: 15rpx;
			margin-top: 20rpx;
			margin-bottom: 20rpx;
		}
		.user-num {
			margin-left: auto;
			color: #999;
		}

		.icon {
			margin-left: auto;
			color: #999;
		}
	}

	// 置顶
	.post-top-box {
		background-color: #fff;
		padding: 10rpx 20rpx 40rpx;
		margin-bottom: 20rpx;
		.post-item {
			display: flex;
			align-items: center;
			padding: 6rpx;
			font-size: 28rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.tag {
				background-color: #e50000;
				color: #fff;
				padding: 0 10rpx;
				border-radius: 10rpx;
				font-size: 20rpx;
				height: 40rpx;
				line-height: 40rpx;
				margin-right: 20rpx;
			}
		}
	}

	// 圈话题
	.dis-wrap {
		display: flex;
		margin-top: 20rpx;

		.d-item {
			flex-grow: 0;
			flex-shrink: 0;
			// width: 330rpx;
			background-color: #F5F5F5;
			border-radius: 10rpx;
			padding: 20rpx;
			font-size: 28rpx;
			font-weight: 800;
			margin-right: 20rpx;
		}
	}

	.handle-wrap {
		display: flex;
		padding: 50rpx 0;

		.item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			flex: 1;
			padding: 20rpx 0;
			border-radius: 20rpx;

			.icon {
				width: 100rpx;
				margin-bottom: 20rpx;
			}

			.txt {
				font-size: 28rpx;
			}
		}
	}

	.handle-close {
		display: flex;
		justify-content: center;
		margin-bottom: 50rpx;
	}

	// 菜单
	.tabbar {
		position: fixed;
		bottom: 50rpx;
		// width: 30%;
		margin-left: 42%;
		margin-right: 15%;
		background-color: #dde1e5;
		display: flex;
		padding: 10rpx;
		box-shadow: 0 0 45rpx #413f3d;
		font-size: 24rpx;
		border-radius: 100rpx;
		z-index: 9999;

		.tab-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin: 0 auto;

			.icon {
				margin-top: 10rpx;
				width: 40rpx;
				height: 40rpx;
			}
		}

		.mid-button {
			background-color: #333;
			width: 90rpx;
			height: 90rpx;
			border-radius: 50%;
			color: #fff;
		}
	}

	// 菜单弹窗
	.popup-head {
		text-align: center;
		font-size: 24rpx;
		position: relative;
		padding: 30rpx;
		border-bottom: 1px solid #F5F5F5;
		margin-bottom: 30rpx;

		.close {
			position: absolute;
			right: 30rpx;
			top: 30rpx;
		}
	}

	.menu-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 10rpx;
	}

	.share-type {
		padding: 50rpx 30rpx;

		.type-item {
			background-color: #F5F5F5;
			padding: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			.icon {
				width: 40rpx;
				height: 40rpx;
				margin-right: 20rpx;
			}

			&:nth-child(2) {
				margin: 20rpx 0;
			}
			&:nth-child(3) {
				margin: 20rpx 0;
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
</style>
