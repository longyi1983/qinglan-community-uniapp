<template>
	<view>
		<view class="login">
			<image class="logo" :src="shareCover"></image>
			<text class="txt1">申请获取手机号登录</text>
			<text class="txt2">根据《网络安全法》等规定发帖评论等需要先绑定手机号哦</text>
			<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"
				style="background: #323232;color: #fff;margin-left: 20rpx;margin-right: 20rpx;border-radius: 40rpx;margin-bottom: 16rpx;">
				手机号授权</button>
			<text class="txt3" @click="goBack">暂不登录</text>
		</view>
		<weixinLogin :showPop="showPop" @info="updateWxInfo" @close="closePop"></weixinLogin>
		<!-- 用户隐私协议 -->
		<u-popup mode="center" mask-close-able="false" v-model="showPrivacy">
			<view class="popup-box">
				<view class="lf_privacy_title">
					{{ title }}
				</view>
				<view class="lf_privacy_content">
					<text class="lf_privacy_txt">{{ desc1 }}</text>
					<text class="lf_privacy_txt lf_privacy_color" @click="openPrivacyContract">
						{{ urlTitle }}
					</text>
					<text class="lf_privacy_txt">{{ desc2 }}</text>
				</view>
				<view class="lf_privacy_btn">
					<button class="lf_privacy_btn_refuse" @click="handleDisagree">拒绝</button>
					<button id="agree-btn" type="default" open-type="agreePrivacyAuthorization"
						class="lf_privacy_btn_refuse agree"
						@agreeprivacyauthorization="handleAgreePrivacyAuthorization">同意</button>
				</view>
			</view>
		</u-popup>
		
		<!-- 公众号二维码弹窗 -->
		<u-popup mode="center" mask-close-able="false" v-model="showWechatPopup">
			<view class="wechat-popup-box">
				<!-- 关闭按钮 -->
				<view class="close-btn" @click="closeWechatPopup">
					<text class="close-icon">×</text>
				</view>
				
				<!-- 头部图标 -->
				<view class="wechat-header">
					<view class="wechat-title">关注我们的公众号</view>
					<view class="wechat-subtitle">获取最新资讯和更多精彩内容</view>
				</view>
				
				<!-- 二维码区域 -->
				<view class="qrcode-container">
					<view class="qrcode-frame">
						<image class="wechat-qrcode" :src="wechatQrCode" mode="aspectFit" show-menu-by-longpress></image>
						<view class="scan-corners">
							<view class="corner corner-tl"></view>
							<view class="corner corner-tr"></view>
							<view class="corner corner-bl"></view>
							<view class="corner corner-br"></view>
						</view>
					</view>
					<view class="qrcode-tip">
						<text class="tip-icon">👆</text>
						<text class="tip-text">长按识别二维码关注</text>
					</view>
				</view>
				
				<!-- 底部按钮 -->
				<view class="bottom-actions">
					<button class="action-btn primary" @click="closeWechatPopup">
						<text class="btn-text">我知道了</text>
					</button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import websocket from '@/utils/websocket.js';
	import $store from '@/store/index.js';
	import weixinLogin from "@/components/weixin-login/weixin-login.vue"
	export default {
		components: {
			weixinLogin
		},
		data() {
			return {
				domain: this.$H.domain,
				shareCover: "",
				showPop: false,
				showPrivacy: false,
				showWechatPopup: false,
				wechatQrCode: "",
				isNewUser: false, // 标记是否为新注册用户
				title: "用户隐私保护提示",
				desc1: "感谢您使用本产品，您使用本产品前应当仔细阅读并同意",
				urlTitle: "《小程序隐私保护指引》",
				desc2: "当您点击同意并开始使用产品服务时，即表示你已理解并同意该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法更好的体验产品。",
				inviteCode: ""
			};
		},

		onLoad(option) {
			// 获取URL中的邀请码参数
			if (option && option.inviteCode) {
				this.inviteCode = option.inviteCode;
			}
			this.getSysInfo();
			if (wx.getPrivacySetting) {
				wx.getPrivacySetting({
					success: res => {
						console.log("是否需要授权：", res.needAuthorization, "隐私协议的名称为：", res.privacyContractName)
						if (res.needAuthorization) {
							this.showPrivacy = true
						} else {
							//如果已经授权过的话，那么直接走登录流程
							this.login();
						}
					},
					fail: () => {},
					complete: () => {},
				})
			} else {
				this.login();
			}
		},
		onShow() {

		},
		methods: {
			visitor() {
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
			},
			openPrivacyContract() {
				uni.openPrivacyContract({});
			},
			handleAgreePrivacyAuthorization() {
				this.showPrivacy = false;
				this.login()
			},
			handleDisagree() {
				this.showPrivacy = false;
				uni.switchTab({
					url: '/main/index/index'
				});
			},
			goBack() {
				uni.switchTab({
					url: '/main/index/index'
				})
			},
			getSysInfo() {
				this.$H.get("system/miniConfig").then(res => {
					this.shareCover = res.result.intro;
				})
			},
			async login() {
				let that = this;
				let loginCode = await this.getLoginCode();
				that.$H.post('user/miniWxLogin', {
					code: loginCode,
				}).then(res2 => {
					if (res2.code === 0) {
						uni.setStorageSync("hasLogin", true);
						uni.setStorageSync("token", res2.token);
						$store.state.token = res2.token;
						// 调用store的mutations的login
						$store.commit('login');
						that.getUserInfo();
					} else if (res2.code == 999) {
						console.log('手机号待获取')
						uni.hideLoading();
					}

				})
			},
			getUserInfo() {
				uni.showLoading({
					title: "自动登录中"
				})
				this.$H.get("user/userInfo").then(res => {
					$store.state.loginUserInfo = res.result;
					uni.setStorageSync("userInfo", res.result)
					//连接websocket
					websocket.initConnect();
					//获取好友列表
					$store.dispatch('getFriendList');
					///获取通知消息
					$store.dispatch('getNoticeList');
					uni.hideLoading()
					this.visitor(); //访问统计
					let name = res.result.username
					//如果微信名称是默认的，那么需要弹框提醒用户设置昵称和用户名
					if (name.includes("LF_")) {
						this.showPop = true
					} else {
						// 重定向到上一页
						this.redirectToPreviousPage();
					}

				})
			},
			getLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: function(loginRes) {
							resolve(loginRes.code);
						}
					});
				});
			},

			getPhoneNumber(e) {
				if (e.detail.errMsg === "getPhoneNumber:ok") {
					console.log(e)
					uni.login({
						provider: 'weixin',
						success: (res) => {
							this.$H.post('user/getSessionKey', {
								code: res.code
							}).then(res1 => {
								if (res1.code == 0) {
									this.$H.post('user/bindWxPhone', {
										wechatOpenId: res1.openid,
										sessionKey: res1.session_key,
										encryptedData: e.detail.encryptedData,
										iv: e.detail.iv,
									}).then(res2 => {
										uni.setStorageSync("hasLogin", true);
										uni.setStorageSync("token", res2.result.token);
										$store.state.token = res2.result.token;
										// 调用store的mutations的login
										$store.commit('login');
										// 标记为新注册用户
										this.isNewUser = true;
										// 处理邀请码
										if (this.inviteCode) {
											this.$H.post('qlInviteLog', {
												invitationCode: this.inviteCode
											}).then(res => {
												console.log('处理邀请码结果:', res);
											});
										}

										// 先显示用户信息设置弹窗，而不是公众号弹窗
										this.showPop = true;
										this.visitor(); //访问统计
									})
								}
							})

						},
						fail: () => {
							uni.showToast({
								title: "微信登录授权失败",
								icon: "none"
							});
						}
					})
				} else {
					uni.showToast({
						title: "获取手机授权失败",
						icon: "none"
					});
				}

			},
			closePop() {
				this.showPop = false
				// 如果是新注册用户，显示公众号弹窗
				if (this.isNewUser) {
					this.getWechatQrCode();
				} else {
					const pages = getCurrentPages()
					this.redirectToPreviousPage()
				}
			},
			updateWxInfo(obj) {
				var that = this;
				this.$H.post("user/userInfoEdit", {
					avatar: obj.avatarUrl,
					username: obj.nickName
				}).then(res => {
					if (res.code == 0) {
						that.userInfo()
					}
				})

			},
			userInfo() {
				this.$H.get("user/userInfo").then(res => {
					$store.state.loginUserInfo = res.result
					uni.setStorageSync("userInfo", res.result)
					this.showPop = false
					// 如果是新注册用户，显示公众号弹窗
					if (this.isNewUser) {
						this.getWechatQrCode();
					} else {
						this.redirectToPreviousPage()
					}
				})
			},

			// 智能重定向到上一页的方法
			redirectToPreviousPage() {
				const pages = getCurrentPages();

				if (pages && pages.length > 1) {
					// 有上一页，获取上一页信息
					const prevPage = pages[pages.length - 2];
					const currentPage = pages[pages.length - 1];

					console.log('当前页面:', currentPage.route);
					console.log('上一页面:', prevPage.route);

					// 检查上一页是否是登录相关页面，如果是则跳转到首页
					const loginPages = [
						'pages/user/login',
						'pages/user/go-login',
						'pages/user/sms-login',
						'pages/user/register'
					];

					if (loginPages.includes(prevPage.route)) {
						// 上一页是登录相关页面，跳转到首页
						console.log('上一页是登录页面，跳转到首页');
						uni.switchTab({
							url: '/main/index/index'
						});
					} else {
						// 上一页是正常页面，返回上一页
						console.log('返回上一页');

						// 构建包含参数的完整URL
						let fullUrl = '/' + prevPage.route;

						// 如果上一页有参数，需要重新构建完整的URL
						if (prevPage.options && Object.keys(prevPage.options).length > 0) {
							const params = [];
							for (const key in prevPage.options) {
								if (prevPage.options[key] !== undefined && prevPage.options[key] !== null) {
									params.push(`${key}=${encodeURIComponent(prevPage.options[key])}`);
								}
							}
							if (params.length > 0) {
								fullUrl += '?' + params.join('&');
							}
						}

						console.log('重定向到完整URL:', fullUrl);

						uni.redirectTo({
							url: fullUrl,
							fail: () => {
								// 如果redirectTo失败，尝试switchTab（可能是tabBar页面）
								uni.switchTab({
									url: fullUrl,
									fail: () => {
										// 都失败了，就直接navigateBack
										uni.navigateBack();
									}
								});
							}
						});
					}
				} else {
					// 没有上一页（比如直接进入或清空了页面栈），跳转到首页
					console.log('没有上一页，跳转到首页');
					uni.switchTab({
						url: '/main/index/index'
					});
				}
			},
			
			// 获取公众号二维码
			getWechatQrCode() {
				this.wechatQrCode = this.$f.geturl('/uniapp/new/poster/login.png');
				this.showWechatPopup = true;
			},
			
			// 关闭公众号弹窗
			closeWechatPopup() {
				this.showWechatPopup = false;
				// 弹窗关闭后，直接跳转到上一页或首页
				this.redirectToPreviousPage();
			},

		}
	}
