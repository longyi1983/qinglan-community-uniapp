<template>
	<view class="container">
		<z-paging ref="pagePaging" refresher-only @onRefresh="onRefresh" @scrolltolower="scrolltolower"
			@scroll="scroll">
			<template #top>
				<my-navbar title="栖心港" :navBg="navBg" @navbarHeightChange="onNavbarHeightChange" :isBack="false"></my-navbar>
			</template>
			<!-- 输入框 -->
			<view class="header" @click="goSearch">
				<u-search placeholder="搜AI视觉疗愈" v-model="keyword" disabled :showAction="false" bgColor="#FFFFFF"></u-search>
			</view>
			<view class="hot-topic">
				<view class="title">
					<image src="/static/index/hot.png" mode=""></image>
					热门话题
				</view>
				<!-- 列表 -->
				<view class="swiper">
					<swiper class="swiper" next-margin="200rpx">
						<swiper-item v-for="(hots, index) in newHot" :key="index">
							<view class="hot-topic-list">
								<view class="hot-topic-item" v-for="innerItem in hots" @click="goTopic(innerItem)"
									:key="innerItem.id">
									<image src="/static/community/topic.png" mode=""></image>
									{{innerItem.title}}
								</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
			</view>
			<!-- 公告 -->
			<view class="notice" v-if="false">
				<view class="word">
					活动
				</view>
				<view class="detail">
					<u-notice-bar :list="noticeContent" type="none" :volume-icon="false"
						:more-icon="false"></u-notice-bar>
				</view>
				<view class="more">
					<text>更多</text>
					<u-icon name="arrow-right"></u-icon>
				</view>
			</view>
			<!-- 工具栏宫格 -->
			<view class="grid" v-if="false">
				<swiper :indicator-dots="false" class="swiper">
					<swiper-item>
						<u-grid :border="false" :col="5">
							<u-grid-item :customStyle="{width:110+'rpx',height:140+'rpx',background:'none'}"
								v-for="(item, index) in gridList" :index="index" :key="index" bgColor="transparent">
								<u-image :showLoading="true" :src="item.img" width="100rpx" height="100rpx"
									@click="goTo(item)"></u-image>
								<text class="grid-text">{{ item.name }}</text>
							</u-grid-item>
						</u-grid>
					</swiper-item>
				</swiper>
			</view>
			<view class="topicList">
				<view class="tabs">
					<u-tabs :list="tabs" font-size="$gap"
						:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
						:current="current" @change="change" name="topicName"></u-tabs>
				</view>
				<swiper class="content-swiper" :style="[{height:swiperHeight+'px'}]" :current="current"
					@change="swiperChange">
					<swiper-item class="swiper-item" v-for="(item, index) in tabs" :key="index">
						<swiper-community-list ref="swiperList" :tabIndex="index" :tabItem="item"
							:currentIndex="current" @heightChanged="heightChanged">
						</swiper-community-list>
					</swiper-item>
				</swiper>
			</view>
			<template #bottom>
				<lf-tabbar :active="1" :count="msgCount"></lf-tabbar>
			</template>
		</z-paging>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				swiperHeight: 0,
				current: 0,
				noticeContent: [],
				gridList: [{
						img: "https://ceping.qinglan.cn/uniapp/new/index/grid1.png",
						name: "签到福利"
					},
					{
						img: "https://ceping.qinglan.cn/uniapp/new/index/grid2.png",
						name: "量表交流"
					},
					{
						img: "https://ceping.qinglan.cn/uniapp/new/index/grid3.png",
						name: "课程中心"
					},
					{
						img: "https://ceping.qinglan.cn/uniapp/new/index/grid4.png",
						name: "话题广场"
					},
					{
						img: "https://ceping.qinglan.cn/uniapp/new/index/grid5.png",
						name: "任务中心"
					}
				],
				tabs: [],
				hotTopic: [],
				navbarHeight: 0,
				keyword: '',
				navBg: 'transparent'
			};
		},
		computed: {
			bottom() {
				return this.navbarHeight;
			},
			newHot() {
				// 将数组进行分割
				return this.$f.splitArray(this.hotTopic, 3)
			},
			msgCount() {
				this.msg = this.$store.state.messegeNum[3]
				return this.$store.state.messegeNum
			}
		},
		onLoad() {
			this.getType();
			this.getMenus();
			this.getNotice();
			this.getHotTopic();
			this.getMsgNum();
			
			// 监听帖子删除事件
			uni.$on('refreshPostList', (data) => {
				console.log('community监听到事件: refreshPostList', data);
				// 如果有指定的topicId，检查当前是否为对应的标签页
				if (data && data.topicId) {
					const tabIndex = this.tabs.findIndex(tab => tab.topicId === data.topicId);
					if (tabIndex !== -1) {
						// 如果不是当前显示的标签页，标记需要刷新
						if (tabIndex !== this.current) {
							// 标记该标签页需要刷新
							this.$set(this.tabs[tabIndex], 'needRefresh', true);
						} else {
							// 如果是当前标签页，直接刷新数据
							this.$refs.swiperList[this.current].reload();
						}
					}
				} else {
					// 如果没有指定topicId，刷新当前标签页
					this.$refs.swiperList[this.current].reload();
				}
			});
		},
		onUnload() {
			// 移除事件监听，防止内存泄漏
			uni.$off('refreshPostList');
		},
		methods: {
			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + res.result.allCount 
					// - res.result.systemUnreadCount 
					// + this.$store.state.totalUnread.notice 
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
				});
			},
			scroll(e) {
				this.handlePageScroll(e.detail);
			},
			onRefresh() {
				this.$refs.swiperList[this.current].reload(() => {
					this.$refs.pagePaging.endRefresh();
				});
			},
			scrolltolower() {
				this.$refs.swiperList[this.current].doLoadMore();
			},
			swiperChange(e) {
				this._setCurrent(e.detail.current);
			},
			heightChanged(height) {
				if (height === 0) {
					height = uni.getSystemInfoSync().windowHeight - uni.upx2px(80);
				}
				this.swiperHeight = height;
			},
			_setCurrent(current) {
				if (current !== this.current) {
					this.$refs.swiperList[this.current].clear();
					// 检查新标签页是否需要刷新
					if (this.tabs[current] && this.tabs[current].needRefresh) {
						// 标记为不需要刷新，防止重复刷新
						this.$set(this.tabs[current], 'needRefresh', false);
						// 延迟执行刷新，等待标签页切换完成
						setTimeout(() => {
							this.$refs.swiperList[current].reload();
						}, 200);
					}
				}
				this.current = current;
			},
			onNavbarHeightChange(height) {
				this.navbarHeight = height;
			},
			goTopic(item) {
				uni.navigateTo({
					url: '/pages/discuss/detail?id=' + item.id
				});
			},
			// 获取热门话题
			getHotTopic() {
				this.$H.get('discuss/hotDiscussList')
					.then(res => {
						this.hotTopic = res.result || [];
					});
			},
			goTo(item) {
				uni.navigateTo({
					url: item.url
				});
			},
			getMenus() {
				this.$H.get('appusermenu/list', {
						code: 'community',
						status: 1
					})
					.then(res => {
						if (res.code == 200 && res.rows) {
							this.gridList = res.rows[0].appUserMenuList;
						}
					});
			},
			getType() {
				this.$H.get('posttype/list').then(res => {
					if (res.code == 200) {
						this.tabs = res.rows;
					}
					this.$loading(false);
				});
			},
			change(index) {
				this.current = index;
			},
			getNotice() {
				this.$H.get('topic/notice').then(res => {
					if (res.code == 0) {
						this.noticeContent = res.result;
					}
					this.$loading(false);
				});
			},
			goSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				});
			}
		}
	};
