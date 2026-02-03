<script>
	import websocket from '@/utils/websocket.js';
	import $store from '@/store/index.js';
	import music from '@/utils/music.js';
	export default {
		onLaunch: function() {
			uni.hideTabBar();
			const updateManager = uni.getUpdateManager();
			updateManager.onCheckForUpdate(function(res) {
				// 请求完新版本信息的回调
			});

			updateManager.onUpdateReady(function(res) {
				uni.showModal({
					title: '更新提示',
					content: '新版本已经准备好，是否重启应用？',
					success(res) {
						if (res.confirm) {
							// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
							updateManager.applyUpdate();
						}
					}
				});

			});

			updateManager.onUpdateFailed(function(res) {
				// 新的版本下载失败
			});
			// 状态栏高度
			this.globalData.statusBarHeight = uni.getSystemInfoSync().statusBarHeight

			// #ifdef MP-WEIXIN
			// 获取微信胶囊的位置信息 width,height,top,right,left,bottom
			const custom = wx.getMenuButtonBoundingClientRect()
			this.globalData.navigationBarHeight = custom.height + (custom.top - this.globalData.statusBarHeight) * 2
			//只在微信小程序端判断机型
			let platform = uni.getSystemInfoSync().platform;
			if (platform == 'ios') {
				this.globalData.iphone = true
			}
			// #endif
			// #ifdef APP-PLUS || H5
			this.globalData.navigationBarHeight = 55
			// #endif
			// 总体高度 = 状态栏高度 + 导航栏高度
			this.globalData.navHeight = this.globalData.navigationBarHeight + this.globalData.statusBarHeight


			this.$H.get('user/isOpen').then(res => {
				this.globalData.isOpen = res.result;
			});
			//访问统计
			var terminal = 'other'
			// #ifdef APP
			terminal = 'App'
			// #endif
			// #ifdef H5
			terminal = 'H5'
			// #endif
			// #ifdef MP
			terminal = 'miniapp'
			// #endif
			this.$H.post('user/visitor', {
				'terminal': terminal
			}).then(res => {});

			// 准备背景音乐播放（等待用户交互）
			try {
				music.play(); // 这会设置autoPlay标记，等待用户交互
				console.log('背景音乐已准备，等待用户交互');
			} catch (error) {
				console.error('背景音乐准备失败:', error);
			}

			// 添加全局用户交互监听
			this.addUserInteractionListeners();

			// 添加页面可见性监听（H5端）
			this.addVisibilityListener();

		},
		onShow: function() {
			//#ifdef MP-WEIXIN
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			})
			//#endif
			// #ifdef H5
			uni.getSystemInfo({
				success(e) {
					/*兼容pc端打开H5*/
					if (e.windowWidth > 420 && !window.top.isPC && !/iOS|Android/i.test(e.system)) {
						window.location.pathname = '/static/pc/pc.html';
					}
				}
			})
			// #endif
			if (uni.getStorageSync('hasLogin')) {
				//连接websocket
				if (!$store.state.isSocketOpen) {
					websocket.initConnect();
				}
				//获取好友列表
				$store.dispatch('getFriendList');
				///获取通知消息
				$store.dispatch('getNoticeList');
			}

			// 应用显示时处理音乐播放
			try {
				const musicState = music.getPlayState();
				console.log('应用显示时的音乐状态:', musicState);

				// 如果音乐被暂停了，尝试恢复播放
				if (musicState.isPaused) {
					music.play();
					console.log('应用显示，恢复背景音乐播放');
				}

				// #ifdef APP-PLUS || MP
				// App和小程序端，每次显示时都尝试触发用户交互（确保音乐能播放）
				setTimeout(() => {
					music.handleUserInteraction();
				}, 500);
				// #endif

				// #ifdef H5
				// H5端不自动触发，严格等待用户交互
				console.log('H5端等待用户真实交互');
				// #endif
			} catch (error) {
				console.error('恢复背景音乐失败:', error);
			}
		},
		onHide: function() {
			// 应用隐藏时暂停背景音乐
			try {
				const musicState = music.getPlayState();
				if (musicState.isPlaying) {
					music.pause();
					console.log('应用隐藏，背景音乐已暂停');
				}
			} catch (error) {
				console.error('暂停背景音乐失败:', error);
			}
		},
		onPageNotFound() {
			// 跳转到 404 页面：
			uni.redirectTo({
				url: "pages/error/error"
			});
		},
		globalData: {
			isOpen: 1, //是否关闭视频功能 默认1开启 0关闭
			statusBarHeight: 0, // 状态导航栏高度
			navHeight: 0, // 总体高度
			navigationBarHeight: 0, // 导航栏高度(标题栏高度)
			iphone: false, //是否为IOS机型
		},
		methods: {
			/**
			 * 添加全局用户交互监听
			 */
			addUserInteractionListeners() {
				// #ifdef H5
				// H5端使用最简单最安全的用户交互检测
				// 只监听点击事件，避免与触摸滚动冲突
				const handleUserClick = (event) => {
					console.log('检测到点击事件，启动音乐');
					this.handleFirstUserInteraction(event);
				};

				// 监听文档点击事件
				document.addEventListener('click', handleUserClick, {
					once: true
				});

				// 监听键盘事件作为备用
				document.addEventListener('keydown', handleUserClick, {
					once: true
				});

				console.log('H5端用户交互监听器已添加（点击和键盘）');
				// #endif

				// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
				// 小程序端，延迟触发用户交互（小程序启动后通常就算有交互）
				setTimeout(() => {
					music.handleUserInteraction();
				}, 2000);
				// #endif

				// #ifdef APP-PLUS
				// App端，延迟触发用户交互
				setTimeout(() => {
					music.handleUserInteraction();
				}, 1500);
				// #endif
			},

			/**
			 * 处理首次用户交互
			 */
			handleFirstUserInteraction(event) {
				try {
					console.log('App.vue检测到用户交互事件:', event?.type || 'unknown');

					// 确保不阻止默认行为和事件传播
					// 不调用 event.preventDefault() 或 event.stopPropagation()

					music.handleUserInteraction();
					console.log('用户交互处理完成，尝试启动音乐播放');
				} catch (error) {
					console.error('处理用户交互失败:', error);
				}
			},

			/**
			 * 添加页面可见性监听
			 */
			addVisibilityListener() {
				// #ifdef H5
				if (typeof document !== 'undefined' && document.addEventListener) {
					document.addEventListener('visibilitychange', () => {
						if (!document.hidden) {
							// 页面变为可见时，延迟尝试触发用户交互
							// 这表示用户正在关注页面
							setTimeout(() => {
								const musicState = music.getPlayState();
								if (!musicState.hasUserInteracted && musicState.autoPlay) {
									console.log('页面可见，尝试激活音乐播放');
									// 不直接调用，让用户下次点击时自然触发
								}
							}, 1000);
						}
					});
					console.log('页面可见性监听器已添加');
				}
				// #endif
			}
		}
	};
