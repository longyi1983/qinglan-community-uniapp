<template>
	<view class="container">
		<view class="rules-section">
			<view class="rules-title">青蓝币提现规则</view>
			<view class="rules-content">
				<view class="rule-item">1. 钱包需保留 500 青蓝币保底,若有550青蓝币,仅能提现50;</view>
				<view class="rule-item">2. 青蓝币不足500时,则无法提现哦~</view>
			</view>
		</view>
		<view class="item">
			<view class="left">
				提现金额（青蓝币）
			</view>
			<view class="right">
				<u-input v-model="form.amount" placeholder="请输入提现金额" type="number" :min="0" @input="handleAmountInput"/>
			</view>
		</view>
		<view class="item">
			<view class="left">
				提现手机号
				<view class="code" :class="disabled ? 'disabled' : ''" :disabled="disabled" @click="getCode">
					{{text}}
				</view>
			</view>
			<view class="right">
				<u-input v-model="form.phone" placeholder="请输入手机号" />
			</view>
		</view>
		<view class="item">
			<view class="left">
				提现验证码
			</view>
			<view class="right">
				<u-input v-model="form.code" placeholder="请输入验证码" />
			</view>
		</view>
		<view class="bottom">
			<view class="button" @click="submitWithdrawal">
				确认提现
			</view>
		</view>
		<u-popup v-model="showPopup" mode="center" @close="handlePopupClose" border-radius="24">
			<view class="popup-content">
				<view class="popup-title success">申请成功</view>
				<view class="popup-title">请添加客服微信进行审核</view>
				<view class="popup-desc">长按识别下方二维码添加客服微信，完成审核后提现将到账。</view>
				<image v-if="serviceQrcode" :src="serviceQrcode" class="popup-qrcode" mode="aspectFit" show-menu-by-longpress @click="previewQrcode" />
				<view v-if="serviceWechat" class="popup-wechat-row">
					<text class="popup-wechat-label">微信号：</text>
					<text class="popup-wechat-value">{{ serviceWechat }}</text>
					<view class="popup-copy-btn" @click="copyWechat">复制</view>
				</view>
				<view class="popup-btn" @click="goList">我知道了</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import sendVerifyCode from "@/mixins/SendVerifyCode";
export default {
	data() {
		return {
			form: {
				amount: '',
				phone: '',
				code: ''
			},
			showPopup: false,
			serviceQrcode: '',
			serviceWechat: ''
		};
	},
	mixins: [sendVerifyCode],
	methods: {
		goList() {
			this.showPopup = false;
			uni.navigateTo({
				url: '/personal/partner/withdrawal/list'
			})
		},
		getCode() {
			if (this.disabled) return;
			let phoneCodeVerification = /^[1][3-9][0-9]{9}$/;
			if (this.form.phone == '') {
				this.$u.toast('请输入手机号');
			} else if (!phoneCodeVerification.test(this.form.phone)) {
				this.$u.toast('请输入规范的手机号');
			} else {
				uni.showLoading({
					title: '正在获取验证码'
				})
				this.$H.post("user/sendSmsCode", {
					mobile: this.form.phone
				}).then(res => {
					if (res.code == 0) {
						uni.hideLoading();
						this.sendCode();
						uni.showToast({
							title: res.msg,
							icon: 'none',
							duration: 3500,
						})
					}
				})
			}
		},
		submitWithdrawal() {
			if (this.form.amount === '' || this.form.phone === '' || this.form.code === '') {
				uni.showToast({
					title: "请填写完整信息",
					icon: "none"
				})
				return;
			}
			if (Number(this.form.amount) < 0) {
				uni.showToast({
					title: "提现金额不能为负数",
					icon: "none"
				});
				return;
			}
			if (!Number.isInteger(Number(this.form.amount))) {
				uni.showToast({
					title: "提现金额不能为小数",
					icon: "none"
				});
				return;
			}
			this.$H.post('withdrawalApplication', this.form)
				.then(res => {
					if (res.code === 200) {
						this.$H.get('user/getContact').then(contactRes => {
							let img = '';
							let wechat = '';
							if (contactRes.code === 0) {
								if (contactRes.result.image) img = contactRes.result.image;
								if (contactRes.result.wechat) wechat = contactRes.result.wechat;
							}
							this.serviceQrcode = img;
							this.serviceWechat = wechat;
							this.showPopup = true;
						});
					} else if (res.code != 401) {
						uni.showToast({
							title: res.msg,
							icon: "error",
							duration: 2000
						})
					}
				});
		},
		handlePopupClose() {
			this.showPopup = false;
			this.form = { amount: '', phone: '', code: '' };
		},
		copyWechat() {
			if (!this.serviceWechat) return;
			uni.setClipboardData({
				data: this.serviceWechat,
				success: () => {
					uni.showToast({ title: '微信号已复制', icon: 'success' });
				}
			});
		},
		previewQrcode() {
			// 先关闭弹窗
			this.showPopup = false;
			// 等待弹窗关闭动画结束后再预览图片
			setTimeout(() => {
				uni.previewImage({
					urls: [this.serviceQrcode]
				});
			}, 300); // 300ms 视你的弹窗动画时长调整
		},
		handleAmountInput(value) {
			// 移除小数点和小数部分，只保留整数
			this.form.amount = value.replace(/\./g, '');
		}
	}
}
</script>

