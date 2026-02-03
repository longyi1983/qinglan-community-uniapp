<template>
	<view class="container">
		<z-paging ref="pagePaging" refresher-only @onRefresh="onRefresh" @scrolltolower="scrolltolower"
			@scroll="scroll">
			<template #top>
				<my-navbar title="青蓝心晴" :navBg="navBg"></my-navbar>
			</template>
			<!-- 头部 -->
			<view class="page-top">
				<view class="first-floor">
					<view class="avatar">
						<image :src="userInfo.avatar"
							style="width: 120rpx;height: 120rpx;border-radius: 128rpx;border: 1rpx solid #ffffff;"
							mode="aspectFill" @click="previewAvatar">
						</image>
					</view>
					<view class="some-btn">
						<view class="num-name" @click="getFollow">
							<view class="num">
								{{ info.follow_count || 0 }}
							</view>
							<view class="name">
								关注
							</view>
						</view>
						<view class="num-name" @click="getFans">
							<view class="num">
								{{ info.fans_count || 0 }}
							</view>
							<view class="name">
								粉丝
							</view>
						</view>
						<view class="num-name">
							<view class="num">
								{{info.likes_count || 0}}
							</view>
							<view class="name">
								点赞
							</view>
						</view>
					</view>
				</view>
				<view>
					<view
						style="font-size: 34rpx;font-weight: 600;line-height: 48rpx;margin-top: 30rpx;display: flex;align-items: center;">
						{{ userInfo.username }}
						<image src="@/static/vip/vipIcon.png" class="image3" v-if="userInfo.vip==1" />
						<user-level :level="userInfo.level"></user-level>
					</view>
					<view style="font-size: 24rpx;line-height: 33rpx;margin-top: 16rpx;">{{ userInfo.intro }}</view>
				</view>
				<view class="id">
					ID:{{userInfo.uid}}
				</view>
				<!-- 圈子&关注&粉丝&编辑资料 按钮 -->
				<view class="bottom-btn" v-if="currUid!=uid">
					<view class="follow">
						<view v-if="!userInfo.isFollow" @click="follow" class="watch-btn">
							关注
						</view>
						<view v-else @click="cancelFollow" class="follow-btn">
							已关注
						</view>
					</view>
				</view>
				<view class="bottom-btn" v-else>
					<view class="chatButton" @click="goPersonalData">
						编辑
					</view>
				</view>
			</view>
			<!-- 中间 -->
			<view class="page-mid" v-if="currUid==uid && false">
				<view @click="goFollow()" class="one-btn">
					<view class="top">
						我的关注
					</view>
					<view class="bottom">
						关注的人
					</view>
				</view>
				<view @click="goFan()" class="one-btn">
					<view class="top">
						我的粉丝
					</view>
					<view class="bottom">
						粉丝列表
					</view>
				</view>
				<view @click="goIntegral()" class="one-btn">
					<view class="top">
						我的积分
					</view>
					<view class="bottom">
						签到/消耗
					</view>
				</view>
			</view>
			<view v-if="userInfo.status === 1">
				<u-notice-bar type="error" mode="vertical" :list="banInfo"></u-notice-bar>
			</view>
			<view v-if="userInfo.status === 2">
				<u-notice-bar type="warning" mode="vertical" :list="forbiddenInfo"></u-notice-bar>
			</view>
			<!-- 底部 -->
			<view class="swiper-container">
				<view class="tabs">
					<u-tabs :list="tabList" @click="click" font-size="$gap"
						:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
						:current="current" @change="change" bg-color="#FFFFFF"></u-tabs>
				</view>
				<swiper class="swiper" :style="[{height:swiperHeight+'px'}]" :current="current" @change="swiperChange">
					<swiper-item class="swiper-item" v-for="(item, index) in tabList" :key="index">
						<swiper-home-list ref="swiperList" :tabIndex="index" :currentIndex="current"
							@heightChanged="heightChanged" :userInfo="userInfo" :tabList="tabList" :uid="uid"
							@updateUserInfo="handleUpdateUserInfo">
						</swiper-home-list>
					</swiper-item>
				</swiper>
			</view>
			<template #bottom>
				<!-- <lf-tabbar :active="0" :count="msgCount"></lf-tabbar> -->
				<!-- 底部按钮 -->
				<view class="button" @click="goCommunity">
					去社区逛逛
				</view>
			</template>
		</z-paging>

		<!-- 填写信息弹窗 -->
		<u-popup v-model="openPop" mode="center" border-radius="14">
			<view class="informationShow-box">
				<view class="flex-items flex-column informationShow-centent">
					<view class="mar-top-60">
						<label class="title">申请好友</label>
					</view>
					<view class="flex-items flex-row mar-top-60">
						<view class="fs26">备注</view>
						<input class="remark mar-left-20 fs26" v-model="message" />
					</view>
					<view class="flex-items flex-row mar-top-30 ">
						<label class="fs26">对方</label>
						<input class="nick mar-left-20 fs26" v-model="notation" disabled="disabled" />
					</view>
					<view class="flex-row-plus massageDes-but">
						<view class="exitBut" @click="outPop">取消</view>
						<view class="submitbut" @click="submitPop">提交</view>
					</view>
				</view>
			</view>
		</u-popup>
		<!-- 自定义加载 -->
		<toast color="#fff" type="round"></toast>
	</view>
