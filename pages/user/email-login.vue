<template>
	<view class="container flex-items-plus flex-column">
		<view class="login-logoBox">
			<image class="login-logo" :src="logoUrl"></image>
		</view>
		<view class="iphoneNum-box flex-row-plus flex-items">
			<view style="margin-right: 30rpx">
				<image class="loginIconEmail" src="../static/images/email.png"></image>
			</view>
			<view>
				<input v-model="form.email" placeholder-class="iphoneNum-input" maxlength='30' placeholder="请输入您的邮箱" />
			</view>
		</view>
		<view class="flex-row-plus mar-top-20">
			<view class="code-box">
				<view style="margin-right: 30rpx">
					<image class="loginIcon" src="../static/images/code.png"></image>
				</view>
				<view>
					<input v-model="form.code" placeholder-class="codeNum-input" placeholder="请输入邮箱验证码" />
				</view>
			</view>
			<view :class="disabled === true ? 'on' : ''" :disabled="disabled" class="getcode" @click="getCode">
				{{ text }}
			</view>
		</view>
		<view class="mar-top-60" v-if="type=='auth'">
			<view class="registerBut mar-top-100" @click="bindEmail">绑定邮箱</view>
		</view>
		<view class="mar-top-60" v-else>
			<view class="registerBut mar-top-100" @click="phoneLogin" v-if="openEmailRegister=='0'">邮箱登录
			</view>
			<view class="registerBut mar-top-100" @click="phoneLogin" v-if="openEmailRegister=='1'">邮箱登录/注册
			</view>
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
					email: "",
					code: ""
				},
				logoUrl: "",
				emailLogin: "",
				openEmailRegister: "",
				type:''
			};
		},
		mixins: [sendVerifyCode],
		onLoad(options) {
			if(options.type=='auth'){
				this.type='auth'
			}
			this.getSysInfo();
		},
		onShow() {
			this.getSysInfo();
		},
		methods: {
			getSysInfo() {
				this.$H.get('system/config').then(res => {
					this.logoUrl = res.logoUrl;
					this.emailLogin = res.emailLogin;
					this.openEmailRegister = res.openEmailRegister;
					if (this.emailLogin == '0') {
						if(this.type=='auth'){
							this.$u.toast("邮箱登录未开启,无法绑定");
							setTimeout(function() {
								uni.switchTab({
									url:"/pages/my/my"
								})
							}, 1000);
						}else{
							this.$u.toast("邮箱登录未开启");
							setTimeout(function() {
								uni.navigateTo({
									url: "/pages/user/sms-login"
								});
							}, 1000);
						}
						
					}

				});
			},
			bindEmail(){
				if (this.form.email == '') {
					this.$u.toast('请输入邮箱');
					return;
				} else if (this.form.code == '') {
					this.$u.toast('请输入验证码');
					return;
				}
				uni.showLoading({
					mask: true,
					title: '校验中'
				});
				this.$H.post("user/bindEmail", this.form).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						uni.navigateBack();
					}else{
						this.$u.toast(res.msg);
					}
				})
			},
			phoneLogin() {
				if (this.form.email == '') {
					this.$u.toast('请输入邮箱');
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
						uni.switchTab({
							url: '/pages/index/index'
						});
						this.getUserInfo();
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
				})
			},
			getCode() {
				if (this.disabled) return;
				//验证邮箱的正则表达式
				var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
				if (this.form.email == '') {
					this.$u.toast('请输入邮箱');
				} else if (!emailRegExp.test(this.form.email)) {
					this.$u.toast('请输入规范的邮箱');
				} else {
					uni.showLoading({
						title: '正在获取邮箱验证码'
					})

					this.$H.post("user/sendEmailCode", {
						email: this.form.email
					}).then(res => {
						if (res.code == 0) {
							uni.hideLoading();
							this.sendCode();
							uni.showToast({
								title: res.msg,
								icon: 'none',
								duration: 3000,
							})
						}
					})

				}
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

			.loginIconEmail {
				width: 53rpx;
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
</style>