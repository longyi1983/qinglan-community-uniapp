<template>
	<view class="index-con" :style="{paddingTop:navbarHeight +'px'}">
		<!-- navbar -->
		<view id="navbar" class="lf-nav" :style="{paddingTop:statusBarHeight +'px'}">
			<view class="lf-all">
				<view class="lf-all-nav" :style="{height: navigationBarHeight+'px'}">
					<view class="navbar-img" @click="refresh()">
						<image :src="shareCover" mode="" class="n-img"></image>
					</view>
					<view class="search-wrap" @click="toSearch">
						<u-search shape="round" height="60" placeholder="搜索帖子/用户/圈子" :show-action="false"></u-search>
					</view>
				</view>
				<view class="lf-tab">
					<view class="lf-tab-con">
						<u-tabs :list="tabList" font-size="28" name="cateName" :current="current" @change="tabChange"
							inactive-color="#949494" bar-height="6" bar-width="20" height="40">
						</u-tabs>
					</view>
					<!-- 筛选按钮 -->
					<view class="lf-filter" v-if="current === 2">
						<index-filter @filterChange="handleFilterChange" />
					</view>
					<view class="lf-vip" v-if="current != 2 && vipShow=='0'&& showVipIcon && iosCheck">
						<image @click="toVipPage()" src="/static/join-vip.png" class="lf-vip-icon"></image>
					</view>
				</view>
			</view>
		</view>
		<view class="lf-top"></view>
		<!-- 最新 -->
		<view v-if="current === 2">
			<post-list v-if="indexStyle1=='0'" :list="lastPost" :loadStatus="loadStatus4" :showTag="true"
				:open="adIsOpen" :openAd="true" :wxAdpid="wxAdpid" :h5Adpid="h5Adpid"></post-list>
			<post-list-twice v-if="indexStyle1=='1'" :dataList="lastPost" :loadStatus="loadStatus4"></post-list-twice>
			<post-list-common v-if="indexStyle1=='2'" :list="lastPost" :loadStatus="loadStatus4" :showTag="true"
				:open="adIsOpen" :openAd="true" :wxAdpid="wxAdpid" :h5Adpid="h5Adpid"></post-list-common>
		</view>
		<!-- 关注 -->
		<view v-if="current === 0">
			<post-list v-if="indexStyle3=='0'" :list="followUserPost" :loadStatus="loadStatus1" :showTag="true"
				:open="adIsOpen" :openAd="true" :wxAdpid="wxAdpid" :h5Adpid="h5Adpid"></post-list>
			<post-list-twice v-if="indexStyle3=='1'" :dataList="followUserPost"
				:loadStatus="loadStatus1"></post-list-twice>
			<post-list-common v-if="indexStyle3=='2'" :list="followUserPost" :loadStatus="loadStatus1" :showTag="true"
				:open="adIsOpen" :openAd="true" :wxAdpid="wxAdpid" :h5Adpid="h5Adpid"></post-list-common>
		</view>
		<view v-if="current === 1">
			<!-- 我的圈子 -->
			<view class="topic-wrap">
				<view class="block-title">
					<view>我加入的圈子</view>
				</view>
				<u-grid @click="jump" :col="5" :border="false">
					<!-- 我的圈子 -->
					<u-grid-item :index="'/pages/topic/detail?id='+item.id" v-for="(item, index) in joinTopicList"
						:key="index">
						<view class="grid-topic">
							<u-image width="120rpx" :border-radius="10" height="120rpx" :src="item.coverImage">
							</u-image>
							<view class="name">{{ item.topicName.substring(0, 5) }}</view>
							<text v-if="sessionUid == item.uid" class="user">圈主</text>
						</view>
					</u-grid-item>
					<!-- 创建圈子 -->
					<u-grid-item index="/pages/topic/add/add">
						<navigator class="grid-topic">
							<u-image width="120rpx" :border-radius="10" height="120rpx" src="/static/add-1.png">
							</u-image>
							<view class="name">创建圈子</view>
						</navigator>
					</u-grid-item>
				</u-grid>
			</view>
			<post-list v-if="indexStyle2=='0'" :list="joinTopicPost" :loadStatus="loadStatus3" :showTag="true"
				:open="adIsOpen" :openAd="true" :wxAdpid="wxAdpid" :h5Adpid="h5Adpid"></post-list>

			<post-list-twice v-if="indexStyle2=='1'" :dataList="joinTopicPost"
				:loadStatus="loadStatus3"></post-list-twice>

			<post-list-common v-if="indexStyle2=='2'" :list="joinTopicPost" :loadStatus="loadStatus3" :showTag="true"
				:open="adIsOpen" :openAd="true" :wxAdpid="wxAdpid" :h5Adpid="h5Adpid"></post-list-common>

		</view>
		<!-- 首页自定义弹框 -->
		<u-mask :show="showNotice">
			<view class="system-pop">
				<view class="pop-title">{{popTitle}}</view>
				<view class="popup-txt">{{popContent}}</view>
				<view class="popup-bot" @click="closePop">
					<button>我知道了</button>
				</view>
			</view>
		</u-mask>
		<!-- tabbar -->
		<lf-tabbar :active="0" :count="messegeNum"></lf-tabbar>
		<!-- 返回顶部 -->
		<lf-back-top :show-tag="showTag"></lf-back-top>
		<!-- 自定义加载 -->
		<toast color="#fff" type="rotate3"></toast>
		<!-- 自定义筛选 -->
		<index-filter @filterChange="handleFilterChange" />
	</view>

