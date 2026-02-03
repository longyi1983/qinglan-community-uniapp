<template>
	<view class="my-account">
		<view class="wrapper">
			<view class="header">
				<view class="accountMain">
					<view class="account acea-row row-top row-between">
						<view class="assets">
							<view>总资产(元)</view>
							<view class="money">{{ now_money }}</view>
						</view>
						<navigator url="/pages/account/cash-out" class="recharge font-blue" v-if="canCash == '1'">提现
						</navigator>
						<navigator url="/pages/pay/pay" class="recharge font-blue" v-if="is_hide == '0'">充值</navigator>
					</view>
					<view class="cumulative acea-row row-top">
						<view class="item">
							<view>累计消费(元)</view>
							<view class="money">{{ orderStatusSum }}</view>
						</view>
					</view>
				</view>
			</view>
			<view class="nav acea-row row-middle">
				<view class="item" @click="goUserBill(0)">
					<view class="pictrue">
						<image src="../static/record1.png" />
					</view>
					<view>账单记录</view>
				</view>
				<view class="item" @click="goUserBill(1)">
					<view class="pictrue">
						<image src="../static/record2.png" />
					</view>
					<view>消费记录</view>
				</view>
				<view class="item" @click="goUserBill(2)" v-if="is_hide == '0'">
					<view class="pictrue">
						<image src="../static/record3.png" />
					</view>
					<view>充值记录</view>
				</view>
			</view>

			<view class="advert acea-row row-between-wrapper"></view>
			<!-- 积分区 -->
			<view class="header">
				<view class="another">
					<view class="account acea-row row-top row-between">
						<view class="assets">
							<view>总积分</view>
							<view class="money">{{ allIntegral }}</view>
						</view>
						<navigator @click="show2 = true" url="" class="recharge font-blue" v-if="yuetoint == '0'">兑入
						</navigator>
						<navigator @click="show = true" url="" class="recharge font-blue" v-if="exchange == '0'">兑出
						</navigator>
					</view>
					<view class="cumulative acea-row row-top">
						<view class="item">
							<view>累计使用</view>
							<view class="money">{{ consumer }}</view>
						</view>
					</view>
				</view>
			</view>
			<view class="nav acea-row row-middle">
				<view class="item" @click="goUserIntegral(0)">
					<view class="pictrue">
						<image src="../static/record06.png" />
					</view>
					<view>积分记录</view>
				</view>
				<view class="item" @click="goUserIntegral(1)">
					<view class="pictrue">
						<image src="../static/record07.png" />
					</view>
					<view>支出记录</view>
				</view>
				<view class="item" @click="goUserIntegral(2)">
					<view class="pictrue">
						<image src="../static/record08.png" />
					</view>
					<view>收入记录</view>
				</view>
			</view>

			<!-- 积分兑换余额 兑换弹窗 -->
			<u-popup v-model="show" mode="center" border-radius="14">
				<view class="change-box">
					<view class="flex-items flex-column box-container">
						<view class="mar-top-60">
							<label class="title">积分兑换余额</label>
						</view>
						<view class="flex-items flex-row mar-top-60">
							<view class="fs26">我的积分</view>
							<input class="remark mar-left-20 fs26" v-model="allIntegral" disabled="disabled" />
						</view>
						<view class="flex-items flex-row mar-top-30 ">
							<label class="fs26">可兑余额</label>
							<input class="nick mar-left-20 fs26" v-model="canRecharge" disabled="disabled" />
						</view>
						<view class="flex-items flex-row mar-top-30 ">
							<label class="fs26">兑换余额</label>
							<input class="nick mar-left-20 fs26" v-model="rechargeValue" type="number"/>
						</view>
						<view class="flex-items flex-row mar-top-30 ">
							<label class="tipTxt">{{integral}}积分可兑换1元</label>
						</view>

						<view class="flex-row-plus box-btn">
							<view class="box-btn-cancel" @click="cancelSubmit">取消</view>
							<view class="box-btn-ok" @click="submit">确定</view>
						</view>
					</view>
				</view>
			</u-popup>
			<!-- 余额兑换积分 兑换弹窗 -->
			<u-popup v-model="show2" mode="center" border-radius="14">
				<view class="change-box">
					<view class="flex-items flex-column box-container">
						<view class="mar-top-60">
							<label class="title">余额兑换积分</label>
						</view>
						<view class="flex-items flex-row mar-top-60">
							<view class="fs26">我的余额</view>
							<input class="remark mar-left-20 fs26" v-model="now_money" disabled="disabled" />
						</view>
						<view class="flex-items flex-row mar-top-30 ">
							<label class="fs26">可兑积分</label>
							<input class="nick mar-left-20 fs26" v-model="canRechargeIntegral" disabled="disabled" />
						</view>
						<view class="flex-items flex-row mar-top-30 ">
							<label class="fs26">兑换积分</label>
							<input class="nick mar-left-20 fs26" v-model="rechargeInt" type="number"/>
						</view>
						<view class="flex-items flex-row mar-top-30 ">
							<label class="tipTxt">1元可兑换{{ratio}}积分</label>
						</view>
			
						<view class="flex-row-plus box-btn">
							<view class="box-btn-cancel" @click="cancelSubmit">取消</view>
							<view class="box-btn-ok" @click="submit2">确定</view>
						</view>
					</view>
				</view>
			</u-popup>
		</view>

	</view>


