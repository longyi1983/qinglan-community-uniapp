<template>
	<view class="container">
		<view class="item">
			<view class="left">
				姓名
			</view>
			<view class="right">
				<u-input v-model="form.name" placeholder="请输入" :disabled="historyId"/>
				<u-icon name="arrow-right" color="#95959D" size="28"></u-icon>
			</view>
		</view>
		<view class="item">
			<view class="left">
				电话号码
				<view class="code" :class="disabled ? 'disabled' : ''" :disabled="disabled" @click="getCode" v-if="!historyId">
					{{text}}
				</view>
			</view>
			<view class="right">
				<u-input v-model="form.phone" placeholder="请输入" :disabled="historyId"/>
				<u-icon name="arrow-right" color="#95959D" size="28"></u-icon>
			</view>
		</view>
		<view class="item" v-if="!historyId">
			<view class="left">
				手机验证码
			</view>
			<view class="right">
				<u-input v-model="form.code" placeholder="请输入" />
				<u-icon name="arrow-right" color="#95959D" size="28"></u-icon>
			</view>
		</view>
		<view class="item">
			<view class="left">
				所在地址
			</view>
			<view class="right">
				<u-input v-model="form.address" placeholder="请输入" :disabled="historyId"/>
				<u-icon name="arrow-right" color="#95959D" size="28"></u-icon>
			</view>
		</view>
		<view class="qrcode" v-if="historyId">
			<u-image width="366rpx" height="366rpx" :src="form.qrCode"></u-image>
		</view>
		<view class="bottom" v-if="!historyId">
			<view class="button" @click="enroll">
				确认报名
			</view>
		</view>
	</view>
</template>

<script>
	import sendVerifyCode from "@/mixins/SendVerifyCode";
	export default {
		data() {
			return {
				form: {
					activityId: "",
					name: "",
					code: "",
					phone: "",
					address: ""
				},
				historyId:"",
				title: ""
			};
		},
		mixins: [sendVerifyCode],
		onLoad(option) {
			this.form.activityId = Number(option.id);
			this.historyId = Number(option.historyId);
			this.title = option.title;
			if(this.historyId){
				this.getDetail();
			}
		},
		methods: {
			getDetail() {
				this.$H.get(`activityEnroll/${this.historyId}`).then(res => {
					if (res.code == 200) {
						this.form = res.data;
					}
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
			enroll() {
				// 检验是否填写所有内容
				if (this.form.name && this.form.code && this.form.phone && this.form.address) {
					// 提交报名
					this.$H.post(`activity/enroll?code=${this.form.code}`, this.form)
						.then(res => {
							if (res.code == 200) {
								uni.showToast({
									title: "报名成功",
									icon: "success",
									duration: 2000,
									success: () => {
										setTimeout(() => {
											// 跳转到报名成功的页面
											uni.navigateTo({
												url: `/main/activity/result/result?id=${this.form.activityId}`
											})
										}, 2000)
									}
								})
							} else if (res.code != 401) {
								uni.showToast({
									title: res.msg,
									icon: "error",
									duration: 2000
								})
							}
						});
				} else {
					uni.showToast({
						title: "请填写完整信息",
						icon: "none"
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
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
	
	.qrcode {
		width: 392rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 40rpx auto;
		padding: 14rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
	}
</style>