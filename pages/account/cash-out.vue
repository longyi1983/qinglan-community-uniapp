<template>
	<view class="page-bg" v-if="open">
		<view class="main-container">
			<view class="panel">
				<view class="font-txt">提现金额</view>

				<view class="input-box">
					¥ <input type="number" value="" v-model="moneyNumber" placeholder="输入提现金额" placeholder-class="pch"
						class="input-value" />
				</view>
				<view class="font-yue">当前可提现余额为 ¥{{canCashOut}}</view>
			</view>

			<view class="red-tip tip-small" v-if="canCashOut<=0">暂无可提现的余额</view>
			<view class="red-tip tip-small" v-else-if="!canSubmit">存在待审核提现申请，请耐心等待</view>

			<view class="font-txt cash-title">选择提现至</view>

			<view class="cash-panel cash-flex-row">
				<radio-group @change="radioChange">
					<label style="display: flex;" v-for="(item, index) in items" :key="index">
						<view class="cash-type">
							<view>
								<image :src="item.icon" class="cash-type-tag"></image>
							</view>
							<view class="cash-type-name">{{item.title}}</view>
						</view>
						<view class="cash-type-radio">
							<radio :value="item.title" color="#333333" :checked="index === current" />
						</view>
					</label>
				</radio-group>
			</view>
			<u-line length="690rpx" color="#F6F6F6" margin="30rpx 0 33rpx 0"></u-line>
			<view class="contentNav">收款码截图</view>
			<view style="transform: translateX(-10rpx);">
				<u-upload ref="uUpload" :size-type="['original']" name="Image" :max-count="1" :header="header"
					:action="uploadImgUrl" @on-uploaded="submit" :auto-upload="false" :custom-btn="true">
					<view slot="addBtn" class="slot-btn">
						<u-icon name="plus" size="40" color="#666666"></u-icon>
						<view class="slot-txt">
							上传收款码
						</view>
					</view>
				</u-upload>
				<u-line length="690rpx" color="#F6F6F6" margin="30rpx 0 33rpx 0"></u-line>
			</view>

			<view class="btn-mar">
				<button class="btn-cash font-txt-btn" v-if="canSubmit" @click="uploadImg">申请提现</button>
				<button class="btn-cash-disable font-txt-btn" v-else >无法申请提现</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				moneyNumber: '',//用户提交的提现金额
				canCashOut: 0,//可提现的余额
				canSubmit: true,
				items: [{
					id: 0,
					icon: 'https://demo.linfeng.tech/resource/img/alipay.png',
					title: '支付宝',
				}, {
					id: 1,
					icon: 'https://demo.linfeng.tech/resource/img/weixin.png',
					title: '微信',
				}],
				current: 0,
				uploadImgUrl: this.$c.domain + 'common/upload',
				header: {
					token: uni.getStorageSync('token')
				},
				open:true
			}
		},
		onLoad() {
			this.checkOpen();
			this.getBasicInfo();
		},
		methods: {
			checkOpen(){
				this.$H.get('system/cashOutIsOpen').then(res => {
					if(res.code==0){
						this.open = res.result;
						if(!res.result){
							this.$f.toast("模块未开启")
							setTimeout(function() {
								uni.switchTab({
									url: '/pages/index/index'
								});
							}, 1500);
						}
					}
				});
			},
			uploadImg() {
				if (!this.moneyNumber) {
					this.$u.toast('请输入提现金额');
					return;
				}
				if(this.moneyNumber<=0){
					this.$u.toast('输入金额非法');
					return;
				}
				if(this.canCashOut<=0){
					this.$u.toast('暂无可提现余额');
					return;
				}
				if(this.moneyNumber>this.canCashOut){
					this.$u.toast('可提现余额不足');
					return;
				}

				uni.showLoading({
					mask: true,
					title: '提交中'
				});
				this.$refs.uUpload.upload();
			},
			radioChange: function(evt) {
				for (let i = 0; i < this.items.length; i++) {
					if (this.items[i].title === evt.detail.value) {
						this.current = i;
						break;
					}
				}
			},
			getBasicInfo(){
				this.$H.get('cashOut/getAccountBasicInfo').then(res => {
					if(res.code==0){
						this.canCashOut = res.result.nowMoney
						this.canSubmit = res.result.canSubmit
						if(!res.result.cashOpen){
							this.$u.toast('提现已关闭');
							setTimeout(function() {
								uni.switchTab({
									url:'/pages/my/my'
								})
							}, 1000);
							
						}
					}
				});
			},
			submit(e) {
				if (e.length==0) {
					uni.hideLoading();
					this.$u.toast('付款码截图不能为空');
					return;
				}
				uni.showLoading({
					mask: true,
					title: '提交中'
				});
				this.$H.post('cashOut/submit', {
					url: e[0].response.result,
					moneyNumber: this.moneyNumber,
					type: this.current
				}).then(res => {
					if (res.code == 0) {
						this.$u.toast('提交成功,请耐心等待审核');
						setTimeout(function() {
							uni.switchTab({
								url:'/pages/my/my'
							})
						}, 2500);
					}
					uni.hideLoading();
				});

			}

		}
	}
</script>

<style lang="less">
	.page-bg {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background-size: 750rpx auto;
		background-color: #F7F7F7;
	}

	.main-container {
		width: 686rpx;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		margin-top: 36rpx;
	}

	.panel {
		width: 686rpx;
		height: 296rpx;
		padding: 32rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
	}

	.font-txt {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #000000;
		font-weight: 600;
	}

	.font-txt-btn {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #ffffff;
		font-weight: 600;
	}

	.font-yue {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #9B9B9B;
		margin-top: 18rpx;
	}

	.input-box {
		height: 100rpx;
		width: 650rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 40rpx;
		font-family: PingFang SC;
		font-weight: bold;
		color: #43413C;
		opacity: 1;
		border-bottom: 2rpx solid #E7E9EE;
		;
	}

	.input-box .input-value {
		flex: 1 auto;
		margin-left: 10rpx;
		height: 80rpx;
	}

	.cash-flex-row {
		display: flex;
		justify-content: space-around;
		align-items: center;
		flex-wrap: wrap;
		text-align: center;
	}

	.cash-panel {
		width: 686rpx;
		padding: 32rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
	}

	.cash-title {
		margin: 30rpx 0 20rpx 40rpx;
	}

	.tip-small {
		margin: 25rpx 0 30rpx 0;
	}

	.btn-mar {
		margin-top: 120rpx;
	}

	.btn-cash {
		width: 686rpx;
		height: 88rpx;
		line-height: 88rpx;
		background: #333333;
		border-radius: 8rpx;
	}
	.btn-cash-disable {
		width: 686rpx;
		height: 88rpx;
		line-height: 88rpx;
		background: #636363;
		border-radius: 8rpx;
	}

	.cash-type-tag {
		width: 50rpx;
		height: 50rpx;
		margin: 0 20rpx;
	}

	.red-tip {
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #E04646;
	}

	.cash-flex-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.cash-type {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.cash-type-name {
		font-size: 36rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #565656;
		margin-right: 50rpx;
	}

	.cash-type-radio {
		width: 20%;
		display: flex;
		margin-right: auto;
		position: absolute;
		right: 0;
	}

	.contentNav {
		font-size: 28rpx;
		font-weight: 600;
		margin-left: 40rpx;
	}

	.slot-btn {
		margin: 10rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
		background-color: #edecec;

	}

	.slot-txt {
		margin-top: 17rpx;
		font-size: 24rpx;
		color: #000000;
		line-height: 33rpx;
		opacity: 0.5;
	}
</style>
