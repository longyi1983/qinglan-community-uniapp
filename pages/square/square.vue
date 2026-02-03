<template>
	<view>
		<u-navbar :is-back="false" :border-bottom="false" :background="background">
			<u-icon name="search" :size="40" class="search-wrap" @click="toSearch"></u-icon>
			<u-tabs :list="pageTab" :current="pageCurrent" @change="pageTabChange" bg-color=""></u-tabs>
		</u-navbar>
		<!-- 轮播图 -->
		<view class="swiper-box">
			<u-swiper @click="onSwiper" :list="swiperList" name="img" border-radius="20" mode="rect"
				indicator-pos="bottomRight"></u-swiper>
		</view>
		<!-- 热榜 -->
		<view v-if="pageCurrent == 0">
			<!-- 公告 -->
			<view v-if="showNotice">
				<u-notice-bar :list="noticeContent" type="none"></u-notice-bar>
			</view>
			<!-- 圈子推荐 -->
			<topic-recommend v-if="topicHotList.length" :items="topicHotList"></topic-recommend>
			<!-- 热门话题 -->
			<discuss-recommend v-if="discussList.length>0" :list="discussList"></discuss-recommend>
			<!-- 热门用户推荐 -->
			<user-recommend v-if="hotUserList.length>0" type="scroll" :users="hotUserList" @follow="follow" @cancelFollow="cancelFollow"></user-recommend>
			
			<!-- tabs -->
			<u-tabs :list="classList" name="cateName" :current="current" @change="tabChange"></u-tabs>
			<!-- 圈子列表 -->
			<navigator class="topic-wrap" hover-class="none" :url="'/pages/topic/detail?id=' + item.id"
				v-for="(item, index) in topicList" :key="index">
				<view class="info-wrap">
					<image class="cover-img" mode="aspectFill" :src="item.coverImage"></image>
					<view class="right">
						<view class="name">{{ item.topicName }}</view>
						<view class="count-wrap">
							<text>{{ item.userNum | numberFormat}}人加入</text>
							<text>{{ item.postNum | numberFormat}}条动态</text>
						</view>
					</view>
				</view>
				<view class="post-img-wrap" v-if="item.imgList.length > 0">
					<image mode="aspectFill" v-for="(item2, index2) in item.imgList" :key="index2" :src="item2"></image>
				</view>
			</navigator>
			<!-- 加载状态 -->
			<block v-if="topicList.length === 0 && loadStatus == 'nomore'">
				<u-empty margin-top="100" text="暂无内容" mode="favor"></u-empty>
			</block>
			<block v-else>
				<view style="margin: 30rpx 0;">
					<u-loadmore :status="loadStatus" />
				</view>
			</block>
		</view>
		<view v-if="pageCurrent == 1">
			<!-- 导航区 -->
			<nav-pane :content="navContent" v-if="navContent.length>0"></nav-pane>
			<!-- 帖子热榜 -->
			<post-recommend title="热门贴" desc="热帖推荐" :hotPost="hotPost"></post-recommend>

		</view>
		<!-- tabbar -->
		<lf-tabbar :active="1" :count="messegeNum"></lf-tabbar>
		<!-- 自定义加载 -->
		<toast iconBg="#aaaaff" color="#fff"></toast>
	</view>
</template>