<style lang="scss" scoped>
	.container {
		background: #fff;
		min-height: 100vh;
	}
	
	.rules-section {
		background: #F8F9FF;
		margin: 20rpx;
		padding: 24rpx;
		border-radius: 16rpx;
		border: 1rpx solid #E9E9EF;
	}
	
	.rules-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1B1B26;
		margin-bottom: 16rpx;
	}
	
	.rules-content {
		.rule-item {
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
			margin-bottom: 8rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #E9E9EF;

		.left {
			width: 350rpx;
			font-size: 28rpx;
			font-weight: bold;
			color: #1B1B26;
			line-height: 36rpx;
			display: flex;
			align-items: center;
		}

		.right {
			flex: 1;
			text-align: right;
			display: flex;
		}

		.code {
			width: 152rpx;
			height: 52rpx;
			line-height: 52rpx;
			text-align: center;
			background: #F0F3FF;
			border-radius: 8rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #6986FD;
			margin-left: 20rpx;
		}

		.disabled {
			background: #F5F5F5;
			color: #95959D;
		}
	}

	.bottom {
		background-color: #fff;
		width: 750rpx;
		height: 150rpx;
		position: fixed;
		bottom: 0;
		left: 0;

		.button {
			width: 686rpx;
			height: 80rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
			text-align: center;
			line-height: 80rpx;
			color: #fff;
			margin: 0 auto;
		}
	}
	.popup-content {
		padding: 48rpx 32rpx 32rpx 32rpx;
		background: #fff;
		border-radius: 24rpx;
		text-align: center;
		width: 520rpx;
	}
	.popup-title {
		font-size: 32rpx;
		font-weight: 600;
		margin-bottom: 24rpx;
		color: #333;
	}
	.popup-desc {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 32rpx;
	}
	.popup-qrcode {
		width: 320rpx;
		height: 320rpx;
		margin-bottom: 16rpx;
		border-radius: 16rpx;
		background: #f6f6f6;
	}
	.popup-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		border-radius: 16rpx;
		margin-top: 8rpx;
	}
	.success {
		color: #27C16E;
		font-size: 36rpx;
		margin-bottom: 12rpx;
	}
	.popup-wechat-row {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32rpx;
	}
	.popup-wechat-label {
		font-size: 28rpx;
		color: #666;
	}
	.popup-wechat-value {
		font-size: 28rpx;
		color: #333;
		margin: 0 12rpx;
		font-weight: 600;
	}
	.popup-copy-btn {
		background: #6986FD;
		color: #fff;
		font-size: 24rpx;
		padding: 0 18rpx;
		height: 44rpx;
		line-height: 44rpx;
		border-radius: 8rpx;
		margin-left: 8rpx;
	}
</style>
