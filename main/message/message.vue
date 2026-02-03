<template>
	<view class="container">
		<my-navbar title="栖心港" :navBg="navBg" :isBack="false"></my-navbar>
		<!-- 三个选项 -->
		<view class="tabs">
			<view class="tab-item" v-for="tab in tabs" :key="tab.word" @click="goToPage(tab)">
				<view class="img">
					<u-image :src="tab.img" width="100rpx" height="100rpx" border-radius="20rpx"></u-image>
					<u-badge :count="tab.count" absolute :offset="[-20,-20]"></u-badge>
				</view>
				<view class="word">
					{{tab.word}}
				</view>
			</view>
		</view>
		<!-- 系统通知 -->
		<view class="list">
			<!-- 系统通知入口 -->
			<view class="flex_col" @longpress="onPressArticle" @tap="goSys">
				<view class="avatar-container" style="height: 60rpx; width: 60rpx;">
					<image :src="'https://demo.linfeng.tech/resource/images/sys.png'" mode="aspectFill" style="border-radius: 10%; height: 60rpx; width: 60rpx;"></image>
					<u-badge :count="msgNum.systemUnreadCount" absolute :offset="[-20,-20]"></u-badge>
				</view>
				<view class="flex_grow">
					<view class="flex_col">
						<view class="flex_grow">系统通知</view>
					</view>
					<view class="info">{{ msgNum.systemUnreadCount>0 ? ('你有'+msgNum.systemUnreadCount+'条系统通知未读') : '暂无新消息' }}</view>
				</view>
			</view>
			<!-- 其它会话列表 -->
			<view class="flex_col" @longpress="onLongPress" :class="{'active':pickerUserIndex==index}"
				@tap="listTap(item)" v-for="(item,index) in sessionList" :key="index" :data-index="index">
				<view class="avatar-container">
					<image :src="item.avatar" mode="aspectFill" style="border-radius: 10%;"></image>
					<u-badge :count="item.unread" absolute :offset="[-20,-20]"></u-badge>
				</view>
				<view class="flex_grow">
					<view class="flex_col">
						<view class="flex_grow">{{item.name}}</view>
						<view class="time">{{timeShowFormat(item.updateTime)}}</view>
					</view>
					<view class="info">{{item.lastMessage}}</view>
				</view>
			</view>
		</view>
		<block v-if="sessionList.length == 0">
			<view class="msg-empty">
				<image class="img" mode="widthFix" src="/static/empty.png"></image>
				<text class="txt">暂无会话</text>
			</view>
		</block>
		<view class="shade" v-show="showShade" @tap="hidePop">
			<view class="pop" :style="popStyle" :class="{'show':showPop}">
				<view v-for="(item,index) in popButton" :key="index" @tap="pickerMenu" :data-index="index">{{item}}
				</view>
			</view>
		</view>
		<!-- 删除系统消息弹窗 -->
		<u-action-sheet :list="sheetList" v-model="showSheet" @click="onSheetItem"></u-action-sheet>
		<lf-tabbar :active="3" :count="msgCount"></lf-tabbar>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import timeUtil from '@/utils/timeUtil.js';
	import stringUtil from '@/utils/stringUtil.js';
	import {
		mapGetters
	} from 'vuex';
	import websocket from '@/utils/websocket.js';
	import $store from '@/store/index.js';
	import unidrawer from '@/uni_modules/uni-drawer/components/uni-drawer/uni-drawer.vue';
	import sideview from '@/components/sideView/sideview.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			unidrawer: unidrawer,
			sideview: sideview
		},
		data() {
			return {
				$IMG: this.$IMG,
				uploadShow: false,
				selectedImage: '',
				title: '栖心港IM',
				show: false,
				selectedAvartar: null,
				maxImageMB: 3,
				tip: '',
				value: 0,
				/* 窗口尺寸 */
				winSize: {},
				/* 显示遮罩 */
				showShade: false,
				/* 显示操作弹窗 */
				showPop: false,
				/* 弹窗按钮列表 */
				popButton: ["标记未读"],
				/* 弹窗定位样式 */
				popStyle: "",
				/* 选择的用户下标 */
				pickerUserIndex: -1,
				showSheet: false,
				sheetList: [{
					text: '删除',
					color: 'red'
				}],
				msgNum: {
					thumbCount: 0,
					follow: 0,
					comment: 0,
					systemUnreadCount: 0,
					articleMsgList: [],
					chatMsgList: [],
				},
				tabs: [{
						url: "/pages/message/list?type=1",
						word: "点赞",
						img: this.$f.geturl("/uniapp/new/message/1.png"),
						count: 0
					},
					{
						url: "/main/message/follow/follow",
						word: "新增关注",
						img: this.$f.geturl("/uniapp/new/message/2.png"),
						count: 0
					},
					{
						url: "/pages/message/list?type=3",
						word: "评论",
						img: this.$f.geturl("/uniapp/new/message/3.png"),
						count: 0
					},
				],
			}
		},
		computed: {
			...mapGetters(['loginUserInfo', 'isSocketOpen', 'sessionList', 'totalUnread']),

			msgCount() {
				this.msg = this.$store.state.messegeNum[3]
				return this.$store.state.messegeNum
			}

		},

		//刷新
		onPullDownRefresh() {
			//重新获取连接websocket
			// if(!$store.state.isSocketOpen){
			// 	websocket.initConnect()
			// }
			//从新获取消息列表
			$store.dispatch('getFriendList')
			setTimeout(() => {
				if ($store.state.isSocketOpen) {
					uni.showToast({
						icon: 'none',
						title: '刷新成功'
					})
				} else {
					uni.showToast({
						icon: 'error',
						title: '刷新失败'
					})
				}
				uni.stopPullDownRefresh()
			}, 800)
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad() {
			if (!uni.getStorageSync('hasLogin')) {
				this.$f.login();
			}
			this.getWindowSize();

			// #ifdef H5
			document.onLong = function(e) {
				var e = e || window.event;
				e.preventDefault();
			};
			// #endif
		},
		onShow() {
			//重新获取连接websocket
			// #ifndef APP
			// if (!$store.state.isSocketOpen) {
			// 	websocket.initConnect()
			// 	$store.dispatch('getFriendList')
			// }
			// #endif
			this.getMsgNum();
		},
		methods: {
			goSys() {
				if (uni.getStorageSync('hasLogin')) {
					this.$f.jump('/pages/system/system')
				} else {
					this.$f.toast('请先登录哦')
				}
			},
			getMsgNum() {
				this.$H.post('message/num').then(res => {
					this.msgNum = res.result;
					let all = this.$store.state.totalUnread.message + res.result.allCount 
					// - res.result.systemUnreadCount
					// + this.$store.state.totalUnread.notice 
					this.$store.state.messegeNum = [0, 0, 0, all, 0];
					
					// 更新tabs的count值
					this.tabs[0].count = this.msgNum.thumbCount;
					this.tabs[1].count = this.msgNum.follow;
					this.tabs[2].count = this.msgNum.comment;
				});
			},
			// 长按系统消息
			onPressArticle() {
				this.showSheet = true;
			},
			// 删除系统消息
			onSheetItem(index) {
				if (index == 0) {
					this.$H
						.post('message/delSystemMsg').then(res => {
							if (res.code == 0) {
								this.msgNum.systemUnreadCount = 0
							}
						});
				}
			},
			goToPage(item) {
				uni.navigateTo({
					url: item.url
				})
			},
			timeShowFormat(time) {
				return timeUtil.timeShowFormat(timeUtil.getFormatTime(time));
			},
			close() {},
			open() {},
			//去搜索页面
			gotoSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				})
			},
			//显示侧边栏
			showDrawer() {
				this.$refs.draw.open();
			},
			hideDrawer() {
				this.$refs.draw.close();
			},

			/* 列表触摸事件 */
			listTap(item) {
				/* 因弹出遮罩问题，所以需要在遮罩弹出的情况下阻止列表事件的触发 */
				if (this.showShade) {
					return;
				}
				if (item.type == 'person') {
					$store.state.chattingUserInfo = item;
					this.$H.post('chat/list', {
						sessionId: item.sessionId,
						pageNum: 1,
						pageSize: 20
					}).then(res => {
						if (res.code == 0) {
							let data = res.data
							for (let i = 0; i < $store.state.personMessage.length; i++) {
								if ($store.state.personMessage[i].sessionId == data.sessionId) {
									let current = Number(data.pageInfo.current)
									let total = Number(data.pageInfo.total)
									let size = Number(data.pageInfo.size)
									$store.state.personMessage[i].lastMessageId = data.pageInfo.records
										.length != 0 ? data.pageInfo.records[0].id : 0
									$store.state.personMessage[i].list = data.pageInfo.records.reverse()
									$store.state.personMessage[i].pageNum = current
									$store.state.personMessage[i].hasNextPage = current * size < total
									break;
								}
							}
							uni.navigateTo({
								url: '/pages/im/chat/chat'
							})
						} else {
							uni.showToast({
								icon: 'none',
								mask: '消息加载失败'
							})
						}
					})

				}
			},
			/* 获取窗口尺寸 */
			getWindowSize() {
				uni.getSystemInfo({
					success: (res) => {
						this.winSize = {
							"witdh": res.windowWidth,
							"height": res.windowHeight
						}
					}
				})
			},
			/* 长按监听 */
			onLongPress(e) {
				let [touches, style, index] = [e.touches[0], "", e.currentTarget.dataset.index];

				/* 因 非H5端不兼容 style 属性绑定 Object ，所以拼接字符 */
				if (touches.clientY > (this.winSize.height / 2)) {
					style = `bottom:${this.winSize.height-touches.clientY}px;`;
				} else {
					style = `top:${touches.clientY}px;`;
				}
				if (touches.clientX > (this.winSize.witdh / 2)) {
					style += `right:${this.winSize.witdh-touches.clientX}px`;
				} else {
					style += `left:${touches.clientX}px`;
				}

				this.popStyle = style;
				this.pickerUserIndex = Number(index);
				this.showShade = true;
				this.$nextTick(() => {
					setTimeout(() => {
						this.showPop = true;
					}, 10);
				});
			},
			/* 隐藏弹窗 */
			hidePop() {
				this.showPop = false;
				this.pickerUserIndex = -1;
				setTimeout(() => {
					this.showShade = false;
				}, 250);
			},
			/* 选择菜单 */
			pickerMenu(e) {
				let index = Number(e.currentTarget.dataset.index);
				// console.log(`第${this.pickerUserIndex+1}个用户,第${index+1}个按钮`);
				$store.state.sessionList[this.pickerUserIndex].unread = 1
				/* 
				 因为隐藏弹窗方法中会将当前选择的用户下标还原为-1,
				 如果行的菜单方法存在异步情况，请在隐藏之前将该值保存，或通过参数传入异步函数中
				 */
				this.hidePop();
			}
		}

	}
