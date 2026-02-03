<template>
	<view class="container">
		<!-- 标题 -->
		<view class="one-line" style="margin-top: 38rpx;">
			<view class="top">
				<view class="title">
					标题
				</view>
				<view class="num">
					{{form.title.length}}/20
				</view>
			</view>
			<view class="content">
				<input class="txt" type="text" placeholder="起个标题叭~" maxlength="20" v-model="form.title">
			</view>
			<u-line margin="25rpx 0 0 0" length="690rpx" color="#e3e3e3"></u-line>
		</view>
		<!-- 上传封面图 -->
		<view style="transform: translateX(-10rpx);">
			<u-upload ref="uUpload" :size-type="['original']" name="Image" :max-count="1" :header="header"
				:action="uploadImgUrl" :auto-upload="true" :custom-btn="true">
				<view slot="addBtn" class="slot-btn">
					<u-icon name="plus" size="40" color="#6f6f6f"></u-icon>
					<view class="slot-txt">
						上传封面图
					</view>
				</view>
			</u-upload>
			<u-line length="690rpx" color="#e3e3e3" margin="30rpx 0 33rpx 0"></u-line>
		</view>
		<!-- 富文本编辑器 -->
		<view class="page-body">
			<view class='wrapper'>
				<view class='toolbar' @tap="format" style="height: 40px;overflow-y: auto;">
					<view :class="formats.bold ? 'ql-active' : ''" class="iconfont icon-zitijiacu" data-name="bold">
					</view>
					<view :class="formats.italic ? 'ql-active' : ''" class="iconfont icon-zitixieti" data-name="italic">
					</view>
					<view :class="formats.underline ? 'ql-active' : ''" class="iconfont icon-zitixiahuaxian"
						data-name="underline"></view>
					<!-- #ifndef MP-BAIDU -->
					<view :class="formats.align === 'left' ? 'ql-active' : ''" class="iconfont icon-zuoduiqi"
						data-name="align" data-value="left"></view>
					<!-- #endif -->
					<view :class="formats.align === 'center' ? 'ql-active' : ''" class="iconfont icon-juzhongduiqi"
						data-name="align" data-value="center"></view>
					<view :class="formats.align === 'right' ? 'ql-active' : ''" class="iconfont icon-youduiqi"
						data-name="align" data-value="right"></view>
					<view :class="formats.align === 'justify' ? 'ql-active' : ''" class="iconfont icon-zuoyouduiqi"
						data-name="align" data-value="justify"></view>
					<view class="iconfont icon-undo" @tap="undo"></view>
					<view class="iconfont icon-redo" @tap="redo"></view>
					<view class="iconfont icon-fengexian" @tap="insertDivider"></view>
					<view class="iconfont icon-charutupian" @tap="insertImage"></view>
					<view class="iconfont icon-shanchu" @tap="clear"></view>
				</view>

				<view class="editor-wrapper">
					<editor id="editor" class="ql-container" placeholder="在这里编辑内容..." show-img-size show-img-toolbar
						show-img-resize @statuschange="onStatusChange" :read-only="readOnly" @ready="onEditorReady" @blur="onblur">
					</editor>
					<u-line margin="25rpx 0 0 0" length="690rpx" color="#d0d0d0"></u-line>

					<!-- 选择圈子 -->
					<navigator url="/pages/topic/choose-topic/choose-topic" class="choose-item">
						<image class="icon" src="/static/p_1.png"></image>
						<text class="txt">{{ topicName }}</text>
						<u-icon class="u-icon" name="arrow-right"></u-icon>
					</navigator>
					<!-- 选择话题 -->
					<navigator v-if="form.topicId"
						:url="'/pages/discuss/choose-discuss/choose-discuss?topicId=' + form.topicId"
						class="choose-item">
						<image class="icon" src="/static/m_1.png"></image>
						<text class="txt">{{ disName }}</text>
						<u-icon class="u-icon" name="arrow-right"></u-icon>
					</navigator>

				</view>

			</view>
			<view class="release-btn" @click="submit">
				<view class="btn">发布</view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				readOnly: false,
				formats: {},
				form: {
					title: '',
					topicId: '',
					content: '',
					type: 3,
					media: []
				},
				topicName: '选择圈子',
				disName: '选择话题',
				uploadImgUrl: this.$c.domain + 'common/upload',
				header: {
					token: uni.getStorageSync('token')
				},
				tmpForm: {
					title: '',
					content: ''
				},
				tmpContent: '',
				isDraft: false
			}
		},
		onLoad(options) {
			if (options.topicId) {
				this.topicId = options.topicId;
			}
			this.checkDraft();
		},
		onShow() {
			if (!uni.getStorageSync('hasLogin')) {
				uni.navigateTo({
					url: "/pages/user/go-login"
				})
			}
		},
		onBackPress(options) {
			// #ifdef APP-PLUS || H5
			if (options.from === 'backbutton') {
				// 检查表单是否有更改
				if (this.hasFormChanged()) {
					uni.showModal({
						content: "保留此次草稿编辑？",
						confirmText: '保留',
						cancelText: '不保留',
						success: (res) => {
							if (res.confirm) {
								this.saveDraft();
							} else if (res.cancel) {
								uni.removeStorageSync('linfengArticleTmpData');
								uni.navigateBack()
							}
						}
					});
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
			// #endif
		},
		onUnload() {
			// #ifdef MP-WEIXIN
			// 检查表单是否有更改
			if (this.hasFormChanged() && !this.isDraft) {
				uni.showModal({
					content: "保留此次草稿编辑？",
					confirmText: '保留',
					cancelText: '不保留',
					success: (res) => {
						if (res.confirm) {
							this.saveDraft();
						} else if (res.cancel) {
							uni.removeStorageSync('linfengArticleTmpData');
							uni.navigateBack()
						}
					}
				});
				return true;
			} else {
				return false;
			}
			// #endif
		},
		methods: {
			hasFormChanged() {
				this.tmpForm.title = this.form.title
				const changedKeys = Object.keys(this.tmpForm).filter(key => {
					return !this.$f.isEmpty(this.tmpForm[key]);
				});
				// console.log('是否编辑', changedKeys.length > 0);
				return changedKeys.length > 0;
			},
			saveDraft() {
				
				uni.setStorage({
					key: 'linfengArticleTmpData',
					data: this.tmpForm,
					success: function() {
						// console.log('数据已存储到本地缓存');
					},
					fail: function(err) {
						// console.error('存储数据失败', err);
					},
					complete() {
						uni.navigateBack()
					}
				});
			},
			checkDraft() {
				var that = this
				uni.getStorage({
					key: 'linfengArticleTmpData',
					success: function(res) {
						const retrievedTmpForm = res.data;
						console.log('从本地缓存中读取的数据：', retrievedTmpForm);
						that.form.title = retrievedTmpForm.title
						that.tmpContent = retrievedTmpForm.content
					},
					fail: function(err) {}
				});
			},
			submit() {
				if (!this.form.topicId) {
					this.$u.toast('请选择圈子');
					return;
				}

				if (!this.form.title) {
					this.$u.toast('标题不能为空');
					return;
				}
				var that = this;
				this.editorCtx.getContents({
					success: function(res) {
						that.form.content = res.html
						if (!that.form.content) {
							that.$u.toast('内容不能为空');
							return;
						}
						uni.showLoading({
							mask: true,
							title: '发布中'
						});
						let files = [];
						// 通过filter，筛选出上传进度为100的文件(因为某些上传失败的文件，进度值不为100，这个是可选的操作)
						files = that.$refs.uUpload.lists.filter(val => {
							return val.progress == 100;
						})
						if (files.length == 0) {
							that.$u.toast('请上传封面图');
							return;
						}
						// console.log(files[0].response.result)
						that.form.media.push(files[0].response.result)
						that.$H.post('post/addArticle', that.form).then(res => {
							uni.hideLoading();
							if (res.code == 0) {
								that.isDraft=true
								uni.removeStorageSync('linfengArticleTmpData');
								uni.redirectTo({
									url: '/subpages/content/article/article?id=' + res.result
								});
							} else {
								that.$f.toast(res.msg)
							}

						});
					}
				})
			},
			readOnlyChange() {
				this.readOnly = !this.readOnly
			},
			onEditorReady() {
				// #ifdef MP-BAIDU
				this.editorCtx = requireDynamicLib('editorLib').createEditorContext('editor');
				// #endif

				// #ifdef APP-PLUS || MP-WEIXIN || H5
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
				}).exec()
				// #endif
				if (this.tmpContent.length > 0) {
					// 初始化编辑器内容
					var that = this
					setTimeout(function() {
						that.setEditorContent(that.tmpContent);
					}, 1500);
					
				}
			},
			setEditorContent(content) {
				if (this.editorCtx) {
					this.editorCtx.setContents({
						html: content,
						success: () => {
							// console.log('内容设置成功');
						},
						fail: (err) => {
							// console.error('设置内容失败', err);
						},
					});
				} else {
					console.error('editorCtx 尚未初始化');
				}
			},
			undo() {
				this.editorCtx.undo()
			},
			redo() {
				this.editorCtx.redo()
			},
			format(e) {
				let {
					name,
					value
				} = e.target.dataset
				if (!name) return
				// console.log('format', name, value)
				this.editorCtx.format(name, value)
			},
			onStatusChange(e) {
				const formats = e.detail
				this.formats = formats
			},
			onblur(){
				// console.log('触发')
				var that = this;
				this.editorCtx.getContents({
					success: function(res) {
						that.tmpForm.content = res.html
					}
				})
			},
			insertDivider() {
				this.editorCtx.insertDivider({
					success: function() {
						// console.log('insert divider success')
					}
				})
			},
			clear() {
				uni.showModal({
					title: '清空编辑器',
					content: '确定清空编辑器全部内容？',
					success: res => {
						if (res.confirm) {
							this.editorCtx.clear({
								success: function(res) {
									console.log("clear success")
								}
							})
						}
					}
				})
			},
			removeFormat() {
				this.editorCtx.removeFormat()
			},
			insertDate() {
				const date = new Date()
				const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
				this.editorCtx.insertText({
					text: formatDate
				})
			},
			insertImage() {
				let that = this;
				uni.chooseImage({
					count: 1,
					success: (res) => {
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
									that.editorCtx.insertImage({
										src: data.result,
										alt: '图像',
										success: function() {
											console.log('insert image success')
										}
									})
									uni.hideLoading();
								}
							}
						});
					}
				})
			},


		}
	}