</script>
<style lang="scss" scoped>
	.container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		margin: 0;
		padding: 0;
	}

	.container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 432rpx;
		z-index: -1;
		background-image: url('https://ceping.qinglan.cn/uniapp/new/index/1.png');
		background-size: cover;
		background-position: center;
	}

	.grid {
		padding: $gap 0;

		.grid-text {
			font-size: 24rpx;
			color: #5B5B6E;
		}

		.swiper {
			height: 140rpx;
		}
	}

	.notice {
		margin: $gap;
		padding: 0 16rpx;
		background-color: #fff;
		border-radius: 16rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.word {
			margin-right: 10rpx;
			width: 64rpx;
			height: 36rpx;
			line-height: 36rpx;
			background: linear-gradient(154deg, #C7D2FF 0%, #6986FD 100%);
			border-radius: 8rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 600;
			font-size: 20rpx;
			color: #FFFFFF;
			text-align: center;
		}

		.detail {
			width: 550rpx;
			font-size: 24rpx;
			color: #5B5B6E;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.more {
			width: 120rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 24rpx;
			color: #6976FD;
			height: 32rpx;
			line-height: 32rpx;
		}
	}

	.topicList {
		width: 100vw;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
	}

	.content-swiper {
		height: 1000px;
	}

	.header {
		height: 68rpx;
		padding: $gap;
		margin-bottom: $gap;
	}

	.hot-topic {
		padding: $gap;

		.title {
			display: flex;
			align-items: center;
			font-weight: 600;
			font-size: 36rpx;
			color: #1B1B26;

			image {
				width: 36rpx;
				height: 36rpx;
				margin-right: 16rpx;
			}
		}
	}

	.swiper {
		height: 300rpx;
	}

	.hot-topic-list {
		.hot-topic-item {
			width: 450rpx;
			display: flex;
			align-items: center;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #5B5B6E;
			margin: 50rpx 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			image {
				width: 28rpx;
				height: 28rpx;
				margin-right: 10rpx;
			}
		}
	}

	.tabs {
		z-index: 100;
		position: sticky;
		top: 0;
		background-color: #FFFFFF;
	}
</style>