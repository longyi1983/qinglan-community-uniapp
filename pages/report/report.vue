<template>
	<view class="lf-container">
		<view class="content">
			<view class="description">
				本平台严厉打击引流广告、虚假不实信息、色情低俗、辱骂引战、违法违规、涉政言论等违规内容。
			</view>

			<view class="section">
				<view class="section-title">
					选择具体类型 <text class="required">*</text>
				</view>
				<view class="radio-group">
					<view v-for="(item, index) in classList" :key="index" class="radio-item"
						:class="{ 'radio-item-active': selectedItem === item.id }" @click="selectCate(item.id)">
						{{ item.cateName }}
					</view>
				</view>
			</view>

			<view class="section">
				<view class="section-title">
					举报描述 <text class="required">*</text>
				</view>
				<textarea v-model="form.content" class="textarea" placeholder="请描述存在的问题，提供更多信息有助于举报被快速处理。"
					placeholder-style="color: #999;"></textarea>
			</view>

			<view class="section">
				<view class="upload-area">
					<block>
						<u-upload ref="uUpload" :size-type="['original']" name="Image" :max-count="3" :header="header"
							:action="uploadImgUrl" @on-uploaded="submit" :auto-upload="false"></u-upload>
					</block>
				</view>
			</view>
		</view>
		<view class="footer">
			<view :class="{'chat-input-send': true, 'chat-input-send-disabled': !form.cateId || !form.content}"
				@click="uploadImg">
				<text class="chat-input-send-text">提交</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				uploadImgUrl: this.$c.domain + 'common/upload',
				form: {
					linkId: 0,
					cateId: '',
					content: '',
					media: [],
				},
				header: {
					token: uni.getStorageSync('token')
				},
				selectedItem: '',

				fileList: [],
				classList: [{
						id: 1,
						cateName: '帖子'
					},
					{
						id: 2,
						cateName: '评论'
					},
					{
						id: 3,
						cateName: '用户'
					},
					// {
					// 	id: 4,
					// 	cateName: '圈子'
					// },
				],
			}
		},
		onLoad(options) {
			if (options.type === 'comment') {
				// 举报评论
				this.form.linkId = options.commentId;
				this.form.cateId = 2;
				this.selectedItem = 2;
				this.cateName = '评论';
			} else if (options.postId) {
				// 举报帖子
				this.form.linkId = options.postId;
				this.form.cateId = 1;
				this.selectedItem = 1;
				this.cateName = '帖子';
			}

			if (options.uid) {
				let userInfo = uni.getStorageSync("userInfo");
				if (userInfo) {
					if (userInfo.uid == options.uid) {
						this.$u.toast('不能举报自己');
						setTimeout(function() {
							uni.navigateBack();
						}, 1000);
					}
				} else {
					this.$f.login();
				}
			}
		},
		methods: {
			selectCate(id) {
				this.selectedItem = id;
				this.form.cateId = id;
			},
			uploadImg() {
				if (!this.form.cateId) {
					this.$u.toast('请选择举报类型');
					return;
				}
				if (!this.form.content) {
					this.$u.toast('描述不能为空');
					return;
				}
				uni.showLoading({
					mask: true,
					title: '提交中'
				});
				// uni.showLoading({
				// 	title: '提交中'
				// });
				this.$refs.uUpload.upload();
			},
			chooseClass(id, name) {
				this.form.cateId = id;
				this.cateName = name;
				this.show = false;
			},
			submit(e) {

				let mediaList = [];
				e.forEach(function(item, index) {
					mediaList.push(item.response.result);
				});

				this.form.media = mediaList;
				this.$H.post('report/addReport', this.form).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						this.$u.toast('举报成功');
						setTimeout(function() {
							uni.navigateBack();
						}, 3000);
					}
				});
			}
		}
	}
</script>

<style>
	.lf-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.content {
		flex: 1;
		padding: 20px;
	}

	.description {
		font-size: 14px;
		color: #999;
		margin-bottom: 20px;
	}

	.section {
		background-color: #fff;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.required {
		color: #ff6b81;
	}

	.radio-group {
		display: flex;
		flex-wrap: wrap;
	}

	.radio-item {
		width: calc(50% - 10px);
		height: 40px;
		line-height: 40px;
		text-align: center;
		background-color: #f8f8f8;
		border-radius: 10px;
		margin: 5px;
		font-size: 14px;
	}

	.radio-item-active {
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: white;
	}

	.textarea {
		width: calc(100% - 20px);
		height: 120px;
		background-color: #f8f8f8;
		border-radius: 8px;
		padding: 10px;
		font-size: 14px;
	}

	.upload-area {
		display: flex;
		flex-wrap: wrap;
	}

	.upload-btn {
		width: 80px;
		height: 80px;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 8px;
	}

	.icon-plus {
		font-size: 30px;
		color: #999;
	}

	.upload-text {
		font-size: 12px;
		color: #999;
		margin-top: 5px;
	}

	.footer {
		padding: 20px;
		display: flex;
		justify-content: center;
	}

	.chat-input-send {
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		border-radius: 10rpx;
		width: 686rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.chat-input-send-disabled {
		background: #bbbbbb;
	}

	.chat-input-send-text {
		color: white;
		font-size: 26rpx;
	}
</style>