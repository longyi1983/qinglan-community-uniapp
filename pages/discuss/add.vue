<template>
	<view class="container">
		<u-form>
			<view>
				<input class="dis-title" placeholder="话题名称" v-model="form.title" maxlength="15" />
			</view>
			<u-form-item :border-bottom="false">
				<textarea placeholder="一句话介绍要讨论的话题" v-model="form.introduce" class="post-txt" maxlength="50"></textarea>
			</u-form-item>
		</u-form>
		<view class="f-fixed">
			<u-button class="plus-btn" :custom-style="btnStyle" shape="circle" :disabled="btnDisabled" :loading="btnLoading" @click="disAdd">创建话题</u-button>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				btnStyle: {
					color: "#fff",
					backgroundColor: '#333333'
				},
				btnDisabled: false,
				btnLoading: false,
				form: {
					topicId: "",
					introduce: "",
					title: "",
				},
				header: {
					token: uni.getStorageSync("token")
				}
			};
		},
		onLoad(options) {
			this.form.topicId = options.topicId;
		},
		methods: {
			disAdd() {
				this.btnDisabled = true;
				this.btnLoading = true;

				if (!this.form.title) {
					this.$refs.uToast.show({
						title: "标题不能为空",
						type: 'error'
					})
					this.btnDisabled = false;
					this.btnLoading = false;
					return;
				} else if (!this.form.introduce) {
					this.$refs.uToast.show({
						title: "内容不能为空",
						type: 'error'
					})
					this.btnDisabled = false;
					this.btnLoading = false;
					return;
				} else {
					this.$H.post("discuss/addDis", this.form).then(res => {
						if (res.code == 0) {
							this.$refs.uToast.show({
								title: res.msg,
								type: 'success'
							})
							setTimeout(() => {
								uni.navigateBack();
							}, 1000);
						} else {
							this.$refs.uToast.show({
								title: res.msg,
								type: 'error'
							})
						}
						this.btnDisabled = false;
						this.btnLoading = false;
					})
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.dis-title{
		padding: 30rpx 0;
	}
	.post-txt{
		width: calc(100% - 40rpx);
		padding: 20rpx;
		background-color: #F5F5F5;
		border-radius: 20rpx;
	}
</style>
