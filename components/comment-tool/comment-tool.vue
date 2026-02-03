<template>
	<view class="comment-tool">
		<view class="wrap">
			<view style="height: 60rpx; display: flex; align-items: center">
				<input ref="lfinput" type="text" :placeholder="placeholder" class="comment-input" @blur="onBlur"
					:focus="focus" v-model="content" confirm-type="send" @confirm="addComment" />
				<image src="/static/images/img-icon.svg" style="width: 40rpx; height: 40rpx"
					@click="commentImgUpload"></image>
			</view>
			<view :class="{'chat-input-send': true, 'chat-input-send-disabled': isSubmitD}" @click="addComment">
				<text class="chat-input-send-text">发送</text>
			</view>
		</view>
		<view v-if="commentTempImgUrl" class="img-wrap">
			<image :src="commentTempImgUrl" class="comment-img" />
			<view class="mask" @click="previewImage(commentTempImgUrl)">
				预览
			</view>
			<view class="del" @click="deleteTempImage">×</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "comment-tool",
		props: {
			// 输入框占位符
			placeholder: {
				type: String,
				default: '说点什么...'
			},
			// 是否聚焦
			focus: {
				type: Boolean,
				default: false
			},
			// 是否禁用发送按钮
			isSubmitD: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				content: '', // 评论内容
				commentTempImgUrl: '', // 评论图片
			};
		},
		methods: {
			// 输入框失去焦点
			onBlur() {
				this.$emit('blur');
			},
			// 添加评论
			addComment() {
				if (!this.content.trim()) {
					this.$u.toast('评论不能为空');
					return;
				}
				
				this.$emit('addComment', {
					content: this.content,
					commentImg: this.commentTempImgUrl
				});
				
				// 清空输入内容
				this.content = '';
				this.commentTempImgUrl = '';
			},
			// 评论图片上传
			commentImgUpload() {
				let that = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album'],
					success: function(res) {
						uni.showLoading({
							mask: true,
							title: "上传中"
						})
						uni.uploadFile({
							url: that.$c.domain + 'common/upload',
							filePath: res.tempFilePaths[0],
							name: 'Image',
							header: {
								token: uni.getStorageSync("token")
							},
							success: (uploadFileRes) => {
								let data = JSON.parse(uploadFileRes.data)
								if (data.code == 0) {
									that.commentTempImgUrl = data.result
									uni.hideLoading();
								}
							}
						});
					}
				});
			},
			// 删除临时图片
			deleteTempImage() {
				this.commentTempImgUrl = '';
			},
			// 预览图片
			previewImage(url) {
				uni.previewImage({
					urls: [url]
				})
			},
			// 设置输入框内容（供父组件调用）
			setContent(content) {
				this.content = content;
			},
			// 设置图片（供父组件调用）
			setImage(imageUrl) {
				this.commentTempImgUrl = imageUrl;
			},
			// 清空内容（供父组件调用）
			clearContent() {
				this.content = '';
				this.commentTempImgUrl = '';
			},
			// 聚焦输入框（供父组件调用）
			focusInput() {
				this.$nextTick(() => {
					this.$refs.lfinput.focus();
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comment-tool {
		position: fixed;
		bottom: 0;
		width: 100%;
		background-color: #fff;
		padding: 20rpx;
		z-index: 999;

		.wrap {
			padding: 3px;
			padding-left: 10px;
			display: flex;
			align-items: center;
			background-color: #f5f5f5;
			border-radius: 20px;

			input {
				width: 480rpx !important;
			}
		}

		.chat-input-send {
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			margin: 10rpx 10rpx 10rpx 20rpx;
			border-radius: 10rpx;
			width: 120rpx;
			height: 60rpx;
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

		.img-wrap {
			position: relative;
			width: 80rpx;
			height: 80rpx;
			margin: 20rpx;
			margin-bottom: 0;
			color: #fff;

			.comment-img {
				border-radius: 8rpx;
				width: 80rpx;
				height: 80rpx;
			}

			.mask {
				border-radius: 8rpx;
				z-index: 10;
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.2);
				font-size: 24rpx;
				display: flex;
				align-items: flex-end;
				justify-content: center;
			}

			.del {
				z-index: 10;
				position: absolute;
				right: -10rpx;
				top: -10rpx;
				width: 30rpx;
				height: 30rpx;
				border-radius: 30rpx;
				background-color: rgba(0, 0, 0, 0.5);
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24rpx;
			}
		}

		.comment-input {
			height: 60rpx;
			font-size: 28rpx;
			line-height: 60rpx;
			width: 500rpx;
			margin-right: 20rpx;
		}
	}
</style> 