</script>

<style lang="scss" scoped>
	@import "./editor-icon.css";

	.float-empty {
		height: 120rpx;
		width: 100%;
		display: block;
		background: #fff;
	}

	.page-body {
		height: calc(100vh - var(--window-top) - var(--status-bar-height));
	}

	.wrapper {
		height: 100%;
	}

	.editor-wrapper {
		height: calc(100vh - var(--window-top) - var(--status-bar-height) - 140px);
		// height: auto;
		background: #fff;
	}

	.iconfont {
		display: inline-block;
		padding: 1px 2px;
		width: 24px;
		height: 24px;
		cursor: pointer;
		font-size: 20px;
	}

	.toolbar {
		box-sizing: border-box;
		border-bottom: 0;
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
		padding: 8px 8px;
	}

	.ql-container {
		box-sizing: border-box;
		padding: 12px 15px;
		width: 100%;
		min-height: 30vh;
		height: 70%;
		margin-top: 20px;
		font-size: 16px;
		line-height: 1.5;
	}

	.ql-active {
		color: #06c;
	}

	.release-btn {
		position: fixed;
		display: flex;
		justify-content: center;
		left: 0;
		bottom: 0;
		width: 750rpx;
		// height: 20rpx;
		background-color: #ffffff;

		.btn {
			width: 690rpx;
			height: 90rpx;
			// background: #323233;
			background: linear-gradient(#121212, #666666);
			border-radius: 10rpx;
			font-size: 28rpx;
			font-weight: 500;
			color: #FFFFFF;
			line-height: 90rpx;
			text-align: center;
		}
	}

	.one-line {
		.top {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.title {
				font-size: 30rpx;
				font-weight: 700;
				color: #000000;
				line-height: 42rpx;
				padding-left: 20rpx;
			}

			.num {
				font-size: 24rpx;
				color: #000000;
				line-height: 33rpx;
				opacity: 0.5;
			}
		}

		.content {
			margin-top: 26rpx;
			padding-left: 20rpx;

			.txt {
				font-size: 30rpx;
				color: #000000;
				line-height: 42rpx;
			}
		}
	}

	.choose-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #e3e3e3;

		&:last-child {
			border: 0;
		}

		.txt {
			margin-left: 20rpx;
			font-size: 30rpx;
			color: #000000;
		}

		.sw {
			margin-left: 300rpx;
		}

		.inputStyle {
			margin-left: 60rpx;
			width: 400rpx;
		}

		.radio {
			margin-right: auto;
			position: absolute;
			right: 0;
		}

		.icon {
			width: 40rpx;
			height: 40rpx;
		}

		.u-icon {
			margin-left: auto;
			color: #999;
		}

		.add-icon {
			margin-left: 0;
		}
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
		background-color: #F5F5F5;

	}

	.slot-txt {
		margin-top: 17rpx;
		font-size: 24rpx;
		color: #000000;
		line-height: 33rpx;
		opacity: 0.5;
	}
</style>