</template>
<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import swiperHomeList from '@/components/swiper-home-list/swiper-home-list.vue';
	import {
		mapGetters
	} from 'vuex';
	import $store from '@/store/index.js';
	import websocket from '@/utils/websocket.js';
	export default {
		mixins: [scrollMixin],
		computed: {
			...mapGetters(['friendList', 'loginUserInfo', 'sessionList'])
		},
		components: {
			swiperHomeList
		},
		data() {
			return {
				$IMG: this.$IMG,
				loading: true,
				background: {
					backgroundColor: 'unset'
				},
				tabList: [],
				otherTabList: [{
						name: '按时间',
						sortType: "time"
					},
					{
						name: '按热度',
						sortType: "hot"
					}
				],
				myTablist: [{
						name: '动态',
						sortType: "dynamics"
					},
					{
						name: '关注动态',
						sortType: "follow"
					},
					{
						name: '赞过',
						sortType: "like"
					}
				],
				banInfo: ['该用户由于违反《社区公约》已被封号'],
				forbiddenInfo: ['该用户由于违反《社区公约》已被禁言'],
				current: 0,
				uid: 0,
				userInfo: {},
				userJson: "",
				currUid: 0,
				statusBarHeight: 0,
				navHeight: 0,
				navOpacity: 0,
				createTopicList: [],
				notation: '',
				message: '',
				openPop: false,
				appName: this.$c.miniappName,
				backgroundImage: 'https://demo.linfeng.tech/resource/images/user-bg.png',
				info: {},
				swiperHeight: 0,
				wasLoggedIn: false
			};
		},
		onLoad(options) {
			this.navHeight = getApp().globalData.navHeight;
			this.statusBarHeight = getApp().globalData.statusBarHeight;
			if (options.uid) {
				this.uid = options.uid;
			} else {
				console.log("出问题了", uni.getStorageSync('userInfo'))
				if (uni.getStorageSync('userInfo').uid) {
					this.uid = uni.getStorageSync('userInfo').uid;
				}
			}
			if (uni.getStorageSync('userInfo').uid) {
				this.currUid = uni.getStorageSync('userInfo').uid;
			}
			if (this.currUid == this.uid) {
				this.tabList = this.myTablist
			} else {
				this.tabList = this.otherTabList
			}
			// if (!$store.state.isSocketOpen) {
			// 	websocket.initConnect()
			// }
		},
		onShow() {
			const isLoggedIn = uni.getStorageSync('hasLogin');

			// 检查登录状态是否发生变化
			if (isLoggedIn && !this.wasLoggedIn) {
				// 从未登录变为已登录，重新加载数据
				if (this.uid == 0 && uni.getStorageSync('userInfo').uid) {
					this.uid = uni.getStorageSync('userInfo').uid;
				}
				this.getUserInfo();
				if (uni.getStorageSync('userInfo').uid) {
					this.currUid = uni.getStorageSync('userInfo').uid;
				}
				// 重新加载列表数据
				if (this.$refs.swiperList && this.$refs.swiperList[this.current]) {
					this.$refs.swiperList[this.current].reload();
				}
			} else if (isLoggedIn) {
				// 保持登录状态，正常加载数据
				if (this.uid == 0 && uni.getStorageSync('userInfo').uid) {
					this.uid = uni.getStorageSync('userInfo').uid;
				}
				this.getUserInfo();
				if (uni.getStorageSync('userInfo').uid) {
					this.currUid = uni.getStorageSync('userInfo').uid;
				}
			} else {
				this.$f.toast('请先登录哦')
				setTimeout(() => {
					this.$f.login();
				}, 1500);
			}

			// 更新登录状态标记
			this.wasLoggedIn = isLoggedIn;
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		methods: {
			previewAvatar() {
				uni.previewImage({
					urls: [this.userInfo.avatar]
				})
			},
			goCommunity() {
				uni.switchTab({
					url: "/main/community/community"
				})
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
				}
				this.current = current;
			},
			change(index) {
				this.current = index;
			},
			getFollow() {
				if (this.userInfo.isWatch) {
					this.$f.toast('TA设置了私密哦')
					return
				}
				this.$f.jump('/pages/my/follow?uid=' + this.userInfo.uid)
			},
			getFans() {
				if (this.userInfo.isFan) {
					this.$f.toast('TA设置了私密哦')
					return
				}
				this.$f.jump('/pages/my/fans?uid=' + this.userInfo.uid)
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
			follow() {
				// 获取当前用户信息
				const currentUser = uni.getStorageSync('userInfo');

				this.$H.post('user/addFollow', {
					id: this.userInfo.uid,
					data: {
						senderId: Number(currentUser.uid),
						senderName: currentUser.username,
						senderAvatar: currentUser.avatar,
						receiverId: Number(this.userInfo.uid),
						notation: this.userInfo.username,
						applyMessage: "你好,我是" + currentUser.username
					}
				}).then(res => {
					if (res.code === 0) {
						this.userInfo.isFollow = true;
						// 发送关注状态改变事件
						uni.$emit('updateUserFollow', {
							uid: this.userInfo.uid,
							isFollow: true
						});
						console.log('事件发送: updateIsFollow', {
							uid: this.userInfo.uid,
							isFollow: true
						});
						if (this.message) {
							this.$store.dispatch('getFriendList')
						}
					} else {
						this.$u.toast(res.msg);
					}
				})
			},
			cancelFollow() {
				// 获取当前用户信息
				const currentUser = uni.getStorageSync('userInfo');

				this.$H.post('user/cancelFollow', {
					id: this.userInfo.uid,
					data: {
						senderId: Number(currentUser.uid),
						senderName: currentUser.username,
						senderAvatar: currentUser.avatar,
						receiverId: Number(this.userInfo.uid),
						notation: this.userInfo.username,
						applyMessage: "你好,我是" + currentUser.username
					}
				}).then(res => {
					if (res.code === 0) {
						this.userInfo.isFollow = false;
						// 发送取消关注状态改变事件
						uni.$emit('updateUserFollow', {
							uid: this.userInfo.uid,
							isFollow: false
						});
						console.log('事件发送: updateIsFollow', {
							uid: this.userInfo.uid,
							isFollow: false
						});
					}
				})
			},
			getUserInfo() {
				this.$loading(true);
				this.$H.post('user/userInfoById', {
					uid: this.uid
				}).then(res => {
					this.userInfo = res.result;
					if (res.result.bgImg) {
						this.backgroundImage = res.result.bgImg
					}
					if (res.result.gender === 1) {
						this.userInfo.gender = '男'
					} else if (res.result.gender === 2) {
						this.userInfo.gender = '女'
					} else {
						this.userInfo.gender = '保密'
					}
					if (this.userInfo.createTopicList != null) {
						this.createTopicList = this.userInfo.createTopicList
					}

					let user = {
						uid: res.result.uid,
						username: res.result.username,
						avatar: res.result.avatar,
					}
					this.userJson = JSON.stringify(user)
					uni.setNavigationBarTitle({
						title: this.userInfo.username
					});
					this.loading = false;
					this.$loading(false);
				})
			},
			goPersonalData() {
				uni.navigateTo({
					url: '/pages/user/edit-info/edit'
				});
			},
			goIntegral() {
				uni.navigateTo({
					url: '/pages/sign/integral'
				})
			},
			goAccount() {
				uni.navigateTo({
					url: '/pages/account/account'
				})
			},
			goFollow() {
				uni.navigateTo({
					url: '/pages/my/follow'
				})
			},
			goFan() {
				uni.navigateTo({
					url: '/pages/my/fans'
				})
			},
			open() {
				this.openPop = true
				this.notation = this.userInfo.username
				//处理偶尔取不到当前用户信息的问题
				if (!this.loginUserInfo.username) {
					if (uni.getStorageSync('userInfo').username) {
						this.$store.state.loginUserInfo = uni.getStorageSync('userInfo')
					} else {
						this.$H.get('user/userInfo').then(res => {
							this.$store.state.loginUserInfo = res.result;
							this.message = '你好,我是' + res.result.username
						});
					}
				}
				this.message = '你好,我是' + this.$store.state.loginUserInfo.username

			},
			outPop() {
				this.openPop = false
			},
			//发送好友申请
			submitPop() {
				if (this.notation.trim() === '') {
					uni.showToast({
						title: '备注不允许为空',
						icon: 'none'
					})
					return
				}
				if (this.notation.trim().length > 20 || this.message.trim().length > 20) {
					uni.showToast({
						title: '字数不要超过20个字',
						icon: 'none'
					})
					return
				}
				// if (!$store.state.isSocketOpen) {
				// 	websocket.initConnect()
				// }
				if (!this.loginUserInfo.uid) {
					uni.showToast({
						title: '你的账号信息过期请重新登录',
						icon: 'none'
					})
					return
				}
				//构造websocket消息
				let m = {
					senderId: this.loginUserInfo.uid,
					senderName: this.loginUserInfo.username,
					senderAvatar: this.loginUserInfo.avatar,
					receiverId: this.userInfo.uid,
					notation: this.notation.trim(),
					applyMessage: this.message.trim()
				}
				let msg = {
					type: 'person-apply',
					data: m
				}
				let that = this
				uni.sendSocketMessage({
					data: JSON.stringify(msg),
					success() {
						uni.showToast({
							icon: 'success',
							title: '发送成功'
						})
						that.openPop = false
					},
					fail(res) {
						setTimeout(function() {
							that.retrySubmit();
						}, 1200);
					}
				})
			},
			//尝试重连 直接请求接口
			retrySubmit() {
				console.log('发起申请好友接口请求')
				let m = {
					senderId: this.loginUserInfo.uid,
					senderName: this.loginUserInfo.username,
					senderAvatar: this.loginUserInfo.avatar,
					receiverId: this.userInfo.uid,
					notation: this.notation.trim(),
					applyMessage: this.message.trim()
				}
				let msg = {
					type: 'person-apply',
					data: m
				}
				this.$H.post('friend/applyFriend', msg).then(res => {
					if (res.code == 0) {
						uni.showToast({
							icon: 'success',
							title: '发送成功'
						})
					}
					this.openPop = false
				})

			},
			//跳转聊天页面
			gotoChat() {
				for (let i = 0; i < this.sessionList.length; i++) {
					if (this.sessionList[i].chattingUserId == this.userInfo.uid) {
						$store.state.chattingUserInfo = this.sessionList[i]
						break;
					}
				}
				this.$H.post('chat/list', {
					sessionId: $store.state.chattingUserInfo.sessionId,
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

			},
			handleUpdateUserInfo(userInfo) {
				console.log('handleUpdateUserInfo', userInfo);
				this.info = userInfo;
			},
		}
	}
</script>
<style>
	page {
		background-color: #FFFFFF;
	}
</style>
<style lang="scss" scoped>
	.container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		padding: 0;
		margin: 0;
		color: black;
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

	.page-top {
		width: 750rpx;
		padding: 30rpx;
		color: black;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		margin-top: 120rpx;

		.first-floor {
			display: flex;
			justify-content: space-between;
		}

		.avatar {
			margin-top: -100rpx;
		}

		.some-btn {
			display: flex;
			align-items: center;

			.num-name {
				width: 150rpx;

				.num {
					font-size: 32rpx;
					font-weight: 600;
					line-height: 45rpx;
				}

				.name {
					margin-top: 2rpx;
					font-size: 24rpx;
					line-height: 28rpx;
				}
			}

			.watch-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 60rpx;
				width: 124rpx;
				height: 54rpx;
				background-color: rgba(0, 0, 0, 0.6);
				border: 2rpx solid rgba(255, 255, 255, 0.6);
				border-radius: 100rpx;
				font-size: 24rpx;
				font-weight: 600;
			}

			.follow-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 60rpx;
				width: 124rpx;
				height: 54rpx;
				background-color: #f5f5f5;
				color: #544949;
				border: 2rpx solid rgba(255, 255, 255, 0.6);
				border-radius: 100rpx;
				font-size: 24rpx;
				font-weight: 600;
			}

			.chatButton {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 10rpx;
				width: 124rpx;
				height: 54rpx;
				background-color: #5f6166;
				border: 2rpx solid rgba(172, 172, 172, 0.6);
				border-radius: 100rpx;
				font-size: 24rpx;
				font-weight: 600;
			}
		}
	}

	.page-mid {
		display: flex;
		justify-content: space-around;
		padding-top: 50rpx;
		margin-top: 42rpx;
		width: 750rpx;
		height: 180rpx;
		background-color: #F9F9F9;
		border-top-left-radius: 30rpx;
		border-top-right-radius: 30rpx;
	}

	.swiper-container {
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;

		.tabs {
			z-index: 100;
			position: sticky;
			top: 0;
		}

		.swiper {
			height: 1000px;
		}
	}

	.id {
		width: 128rpx;
		height: 44rpx;
		line-height: 44rpx;
		background: #F8FAFF;
		border-radius: 8rpx;
		font-weight: 400;
		font-size: 22rpx;
		color: black;
		text-align: center;
		margin: $gap 0;
	}

	.bottom-btn {
		display: flex;
		gap: 20rpx;
		margin-top: $gap;

		view {
			width: 328rpx;
			height: 68rpx;
			background: #F8FAFF;
			border-radius: 8rpx;
			color: black;
			font-weight: 600;
			font-size: 28rpx;
			color: #333333;
			line-height: 68rpx;
			text-align: center;
		}
	}

	.image3 {
		width: 75rpx;
		height: 30rpx;
		margin-left: 5rpx;
	}

	.informationShow-box {
		.flex-items {
			input {
				padding-left: 16upx;
			}
		}

		.phoneStyle {
			input {
				background: #EEEEEE;
				color: #999999;
			}
		}

		.informationShow-centent {
			width: 520upx;
			height: 550upx;

			.remark {
				border: 1upx solid #DDDDDD;
				width: 300upx;
				height: 48upx;
			}

			.nick {
				border: 1upx solid #DDDDDD;
				width: 300upx;
				height: 48upx;
			}

			.massageDes-but {
				position: absolute;
				bottom: 0;
			}

			.exitBut {
				border: 1upx solid #E5E5E5;
				width: 260upx;
				height: 90upx;
				text-align: center;
				line-height: 90upx;
			}

			.submitbut {
				background-color: #323232;
				width: 260upx;
				height: 90upx;
				text-align: center;
				line-height: 90upx;
				color: #FFFFFF;
			}
		}
	}

	.button {
		width: 328rpx;
		height: 80rpx;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		border-radius: 16rpx;
		position: fixed;
		bottom: 50rpx;
		left: 50%;
		transform: translateX(-50%);
		font-weight: bold;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 80rpx;
		text-align: center;
	}
</style>