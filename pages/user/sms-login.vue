<template>
	<view class="container flex-items-plus flex-column">
		<view class="login-logoBox">
			<image class="login-logo" :src="logoUrl"></image>
		</view>
		<view class="iphoneNum-box flex-row-plus flex-items">
			<view style="margin-right: 30rpx">
				<image class="loginIcon" src="../static/images/phone.png"></image>
			</view>
			<view>
				<input v-model="form.mobile" placeholder-class="iphoneNum-input" type="number" maxlength='11'
					placeholder="请输入您的手机号" />
			</view>
		</view>
		<view class="flex-row-plus mar-top-20">
			<view class="code-box">
				<view style="margin-right: 30rpx">
					<image class="loginIcon" src="../static/images/code.png"></image>
				</view>
				<view>
					<input v-model="form.code" placeholder-class="codeNum-input" placeholder="请输入验证码" />
				</view>
			</view>
			<view :class="disabled === true ? 'on' : ''" :disabled="disabled" class="getcode" @click="getCode">
				{{ text }}
			</view>
		</view>
		<view class="mar-top-60">
			<view class="registerBut mar-top-100" @click="phoneLogin">登录
			</view>
		</view>
		<view class="flex-row-plus mar-top-30">
			<text class="font-colors">还没有账号，</text>
			<view class="register-text" @click="goRegister">去注册</view>
		</view>
		<!-- 上线后注释下面内容 -->
		<view class="mar-top-60" v-if="smsOpen!='0'">
			演示站点输入任意手机号即可返回验证码
		</view>
	</view>
</template>



<script>
	import sendVerifyCode from "@/mixins/SendVerifyCode";
	import websocket from '@/utils/websocket.js';
	import $store from '@/store/index.js';
	export default {
		data() {
			return {
				form: {
					mobile: "",
					code: ""
				},
				logoUrl: "",
				smsOpen: '0'

			};
		},
		mixins: [sendVerifyCode],
		onLoad(options) {
			this.getSysInfo();

			if (options && options.loginId) {
				$store.state.loginId = options.loginId;
			}
		},
		methods: {
			getSysInfo() {
				this.$H.get('system/loginBasic').then(res => {
					this.logoUrl = res.logo;
					this.smsOpen = res.smsOpen;
				});
			},
			phoneLogin() {
				if (this.form.mobile == '') {
					this.$u.toast('请输入手机号');
					return;
				} else if (this.form.code == '') {
					this.$u.toast('请输入验证码');
					return;
				}
				uni.showLoading({
					mask: true,
					title: '登录中'
				});
				this.$H.post("user/smsLogin", this.form).then(res => {
					if (res.code == 0) {
						uni.setStorageSync("hasLogin", true);
						uni.setStorageSync("token", res.token);
						$store.state.token = res.token;
						
						// 如果loginId存在，则调用接口进行大屏登录
						if ($store.state.loginId) {
							this.$H.post("/user/webSetToken", {
								token: res.token,
								webLoginId: $store.state.loginId
							}).then(res => {
								// 将loginId清空
								$store.state.loginId = '';
							}).catch(err => {
								
							});
						}
						
						this.getUserInfo();
						const pages = getCurrentPages();
						if (pages && pages.length > 1) {
							const prevPage = pages[pages.length - 2];
							if (prevPage && prevPage.route !== 'pages/user/register') {
								uni.navigateBack();
							} else {
								uni.switchTab({
									url: '/main/my/my'
								});
							}
						} else {
							uni.switchTab({
								url: '/main/my/my'
							});
						}
					}
					uni.hideLoading();
				})
			},
			getUserInfo() {
				this.$H.get("user/userInfo").then(res => {
					
					$store.state.loginUserInfo = res.result;
					uni.setStorageSync("userInfo", res.result)
					//连接websocket
					websocket.initConnect();
					//获取好友列表
					$store.dispatch('getFriendList');
					///获取通知消息
					$store.dispatch('getNoticeList');
					this.visitor();
				})
			},
			goRegister() {
				uni.navigateTo({
					url: 'register'
				})
			},
			getCode() {
				if (this.disabled) return;
				let phoneCodeVerification = /^[1][3-9][0-9]{9}$/;
				if (this.form.mobile == '') {
					this.$u.toast('请输入手机号');
				} else if (!phoneCodeVerification.test(this.form.mobile)) {
					this.$u.toast('请输入规范的手机号');
				} else {
					uni.showLoading({
						title: '正在获取验证码'
					})

					this.$H.post("user/sendLoginSmsCode", {
						mobile: this.form.mobile
					}).then(res => {
						if (res.code == 0) {
							uni.hideLoading();
							this.sendCode();
							uni.showToast({
								title: res.msg,
								icon: 'none',
								duration: 5000,
							})
						} else {
							uni.hideLoading();
							this.$u.toast(res.msg);
							var that = this;
							setTimeout(function() {
								uni.navigateTo({
									url: "/pages/user/register?mobile=" + that.form.mobile
								});
							}, 1500);
						}
					})

				}
			},
			visitor(){
				//访问统计
				var terminal='other'
				// #ifdef APP
				terminal='App'
				// #endif
				// #ifdef H5
				terminal='H5'
				// #endif
				// #ifdef MP
				terminal='miniapp'
				// #endif
				this.$H.post('user/visitor',{
					'terminal':terminal
				}).then(res => {});
			},

		}
	}
</script>

<style lang="scss" scoped>
	.container {
		background-color: #FFFFFF;
		height: 100vh;

		.login-logoBox {
			margin-top: -300rpx;

			.login-logo {
				width: 200rpx;
				height: 200rpx;
			}
		}

		.iphoneNum-box {
			margin-top: 100rpx;
			border-bottom: 1rpx solid #DDDDDD;
			height: 100rpx;
			width: 600rpx;

			.loginIcon {
				width: 40rpx;
				height: 53rpx;
			}

			.iphoneNum-input {
				color: #999999;
				font-size: 28rpx;
				font-weight: 400;
			}
		}

		.passwordNum-box {
			border-bottom: 1rpx solid #DDDDDD;
			height: 100rpx;
			width: 600rpx;

			.passwordNum-input {
				color: #999999;
				font-size: 28rpx;
				font-weight: 400;
				width: 346rpx;
			}
		}

		.code-box {
			border-bottom: 1rpx solid #DDDDDD;
			height: 100rpx;
			width: 360rpx;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			.loginIcon {
				width: 44rpx;
				height: 50rpx;
			}

			.code-lab {
				width: 200rpx;
			}

			.codeNum-input {
				color: #999999;
				font-size: 28rpx;
				font-weight: 400;
			}
		}

		.getcode {
			background-color: #a4a6a8;
			height: 100rpx;
			width: 230rpx;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			margin-left: 20rpx;
			color: #FFFFFF;
		}

		.registerBut {
			background: #333333;
			color: #efece8;
			height: 100rpx;
			width: 600rpx;
			text-align: center;
			line-height: 100rpx;
			margin-top: 30rpx;
		}
	}

	.font-colors {
		color: #adaca9;
	}
	.register-text {
		color: #8b857d;
	}
</style>