</template>
<script>
	import postList from '@/components/post-list/post-list.vue';
	import postListTwice from '@/components/post-list-twice/post-list-twice.vue';
	import postListCommon from '@/components/post-list-common/post-list-common.vue';
	import indexFilter from '@/components/index-filter/index-filter.vue';
	import {
		mapGetters
	} from 'vuex';
	export default {
		components: {
			postList,
			postListTwice,
			postListCommon,
			indexFilter
		},
		data() {
			return {
				$IMG: this.$IMG,
				sessionUid: uni.getStorageSync('userInfo').uid,
				loadStatus1: 'loadmore',
				loadStatus2: 'loadmore',
				loadStatus3: 'loadmore',
				loadStatus4: 'loadmore',
				page: 1,
				page2: 1,
				page3: 1,
				page4: 1,
				shareCover: '',
				topDisList: [],
				swiperList: [],
				followUserPost: [],
				joinTopicPost: [],
				lastPost: [],
				tabList: [{
						name: '关注'
					},
					{
						name: '圈子'
					},
					{
						name: '最新'
					}
				],
				current: 2,
				joinTopicList: [],
				wxText: "点击添加到我的小程序",
				background: {
					backgroundImage: 'linear-gradient(45deg, rgb(210,227,235), rgb(173, 173, 220))'
				},
				h5Adpid: '1818425366',
				wxAdpid: '1872486102',
				adIsOpen: '0',
				navbarHeight: 0,
				navigationBarHeight: 0,
				statusBarHeight: 0,
				indexStyle1: '0',
				indexStyle2: '0',
				indexStyle3: '0',
				vipShow: '0',
				showTag: false,
				popTitle: "",
				popContent: "",
				showNotice: false,
				showVipIcon: true,
				iosCheck: false,
				isIphone: getApp().globalData.iphone,
				filterPost:0,
				typePost:0
			};
		},
		computed: {
			...mapGetters(['messegeNum'])
		},
		onShareAppMessage(res) {
			return {
				title: this.$c.miniappName,
				path: '/pages/index/index',
				imageUrl: this.shareCover
			};
		},
		onLoad() {
			uni.switchTab({
				url: '/main/index/index'
			});
			return;
			this.$loading(true);
			this.navigationBarHeight = getApp().globalData.navigationBarHeight;
			this.statusBarHeight = getApp().globalData.statusBarHeight;
			this.getSysInfo();
			this.getLastPost();
			this.getAdConfig();
			this.getPop();
			if (uni.getStorageSync('hasLogin')) {
				if (uni.getStorageSync('userInfo').vip == 1) {
					this.showVipIcon = false
				}
			}
		},
		onShow() {
			this.getMsgNum();
			this.checkCurrentPage();
		},
		onReachBottom() {
			if (this.current === 0) {
				this.page2++;
				this.getFollowUserPost();
			} else if (this.current === 1) {
				this.page3++;
				this.getJoinTopicPost();
			} else if (this.current === 2) {
				this.page4++;
				this.getLastPost();
			}
		},
		onPullDownRefresh() {
			if (this.current === 0) {
				this.page2 = 1;
				this.followUserPost = [];
				this.getFollowUserPost();
				this.getMsgNum();
			} else if (this.current === 1) {
				this.page3 = 1;
				this.joinTopicPost = [];
				this.getJoinTopicPost();
				this.getUserJoinTopic();
				this.getMsgNum();
			} else if (this.current === 2) {
				this.page4 = 1;
				this.lastPost = [];
				this.getLastPost();
			}
			uni.stopPullDownRefresh();
		},
		onPageScroll: function onPageScroll(e) {
			if (e.scrollTop > 750) {
				this.showTag = true
			} else {
				this.showTag = false
			}
		},

		methods: {
			handleFilterChange(result) {
				// console.log('筛选结果：', result);
				// 根据筛选结果处理数据
				if (result.style) {
					this.indexStyle1 = result.style === 'twice' ? '1' :
						result.style === 'old' ? '2' : '0';
					this.indexStyle2 = result.style === 'twice' ? '1' :
						result.style === 'old' ? '2' : '0';
					this.indexStyle3 = result.style === 'twice' ? '1' :
						result.style === 'old' ? '2' : '0';
				}
				this.typePost=result.type
				this.filterPost=result.filter
				// 刷新数据
				this.refresh();
			},
			refresh() {
				if (this.current === 0) {
					this.page2 = 1;
					this.followUserPost = [];
					this.getFollowUserPost();
					this.getMsgNum();
				} else if (this.current === 1) {
					this.page3 = 1;
					this.joinTopicPost = [];
					this.getJoinTopicPost();
					this.getUserJoinTopic();
					this.getMsgNum();
				} else if (this.current === 2) {
					this.page4 = 1;
					this.lastPost = [];
					this.getLastPost();
				}
			},
			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + this.$store.state.totalUnread.notice + res
						.result.allCount
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
				});
			},
			checkCurrentPage() {
				// 跳转到登录需要刷新页面
				if (this.$f.myCache('lf_login_index')) {
					if (this.current === 0) {
						this.page2 = 1;
						this.followUserPost = [];
						this.getFollowUserPost();
						this.getMsgNum();
					} else if (this.current === 1) {
						this.page3 = 1;
						this.joinTopicPost = [];
						this.getJoinTopicPost();
						this.getUserJoinTopic();
						this.getMsgNum();
					}
					uni.removeStorageSync('lf_login_index')
				}
			},
			tabChange(index) {
				// console.log('index:',index)
				this.current = index;
				this.followUserPost = [];
				this.joinTopicList = [];
				this.lastPost = [];
				this.joinTopicPost = [];
				if (index === 1) {
					if (uni.getStorageSync('hasLogin')) {
						this.page3 = 1;
						this.getJoinTopicPost();
						this.getUserJoinTopic();
						this.getMsgNum();
					} else {
						this.$f.myCache('lf_login_index', '1', 300)
						this.$f.login();
					}
				}
				if (index === 0) {
					if (uni.getStorageSync('hasLogin')) {
						this.page2 = 1;
						this.getFollowUserPost();
						this.getMsgNum();
					} else {
						this.$f.myCache('lf_login_index', '1', 300)
						this.$f.login();
					}
				}
				if (index === 2) {
					this.page4 = 1;
					this.getLastPost();
				}
			},
			// 用户加入的圈子
			getUserJoinTopic() {
				this.loadStatus = 'loading';
				this.$H
					.post('topic/userJoinTopic', {
						classId: this.topicClassId
					})
					.then(res => {
						this.joinTopicList = res.result.data;
						uni.stopPullDownRefresh();
					});
			},
			jump(url) {
				uni.navigateTo({
					url: url
				})
			},
			getSysInfo() {
				this.$H.get('system/basic').then(res => {
					this.shareCover = res.logo;
					this.indexStyle1 = res.indexStyle1;
					this.indexStyle2 = res.indexStyle2;
					this.indexStyle3 = res.indexStyle3;
					//如果用户之前自定义设置过样式，那就按自定义样式显示
					if(uni.getStorageSync('activeStyle')){
						let style = uni.getStorageSync('activeStyle')
						this.indexStyle1 = style === 'twice' ? '1' :
							style === 'old' ? '2' : '0';
						this.indexStyle2 = style === 'twice' ? '1' :
							style === 'old' ? '2' : '0';
						this.indexStyle3 = style === 'twice' ? '1' :
							style === 'old' ? '2' : '0';
					}
					this.vipShow = res.vipShow;
					if (this.isIphone && res.iosClose == '1') {
						this.iosCheck = false
					} else {
						this.iosCheck = true
					}
				});
			},

			// 获取加入的圈子动态
			getJoinTopicPost() {
				this.loadStatus3 = 'loading';
				this.$H
					.get('post/joinTopicPost', {
						page: this.page3
					})
					.then(res => {
						this.joinTopicPost = this.joinTopicPost.concat(res.result.data);
						if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
							this.loadStatus3 = 'nomore';
						} else {
							this.loadStatus3 = 'loadmore';
						}
					});
			},
			// 获取关注用户帖子
			getFollowUserPost() {
				this.loadStatus1 = 'loading';
				this.$H
					.get('post/followUserPost', {
						page: this.page2
					})
					.then(res => {
						if (res.code == 0 && res.result) {
							this.followUserPost = this.followUserPost.concat(res.result.data);
							if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
								this.loadStatus1 = 'nomore';
							} else {
								this.loadStatus1 = 'loadmore';
							}
						} else {
							this.loadStatus1 = 'nomore';
						}

					});
			},
			//获取最新帖子
			getLastPost() {
				this.loadStatus4 = 'loading';
				this.$H
					.get('post/lastPostByFilter', {
						page: this.page4,
						limit: 10,
						filter: this.filterPost,
						type: this.typePost
					})
					.then(res => {
						this.lastPost = this.lastPost.concat(res.result.data);
						if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
							this.loadStatus4 = 'nomore';
						} else {
							this.loadStatus4 = 'loadmore';
						}
					});
			},
			//获取广告配置
			getAdConfig() {
				this.$H.get('system/getAd').then(res => {
					if (res.code == 0) {
						this.adIsOpen = res.adIsOpen;
						this.h5Adpid = res.h5Adpid;
						this.wxAdpid = res.wxAdpid;
					}
					this.$loading(false);
				});
			},
			//弹窗公告
			getPop() {
				this.$H.get('system/getPop').then(res => {
					if (res.code == 0) {
						if (res.popupOpen == "0") {
							if (!this.$f.myCache('lf_pop_info')) {
								this.showNotice = true
								this.popTitle = res.popTitle
								this.popContent = res.popContent
								let day = parseInt(res.popTime)
								this.$f.myCache('lf_pop_info', 'lf', day * 3600 * 24)
							}
						}
					}
				});
			},
			toVipPage() {
				if (uni.getStorageSync('hasLogin')) {
					this.$f.jump('/pages/user/vip/vip')
				} else {
					this.$f.toast('请先登录哦')
				}
			},
			toSearch() {
				if (uni.getStorageSync('hasLogin')) {
					this.$f.jump('/pages/search/search')
				} else {
					this.$f.toast('请先登录哦')
				}
			},
			closePop() {
				this.showNotice = false
			}
		}
	};