</template>
<script>
	export default {
		name: 'account',

		props: {},
		data: function() {
			return {
				is_hide: '0',
				exchange: '0',
				now_money: 0, //用户总余额
				orderStatusSum: 0,
				recharge: 0,
				show: false,
				show2: false,
				integral: 0, //积分兑换余额的比例
				allIntegral: 0, //用户总积分
				consumer: 0, //消费积分
				canRecharge: 0, //积分可以兑换的金额
				rechargeValue: '', //用户要兑换的金额
				canCash: '0', //是否开启提现入口
				yuetoint: 0, //余额兑换积分的开关 0开启 1关闭
				ratio:0, //一块钱能兑换的积分数
				canRechargeIntegral: 0, //余额可以兑换的积分
				rechargeInt: '', //用户要兑换的积分
			}
		},
		onShow: function() {
			this.getIndex()
		},
		methods: {
			goUserBill(types) {
				uni.navigateTo({
					url: '/pages/bill/bill?types=' + types
				});
			},
			goUserIntegral(type) {
				uni.navigateTo({
					url: '/pages/sign/integral?type=' + type
				});
			},
			getIndex: function() {
				let that = this
				this.$H.post('user/bill').then(
					res => {
						that.now_money = res.result.nowMoney
						that.orderStatusSum = res.result.orderStatusSum
						this.is_hide = res.result.isHide
						this.exchange = res.result.exchange
						this.consumer = res.result.consumer
						this.integral = res.result.integral
						this.allIntegral = res.result.allIntegral
						this.canRecharge = res.result.allIntegral / res.result.integral
						this.canCash = res.result.canCash
						this.ratio = res.result.ratio
						this.yuetoint = res.result.yuetoint
						this.canRechargeIntegral = res.result.ratio * res.result.nowMoney
					},
					err => {
						uni.showToast({
							title: err.msg,
							icon: 'none',
							duration: 2000,
						})
					}
				)
			},
			cancelSubmit() {
				this.show = false;
				this.show2 = false;
			},
			isInteger(obj) {
				return obj % 1 === 0;
			},
			//兑出
			submit() {
				if (this.canRecharge <= 0) {
					this.$u.toast('可兑换金额不足');
				}
				if (!this.rechargeValue) {
					this.$u.toast('请输入兑换金额');
					return;
				}
				var ret = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
				if (!ret.test(this.rechargeValue)) {
					this.$u.toast('输入金额不合法');
					return;
				}
				if (this.rechargeValue > this.canRecharge) {
					this.$u.toast('不能高于可兑换金额');
					return;
				}
				uni.showLoading({
					mask: true,
					title: '兑换中'
				});
				this.$H.post('bill/exchange', {
					rechargeValue: this.rechargeValue
				}).then(res => {
					if (res.code == 0) {
						uni.redirectTo({
							url: '/pages/bill/bill?types=0'
						})
					}
					uni.hideLoading();
				});
			},
			//兑入
			submit2() {
				if (this.canRechargeIntegral <= 0) {
					this.$u.toast('可兑换积分不足');
				}
				if (!this.rechargeInt) {
					this.$u.toast('请输入兑换金额');
					return;
				}
				var ret = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
				if (!ret.test(this.rechargeInt)) {
					this.$u.toast('输入额度不合法');
					return;
				}
				if(!this.isInteger(this.rechargeInt)){
					this.$u.toast('积分必须为整数');
					return;
				}
				if (this.rechargeInt > this.canRechargeIntegral) {
					this.$u.toast('不能高于可兑换额度');
					return;
				}
				
				uni.showLoading({
					mask: true,
					title: '兑换中'
				});
				this.$H.post('bill/exchangeToIntegral', {
					rechargeValue: this.rechargeInt
				}).then(res => {
					if (res.code == 0) {
						uni.redirectTo({
							url: '/pages/bill/bill?types=0'
						})
					}
					uni.hideLoading();
				});
			},
		},
	}