</script>

<style lang="scss" scoped>
	.login {
		display: flex;
		flex-direction: column;
		padding: 100rpx;
	}

	.login .logo {
		width: 230rpx;
		height: 230rpx;
		margin: 50rpx auto;
	}

	.login .txt1 {
		margin-bottom: 10rpx;
	}

	.login .txt2 {
		margin-bottom: 50rpx;
	}

	.login .txt3 {
		color: #8c8c8c;
		margin-bottom: 90rpx;
		text-align: center;
	}

	.user-avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		margin: 50rpx auto;
	}

	.user-name {
		font-size: 35rpx;
		font-family: PingFang SC;
		font-weight: bold;
		color: #000;
		margin: 50rpx auto;
	}

	.popup-box {
		width: 80vw;
		overflow: hidden;
		background: #ffffff;
		padding: 30rpx;
		border-radius: 24rpx;

		.lf_privacy_title {
			font-size: 48rpx;
			font-family: Source Han Sans CN-Bold, Source Han Sans CN;
			font-weight: bold;
			color: #000000;
			line-height: 56rpx;
			text-align: center;
		}

		.lf_privacy_content {
			margin-top: 48rpx;
			text-indent: 2em;

			.lf_privacy_txt {
				font-size: 28rpx;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 400;
				color: #000000;
				line-height: 33rpx;
			}
		}

		.lf_privacy_btn {
			display: flex;
			justify-content: space-evenly;
			align-items: center;
			margin-top: 48rpx;

			.lf_privacy_btn_refuse {
				padding: 0 60rpx;
				margin: 0;
				background: none;
				font-size: 32rpx;
				font-family: Source Han Sans CN-Normal, Source Han Sans CN;
				font-weight: 400;
				color: #000000;
				line-height: 80rpx;
			}

			.agree {
				color: #ffffff;
				background: #00aa00;
			}
		}

		.lf_privacy_color {
			color: #aaaaff !important;
		}
	}

	.wechat-popup-box {
		width: 85vw;
		max-width: 600rpx;
		background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
		border-radius: 32rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
		position: relative;
		overflow: hidden;

		// 关闭按钮
		.close-btn {
			position: absolute;
			top: 20rpx;
			right: 20rpx;
			width: 60rpx;
			height: 60rpx;
			background: rgba(0, 0, 0, 0.05);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10;
			transition: all 0.3s ease;

			&:active {
				background: rgba(0, 0, 0, 0.1);
				transform: scale(0.95);
			}

			.close-icon {
				font-size: 36rpx;
				color: #666;
				line-height: 1;
			}
		}

		// 头部区域
		.wechat-header {
			padding: 60rpx 40rpx 40rpx;
			text-align: center;

			.wechat-icon {
				margin-bottom: 20rpx;
			}

			.wechat-title {
				font-size: 44rpx;
				font-weight: 600;
				color: #1a1a1a;
				line-height: 1.3;
				margin-bottom: 12rpx;
			}

			.wechat-subtitle {
				font-size: 26rpx;
				color: #666;
				line-height: 1.4;
			}
		}

		// 二维码容器
		.qrcode-container {
			text-align: center;

			.qrcode-frame {
				position: relative;
				display: inline-block;
				padding: 30rpx;
				background: #ffffff;
				border-radius: 24rpx;
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
				margin-bottom: 30rpx;

				.wechat-qrcode {
					width: 500rpx;
					height: 667rpx;
					border-radius: 16rpx;
					display: block;
				}

				// 扫描框四角
				.scan-corners {
					position: absolute;
					top: 20rpx;
					left: 20rpx;
					right: 20rpx;
					bottom: 20rpx;
					pointer-events: none;

					.corner {
						position: absolute;
						width: 40rpx;
						height: 40rpx;
						border: 4rpx solid #07c160;

						&.corner-tl {
							top: 0;
							left: 0;
							border-right: none;
							border-bottom: none;
							border-radius: 8rpx 0 0 0;
						}

						&.corner-tr {
							top: 0;
							right: 0;
							border-left: none;
							border-bottom: none;
							border-radius: 0 8rpx 0 0;
						}

						&.corner-bl {
							bottom: 0;
							left: 0;
							border-right: none;
							border-top: none;
							border-radius: 0 0 0 8rpx;
						}

						&.corner-br {
							bottom: 0;
							right: 0;
							border-left: none;
							border-top: none;
							border-radius: 0 0 8rpx 0;
						}
					}
				}
			}

			.qrcode-tip {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				margin-bottom: 40rpx;

				.tip-icon {
					font-size: 32rpx;
					animation: bounce 2s infinite;
				}

				.tip-text {
					font-size: 28rpx;
					color: #666;
				}
			}
		}

		// 底部按钮区域
		.bottom-actions {
			padding: 0 40rpx 50rpx;

			.action-btn {
				width: 100%;
				height: 88rpx;
				border-radius: 44rpx;
				border: none;
				background: linear-gradient(135deg, #07c160 0%, #00a655 100%);
				box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
				margin: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
				}

				.btn-text {
					font-size: 32rpx;
					font-weight: 500;
					color: #ffffff;
				}
			}
		}
	}

	// 动画效果
	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-8rpx);
		}
		60% {
			transform: translateY(-4rpx);
		}
	}
</style>