</script>

<style lang="scss" scoped>
	.index-con {
		padding-bottom: 80rpx;

		.lf-tab {
			display: flex;
			margin-top: 15rpx;
			padding-right: 40rpx;
			justify-content: space-between;
			align-items: center; // 添加垂直居中对齐
			width: 750rpx;
		}

		.lf-tab-con {
			width: 450rpx; // 调整宽度，为筛选按钮留出空间
		}

		.lf-filter {
			margin-left: auto;
			// margin-right: auto;
			padding-top: 5rpx;
		}
	}

	.lf-nav {
		background-color: #ffffff;
		position: fixed;
		top: 0;
		z-index: 999;
	}

	.lf-all {
		display: flex;
		flex-direction: column;
	}

	.lf-all-nav {
		display: flex;
		align-items: center;
	}

	// .lf-tab {
	// 	display: flex;
	// 	margin-top: 15rpx;
	// 	padding-right: 40rpx;
	// 	justify-content: space-between;
	// 	width: 750rpx;
	// }

	// .lf-tab-con {
	// 	width: 500rpx;
	// }

	.lf-vip {
		padding-top: 5rpx;
		height: 40rpx;
	}

	.lf-vip-icon {
		width: 146rpx;
		height: 40rpx;
	}

	.lf-top {
		/* #ifdef H5*/
		margin-top: 160rpx;
		/* #endif */
		/* #ifdef MP */
		margin-top: 242rpx;
		/* #endif */
		/* #ifdef APP-PLUS */
		margin-top: 242rpx;
		/* #endif */

	}

	.navbar-img {
		.n-img {
			width: 80rpx;
			height: 80rpx;
			margin: 0 20rpx 0 40rpx
		}

	}

	.search-wrap {
		/* #ifdef MP */
		width: 410rpx;
		/* #endif */
		/* #ifndef MP */
		width: 100%;
		/* #endif */

	}

	.swiper-body {
		height: calc(100vh - var(--status-bar-height) - 43px);
	}

	.body-scroll-view {
		width: 100%;
		height: 100%;
	}

	.tab-box {
		width: 80%;
	}

	.block-title {
		font-weight: bold;
		padding: 20rpx;
		color: #616161;
		display: flex;
		font-size: 28rpx;

		.right {
			margin-left: auto;
			color: #333;
			font-size: 20rpx;
			display: flex;
			align-items: center;
		}
	}

	// 顶部圈子
	.topic-wrap {
		padding: 0 20rpx;
		background-color: #fff;
		margin-bottom: 1rpx;
	}

	.grid-topic {
		position: relative;
		margin-bottom: 20rpx;

		.name {
			font-size: 20rpx;
			text-align: center;
		}

		.user {
			position: absolute;
			left: 0;
			top: 4rpx;
			font-size: 24rpx;
			display: block;
			background-color: #f18686;
			padding: 2rpx;
			border-radius: 0 0 10rpx 0;
			height: auto;
			color: white;
		}
	}

	// 弹框样式
	.system-pop {
		width: 540rpx;
		box-sizing: border-box;
		padding: 42rpx;
		background: white;
		border-radius: 30rpx;
		margin: 500rpx auto;

		.pop-title {
			text-align: center;
			font-size: 31upx;
			color: #000;
			font-weight: bold;
			margin-bottom: 20upx;
		}

		.popup-txt {
			line-height: 48upx;
			font-size: 28upx;
		}

		.popup-bot {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 30upx;

			>button {
				color: #FFF;
				font-size: 26rpx;
				font-weight: 500;
				line-height: 80rpx;
				width: 46%;
				text-align: center;
				height: 80rpx;
				border-radius: 16rpx;
				border: none;
				background: #00aaff;
			}

			>button:nth-of-type(1) {
				color: #00aaff;
				background: #f2f2f2;
			}
		}
	}
</style>