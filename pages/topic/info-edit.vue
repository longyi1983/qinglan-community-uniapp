<template>
	<view class="container">
		<view class="f-wrap">
			<u-form ref="uForm">
				<u-form-item label="圈子名称" label-width="auto"><u-input input-align="right" v-model="form.topicName"
						placeholder="请填写圈子名称" /></u-form-item>
				<u-form-item label="圈子描述" label-position="top"><u-input type="textarea" v-model="form.description"
						placeholder="请填写圈子描述" /></u-form-item>
				
				<view class="setting-contain">
					<view class="txt-desc">
						<text>圈子</text>
						<text v-if="form.isPrivacy==0" class="desc-btn">已公开</text>
						<text v-if="form.isPrivacy==1" class="desc-btn">已开启私密</text>
					</view>
					<view class="btn">
						<switch color="#aaaaff" :checked="form.isPrivacy==1" @change="changeBtn2" />
					</view>
				</view>
				<u-line length="690rpx" color="#F6F6F6" margin="20rpx 0 32rpx 0"></u-line>
				<view class="setting-contain">
					<view class="txt-desc">
						<text>进圈验证</text>
						<text v-if="!form.rest" class="desc-btn">关闭</text>
						<text v-if="form.rest" class="desc-btn">开启</text>
					</view>
					<view class="btn">
						<switch color="#5555ff" :checked="form.rest" @change="changeBtn" />
					</view>
				</view>
				<u-form-item v-if="form.rest" label="进圈问题设置" label-position="top"><u-input type="textarea"
						v-model="form.question" placeholder="请填写用户入圈需要回答的问题,由圈子管理员或圈主审核(100字以内)" /></u-form-item>

				<u-form-item label="圈子封面" label-position="top">
					<u-upload ref="uUpload" name="Image" :file-list="fileList1" :header="header" :action="uploadImgUrl"
						max-count="1" @on-uploaded="onUploaded1" :before-upload="beforeUpload"
						@on-remove="onRemove1"></u-upload>
				</u-form-item>
				<u-form-item label="圈子背景" label-position="top">
					<u-upload ref="uUpload" name="Image" :file-list="fileList2" :header="header" :action="uploadImgUrl"
						max-count="1" @on-uploaded="onUploaded2" :before-upload="beforeUpload"
						@on-remove="onRemove2"></u-upload>
				</u-form-item>
			</u-form>
		</view>
		<!-- 提交按钮 -->
		<lf-button shape="circle" @click="submit">提交</lf-button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				uploadImgUrl: this.$c.domain + 'common/upload',
				header: {
					token: uni.getStorageSync('token')
				},
				form: {
					topicName: '',
					description: '',
					bgImage: '',
					coverImage: '',
					id: '',
					rest: false,
					question: '',
					isPrivacy: 0
				},
				fileList1: [],
				fileList2: []
			};
		},
		onLoad(options) {
			this.getTopicInfo(options.topicId);

		},
		methods: {
			changeBtn(e) {
				this.form.rest = e.detail.value
			},
			changeBtn2(e) {
				if(e.detail.value){
					this.form.isPrivacy = 1
					this.form.rest = true
				}else{
					this.form.isPrivacy = 0
					this.form.rest = false
				}
			},
			beforeUpload() {
				uni.showLoading({
					mask: true,
					title: '上传中'
				});
			},
			onUploaded1(e) {
				this.form.bgImage = e[0].response.result;
				uni.hideLoading();
			},
			onUploaded2(e) {
				this.form.coverImage = e[0].response.result;
				uni.hideLoading();
			},
			onRemove1(index) {
				this.form.bgImage = '';
			},
			onRemove2(index) {
				this.form.coverImage = '';
			},
			submit() {
				if(this.form.rest&&!this.form.question){
					this.$u.toast('问题内容不能为空');
					return;
				}
				if(this.form.rest&&this.form.question.length>100){
					this.$u.toast('问题内容不能大于100字');
					return;
				}
				this.$H.post('topic/topicEdit', this.form).then(res => {
					if (res.code == 0) {
						this.$u.toast('保存成功');
						uni.navigateBack()
					}
				});
			},
			getTopicInfo(topicId) {
				this.$H
					.get('topic/detail', {
						id: topicId
					})
					.then(res => {
						this.fileList1 = [{
							url: res.result.bgImage
						}];

						this.fileList2 = [{
							url: res.result.coverImage
						}];

						this.form = res.result;
						
						if (res.result.rest == 1) {
							this.form.rest = true
						} else {
							this.form.rest = false
						}

					});
			}
		}
	};
</script>

<style lang="scss" scoped>
	page {
		background-color: #f5f5f5;
		overflow: hidden;
	}

	.setting-contain {
		display: flex;
	}

	.txt-desc {
		font-size: 28rpx;
	}

	.btn {
		margin-right: 30rpx;
		position: absolute;
		right: 0;
	}
	.desc-btn{
		font-weight: 600;
	}
</style>