<script>
	import topicRecommend from "@/components/topic-recommend/topic-recommend.vue";
	import userRecommend from "@/components/user-recommend/user-recommend.vue";
	import discussRecommend from "@/components/discuss-recommend/discuss-recommend.vue";
	import postRecommend from "@/components/post-recommend/post-recommend.vue";
	import navPane from "@/components/nav-pane/nav-pane.vue";
	import {mapGetters} from 'vuex';
	export default {
		data() {
			return {
				page: 1,
				classList: [{
					cateId: '',
					cateName: '最热'
				}],
				classId: '',
				topicList: [],
				loadStatus: 'loadmore',
				current: 0,
				topDisList: [],
				swiperList: [],
				topicHotList: [],
				noticeContent: [],
				showNotice:false,
				hotUserList: [],
				discussList: [],
				pageTab: [{
						name: '推荐'
					},
					{
						name: '热榜'
					}
				],
				pageCurrent: 0,
				hotList: [],
				hotPost: [],
				navContent: [],
				background: {
					backgroundImage: 'linear-gradient(45deg, rgb(210,227,235), rgb(173, 173, 220))'
				},
				iosClose: '',
				isIphone: getApp().globalData.iphone
			};
		},
		components: {
			topicRecommend,
			userRecommend,
			discussRecommend,
			postRecommend,
			navPane
		},
		computed: {
			...mapGetters(['messegeNum'])
		},
		onLoad() {
			this.$loading(true);
			this.getNotice();
			this.getClassList();
			this.getLinkList();
			this.getDiscussList();
			this.getHotUserList();
			this.getHotTopic();
			this.getTopicList();
			this.getHotPost();
			this.getSysInfo();
			
			// 监听关注/取消关注事件
			uni.$on('updateIsFollow', (data) => {
				// 更新热门用户列表中的关注状态
				this.hotUserList.forEach((user, index) => {
					if (user.uid === data.uid) {
						this.hotUserList[index].isFollow = data.isFollow;
						console.log('square页面收到事件: updateIsFollow', data);
					}
				});
			});
		},
		onShow() {
			this.getMsgNum();
		},
		onUnload() {
			// 页面卸载时，取消事件监听，防止内存泄漏
			uni.$off('updateIsFollow');
		},
		onReachBottom() {
			this.page++;
			this.getTopicList();
		},
		onPullDownRefresh() {
			this.getLinkList();
			this.getHotTopic();
			this.getClassList();
			// this.getNotice();
			this.getDiscussList();
			this.page = 1;
			this.topicList = [];
			this.getTopicList();
			this.getHotUserList();
			uni.stopPullDownRefresh();
		},
		methods: {
			follow(id,index){
				this.$H
					.post('user/addFollow', {
						id: id
					})
					.then(res => {
						if (res.code == 0) {
							
							this.hotUserList[index].isFollow = true;
							this.$f.toast('关注成功');
							// 发送关注状态改变事件
							uni.$emit('updateIsFollow', {
								uid: id,
								isFollow: true
							});
							console.log('事件发送: updateIsFollow', {uid: id, isFollow: true});
						}
					});
			},
			cancelFollow(id,index){
				this.$H
					.post('user/cancelFollow', {
						id: id
					})
					.then(res => {
						if (res.code == 0) {
							this.hotUserList[index].isFollow = false;
							this.$f.toast('取关成功');
							// 发送取消关注状态改变事件
							uni.$emit('updateIsFollow', {
								uid: id,
								isFollow: false
							});
							console.log('事件发送: updateIsFollow', {uid: id, isFollow: false});
						}
					});
			},
			getHotPost() {
				this.$H.get('post/hotPost').then(res => {
					if (res.code == 0) {
						this.hotPost = res.hotPost;
					}
				});
			},
			pageTabChange(index) {
				this.pageCurrent = index
			},
			getDiscussList() {
				
				this.$H.get('discuss/hotDiscussList').then(res => {
					this.discussList = res.result;
				});
			},
			getNotice() {
				this.$H.get('topic/notice').then(res => {
					if(res.code==0){
						this.noticeContent = res.result;
						if(res.result[0]==''){
							this.showNotice=false
						}else{
							this.showNotice=true
						}
					}
					this.$loading(false);
				});
			},
			getHotTopic() {
				this.$H.get('topic/hot').then(res => {
					this.topicHotList = res.result;
				});
			},
			jumpTopic(id) {
				uni.navigateTo({
					url: '/pages/topic/detail?id=' + id
				});
			},
			previewImage(url, urls) {
				uni.previewImage({
					current: url, // 当前显示图片的http链接
					urls: urls // 需要预览的图片http链接列表
				});
			},
			// 获取圈子列表
			getTopicList() {
				this.loadStatus = 'loading';
				this.$H
					.get('topic/classTopicAreImg', {
						classId: this.classId,
						page: this.page
					})
					.then(res => {
						this.topicList = this.topicList.concat(res.result.data);
						if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
							this.loadStatus = 'nomore';
						} else {
							this.loadStatus = 'loadmore';
						}
					});
			},
			// 处理点击轮播图跳转
			onSwiper(index) {
				let link = this.swiperList[index];

				//跳转页面
				if (link.type == 1) {
					// #ifdef MP-WEIXIN
					uni.navigateTo({
						url: '/pages/webview/webview?src=' + link.url
					});
					// #endif

					// #ifdef H5
					window.open(link.url)
					// #endif
					// #ifdef APP-PLUS
					plus.runtime.openURL(link.url)
					// #endif
				}

				//跳转其他小程序
				if (link.type == 2) {
					uni.navigateToMiniProgram({
						appId: link.appid,
						path: link.url
					})
				}

				//跳转小程序页面
				if (link.type == 3) {
					if (link.url == '/pages/index/index' || link.url == '/pages/square/square' || link.url ==
						'/pages/message/message' || link.url == '/pages/my/my') {
						uni.switchTab({
							url: link.url
						})
					} else {
						uni.navigateTo({
							url: link.url
						})
					}
				}

			},
			// 获取轮播图
			getLinkList() {
				this.$H
					.post('link/list', {
						cateId: 0
					})
					.then(res => {
						this.swiperList = res.result;
					});
			},
			getSysInfo() {
				this.$H.get('system/basic').then(res => {
					this.iosClose = res.iosClose;
					this.getNavList();
				});
			},
			// 获取导航区
			getNavList() {
				this.$H
					.post('navigation/getNav')
					.then(res => {
						if (res.code == 0) {
							if(this.isIphone&&this.iosClose=='0'){
								let list = res.result
								const excludedValues = ['/pages/user/vip/vip', '/pages/account/account','/pages/pay/pay'];
								
								this.navContent = list.filter(item => !excludedValues.includes(item.url));
							}else{
								this.navContent = res.result;
							}
						}
					});
			},
			// 获取热门博主
			getHotUserList() {
				this.$H
					.get('user/getHotUserList')
					.then(res => {
						this.hotUserList = res.result;
					});
			},
			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + this.$store.state.totalUnread.notice + res
						.result.allCount
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
				});
			},
			getClassList() {
				let that = this;
				this.$H.get('topic/classList').then(res => {
					let classList = [{
						cateId: '',
						cateName: '最热'
					}];

					this.classList = classList.concat(res.result);
				});
			},
			tabChange(index) {
				this.page = 1;
				this.current = index;
				this.classId = this.classList[index].cateId;
				this.topicList = [];
				this.getTopicList();
			},
			toSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				});
			}
		}
	};