</script>
<style lang="scss" scoped>
	.change-box {
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

		.box-container {
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

			.box-btn {
				position: absolute;
				bottom: 0;
			}

			.box-btn-cancel {
				border: 1upx solid #E5E5E5;
				width: 260upx;
				height: 90upx;
				text-align: center;
				line-height: 90upx;
			}

			.box-btn-ok {
				background-color: #323232;
				width: 260upx;
				height: 90upx;
				text-align: center;
				line-height: 90upx;
				color: #FFFFFF;
			}
		}
	}

	.tipTxt {
		color: #888283;
		font-size: 22upx;
	}

	.title {
		font-size: 36upx;
		font-weight: 200;
	}
</style>

<style lang="less" scoped>
	.my-account .wrapper {
		background-color: #fff;
		padding: 32rpx 0 34rpx 0;
		margin-bottom: 14rpx;
	}

	.my-account .wrapper .header {
		width: 6.9 * 100rpx;
		height: 3.3 * 100rpx;
		background-image: linear-gradient(to right, #7e97f2 0%, #aaaaff 100%);
		border-radius: 0.16 * 100rpx;
		margin: 0 auto;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.24 * 100rpx;
	}

	.my-account .wrapper .header .accountMain {
		background-image: url('https://demo.linfeng.tech/resource/images/white-bg.png');
		background-repeat: no-repeat;
		background-size: 100%;
		height: 100%;
		width: 100%;
		padding: 36rpx 0 29rpx 0;
	}

	.my-account .wrapper .header .accountMain .account {
		padding: 0 35rpx;
	}

	.my-account .wrapper .header .accountMain .account .assets .money {
		font-size: 72rpx;
		color: #fff;
		font-family: 'GuildfordProBook 5';
		margin-top: 10rpx;
		height: 75rpx;
		line-height: 75rpx;
	}

	.my-account .wrapper .header .accountMain .account .recharge {
		font-size: 28rpx;
		width: 150rpx;
		height: 54rpx;
		border-radius: 27rpx;
		background-color: #fff9f8;
		text-align: center;
		line-height: 54rpx;
	}

	.my-account .wrapper .header .accountMain .cumulative {
		margin-top: 46rpx;
	}

	.my-account .wrapper .header .accountMain .cumulative .item {
		flex: 1;
		-o-flex: 1;
		-ms-flex: 1;
		padding-left: 35rpx;
	}

	.my-account .wrapper .header .accountMain .cumulative .item .money {
		font-size: 48rpx;
		font-family: 'GuildfordProBook 5';
		color: #fff;
		margin-top: 6rpx;
	}

	.my-account .wrapper .header .another {
		width: 69rpx;
		height: 33rpx;
		background-image: linear-gradient(to right, #b77cff 0%, #aaaaff 100%);
		border-radius: 16rpx;
		margin: 0 auto;
		color: rgba(255, 255, 255, 0.6);
		font-size: 24rpx;
	}

	.my-account .wrapper .header .another {
		background-repeat: no-repeat;
		background-size: 100%;
		height: 100%;
		width: 100%;
		padding: 36rpx 0 29rpx 0;
	}

	.my-account .wrapper .header .another .account {
		padding: 0 35rpx;
	}

	.my-account .wrapper .header .another .account .assets .money {
		font-size: 72rpx;
		color: #fff;
		font-family: 'GuildfordProBook 5';
		margin-top: 10rpx;
		height: 75rpx;
		line-height: 75rpx;
	}

	.my-account .wrapper .header .another .account .recharge {
		font-size: 28rpx;
		width: 150rpx;
		height: 54rpx;
		border-radius: 27rpx;
		background-color: #fff9f8;
		text-align: center;
		line-height: 54rpx;
	}

	.my-account .wrapper .header .another .cumulative {
		margin-top: 46rpx;
	}

	.my-account .wrapper .header .another .cumulative .item {
		flex: 1;
		-o-flex: 1;
		-ms-flex: 1;
		padding-left: 35rpx;
	}

	.my-account .wrapper .header .another .cumulative .item .money {
		font-size: 48rpx;
		font-family: 'GuildfordProBook 5';
		color: #fff;
		margin-top: 6rpx;
	}

	.my-account .wrapper .nav {
		height: 1.55 * 100rpx;
		border-bottom: 1px solid #f5f5f5;
	}

	.my-account .wrapper .nav .item {
		flex: 1;
		-o-flex: 1;
		-ms-flex: 1;
		text-align: center;
		font-size: 26rpx;
		color: #999;
	}

	.my-account .wrapper .nav .item .pictrue {
		width: 44rpx;
		height: 44rpx;
		margin: 0 auto;
		margin-bottom: 20rpx;
	}

	.my-account .wrapper .nav .item .pictrue image {
		width: 100%;
		height: 100%;
	}

	.my-account .wrapper .advert {
		padding: 0 30rpx;
		margin-top: 30rpx;
	}

	.font-blue {
		color: #aaaaff !important;
	}
</style>