</script>

<style lang="scss" scoped>
	.container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		padding: 0;
		margin: 0;
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

	.msg-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 800rpx;

		.img {
			width: 200rpx;
			margin-top: 100rpx;
		}

		.txt {
			color: #999;
			font-size: 20rpx;
			margin-top: 20rpx;
		}
	}

	/* 列式弹性盒子 */
	.flex_col {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: center;
		align-content: center;
		background-color: $background;
	}

	/* 弹性盒子弹性容器 */
	.flex_col .flex_grow {
		width: 0;
		-webkit-box-flex: 1;
		-ms-flex-positive: 1;
		flex-grow: 1;
	}

	.flex_row .flex_grow {
		-webkit-box-flex: 1;
		-ms-flex-positive: 1;
		flex-grow: 1;
	}

	/* 弹性盒子允许换行 */
	.flex_col.flex_wrap {
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
	}

	.msg-tag {
		position: absolute;
		right: -20rpx;
		top: -20rpx;
	}

	/* 列表 */
	.list {
		background-color: #fff;
		font-size: 28upx;
		color: #333;
		user-select: none;
		touch-callout: none;

		&>view {
			padding: 24upx 30upx;
			position: relative;

			&:active,
			&.active {
				// background-color: #f3f3f3;
			}

			.avatar-container {
				height: 90upx;
				width: 90upx;
				border-radius: 4px;
				margin-right: 20upx;
				position: relative;
			}

			image {
				height: 90upx;
				width: 90upx;
				// border-radius: 4px;
				// margin-right: 20upx;
			}

			&>view {
				line-height: 40upx;

				.time,
				.info {
					color: #999;
					font-size: 24upx;
				}

				.time {
					width: 150upx;
					text-align: right;
				}

				.info {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}

		&>view:not(:first-child) {
			margin-top: 1px;

			&::after {
				content: '';
				display: block;
				height: 0;
				border-top: #CCC solid 1px;
				width: 620upx;
				position: absolute;
				top: -1px;
				right: 0;
				transform: scaleY(0.5);
				/* 1px像素 */
			}
		}
	}

	/* 遮罩 */
	.shade {
		position: fixed;
		z-index: 100;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		-webkit-touch-callout: none;

		.pop {
			position: fixed;
			z-index: 101;
			width: 200upx;
			box-sizing: border-box;
			font-size: 28upx;
			text-align: left;
			color: #333;
			background-color: #fff;
			box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
			line-height: 80upx;
			transition: transform 0.15s ease-in-out 0s;
			user-select: none;
			-webkit-touch-callout: none;
			transform: scale(0, 0);

			&.show {
				transform: scale(1, 1);
			}

			&>view {
				padding: 0 20upx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				user-select: none;
				-webkit-touch-callout: none;

				&:active {
					background-color: #f3f3f3;
				}
			}
		}
	}

	.tabs {
		display: flex;
		justify-content: space-around;
		align-items: center;
		font-weight: bold;
		font-size: 28rpx;
		color: #1B1B26;
		margin-top: 20rpx;
		margin-bottom: 40rpx;

		&>view {
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 24rpx;
		}
	}

	.img {
		position: relative;
		width: 100rpx;
		height: 100rpx;
	}

	.badge {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 20rpx;
		height: 20rpx;
		background-color: #ff0000;
		border-radius: 50%;
		border: 2rpx solid #ffffff;
	}
	
</style>