</script>
<style>
	page {
		background-color: #f5f5f5;
	}
</style>
<style lang="scss" scoped>
	.search-wrap {
		margin-left: 20rpx;
		margin-right: 30%;
	}


	.wrap {
		padding: 0 40rpx;
	}

	.swiper-box {
		padding: 10rpx;
	}

	// 热门圈子
	.hot-topic {
		padding: 20rpx;
		display: flex;

		.topic-item {
			margin: 0 20rpx;
			width: 100rpx;

			.cover-box {
				position: relative;

				.cover-img {
					width: 100%;
					height: 100rpx;
					border-radius: 50%;
				}
			}

			.footer {
				font-size: 24rpx;

				.name {
					display: inline-block;
					width: 120rpx;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.user-num {
					color: #999;
				}
			}
		}
	}

	// 块标题
	.block-title {
		font-weight: bold;
		padding: 20rpx;
		color: #616161;
		display: flex;
		font-size: 28rpx;

		.right {
			margin-left: auto;
			color: #999;
			font-size: 24rpx;
			display: flex;
			align-items: center;
		}
	}

	// 帖子
	.topic-wrap {
		background-color: #fff;
		margin: 30rpx;
		padding: 20rpx;
		border-radius: 20rpx;

		.info-wrap {
			display: flex;

			.cover-img {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}

			.right {
				.name {
					font-weight: bold;
				}

				.count-wrap {
					font-size: 24rpx;
					color: #616161;

					text {
						margin-right: 10rpx;
					}
				}
			}
		}

		.post-img-wrap {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-gap: 10rpx;
			margin-top: 20rpx;

			image {
				width: 100%;
				height: 200rpx;
				border-radius: 10rpx;
			}
		}
	}
	

</style>