</script>

<style lang="scss">
	@import "uview-ui/index.scss";
	@import "static/css/iconfont.css";

	page {
		font-size: 32rpx;
		line-height: 1.7;
	}

	.container {
		padding: 20rpx;
		overflow: hidden;
	}

	// 发布按钮
	.plus-box {
		background-color: $themes-color;
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		bottom: 60rpx;
		right: 20rpx;
		z-index: 999;
		box-shadow: 0 0 10rpx #333;
	}

	.plus-box:active {
		background-color: #999;
	}

	.f-wrap {
		padding: 20rpx;
		border-radius: 10rpx;
		box-shadow: 5rpx 5rpx 20rpx #e6e6e6;
		background-color: #FFFFFF;
		margin-bottom: 20rpx;
	}

	.f-wrap>.title {
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.f-fixed {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 20rpx 50rpx 20rpx;
		z-index: 999;
		background-color: #fff;
	}

	/* 隐藏滚动条 */
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}

	.level-img {
		width: 38rpx;
		height: 38rpx;
		margin-left: 7rpx;
		margin-bottom: 8rpx;
	}

	.level-img-2 {
		width: 38rpx;
		height: 38rpx;
	}

	.show-reward {
		width: 560rpx;
		height: 580rpx;
		border-radius: 30rpx;
		background: #e9ecf0;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: flex-end;
		position: relative;
	}

	.show-reward-image {
		position: absolute;
		top: -4rpx;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
	}

	.show-reward-pop {
		width: 340rpx;
		height: 50rpx;
		margin-top: 20rpx;
		padding: 10rpx 30rpx;
		border-radius: 8rpx;
		background: #f5f5f5;
		font-size: 30rpx;
		color: #616161;
		display: flex;
		align-items: center;
		font-weight: bold;
	}

	.show-reward-pop text {
		width: 30rpx;
	}

	.show-input-pop {
		width: 300rpx;
		height: 50rpx;
	}

	.count-input {
		font-size: 26rpx;
		color: #616161;
	}

	.show-reward-view {
		margin-top: 20rpx;
		width: 400rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.show-reward-view view {
		padding: 8rpx 24rpx;
		color: #333;
		border-radius: 8rpx;
		font-size: 28rpx;
		background: #f5f5f5;
		font-weight: bold;
	}

	.check-it {
		background: #55aaff !important;
		color: #fff !important;
	}

	.show-reward-btn {
		margin: 40rpx 0;
		width: 300rpx;
		height: 80rpx;
		border-radius: 40rpx;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
		background: #55aaff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 20px 0 #ccc;
	}

	.reward-box {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
	}

	.reward-box view {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 32rpx;
		border-radius: 70rpx;
		border: 1rpx solid #DDDDDD;
		display: flex;
		align-items: center;
		margin: 0 20rpx;
	}

	.reward-box view text {
		font-size: 28rpx;
		font-weight: 400;
	}

	.reward-box view image {
		height: 46rpx;
		width: 46rpx;
		margin-right: 30rpx;
	}

	// 付费贴公共样式
	.pay-content {
		background-color: #F8F8F9;
		padding: 20rpx;
		overflow: hidden;
		font-size: 32rpx;
		width: 100%;
		box-sizing: border-box;
		height: 140rpx;
		color: #daa054;
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;
	}

	.dynamic {
		margin-left: 3rpx;
		position: relative;
		width: 20rpx;
		display: inline-block;
		color: #daa054;

		@keyframes dynamic_tag {

			0% {
				opacity: 0;
				left: 0;
			}

			70% {
				opacity: 1;
			}

			100% {
				opacity: 0;
				left: 100%;
			}
		}

		.dy {
			position: absolute;
		}

		.dy:before,
		.dy::after {
			content: "";
			display: block;
			height: 2rpx;
			position: absolute;
			top: 0;
			left: 0;
			width: 20rpx;
			background: #daa054;
		}

		.dy:before {
			transform: rotate(-45deg);
			transform-origin: right 50%;
		}

		.dy:after {
			transform: rotate(45deg);
			transform-origin: right 50%;
		}

		.dynamic_left {
			animation: dynamic_tag 2s ease-in-out infinite;
		}

		.dynamic_right {
			animation: dynamic_tag 2s ease-in-out 1s infinite;
		}

	}

	.more-comment-btn {
		padding-left: 110rpx;
		font-weight: bold;
		margin: 10rpx 0;
		color: #2979ff;
	}

	// 布局公共样式

	.flex-items-plus {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.flex-column {
		flex-direction: column
	}

	.flex-row-plus {
		display: flex;
		flex-direction: row
	}

	.flex-items {
		display: flex;
		align-items: center;
	}

	.mar-top-30 {
		margin-top: 30upx;
	}

	.mar-top-60 {
		margin-top: 60upx;
	}

	.mar-top-100 {
		margin-top: 100upx;
	}

	.mar-left-20 {
		margin-left: 20upx;
	}

	.mar-left-40 {
		margin-left: 40upx;
	}

	.mar-top-20 {
		margin-top: 20upx;
	}

	.fs26 {
		font-size: 26upx;
	}

	/* layout */
	.acea-row {
		display: flex;
		flex-wrap: wrap;
		/* 辅助类 */
	}

	.acea-row.row-middle {
		align-items: center;
	}

	.acea-row.row-top {
		align-items: flex-start;
	}

	.acea-row.row-bottom {
		align-items: flex-end;
	}

	.acea-row.row-center {
		justify-content: center;
	}

	.acea-row.row-right {
		justify-content: flex-end;
	}

	.acea-row.row-left {
		justify-content: flex-start;
	}

	.acea-row.row-between {
		justify-content: space-between;
	}

	.acea-row.row-around {
		justify-content: space-around;
	}

	.acea-row.row-column-around {
		flex-direction: column;
		justify-content: space-around;
	}

	.acea-row.row-column {
		flex-direction: column;
	}

	.acea-row.row-column-between {
		flex-direction: column;
		justify-content: space-between;
	}

	/* 上下左右垂直居中 */
	.acea-row.row-center-wrapper {
		align-items: center;
		justify-content: center;
	}

	/* 上下两边居中对齐 */
	.acea-row.row-between-wrapper {
		align-items: center;
		justify-content: space-between;
	}
</style>