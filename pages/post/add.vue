<template>
	<view class="container">
		<my-navbar title="发帖子" :navBg="navBg">
		</my-navbar>
		<view class="innerContainer">
			<view class="one-line" style="margin-top: 38rpx;">
				<view class="top">
					<view class="title">
						<input class="txt" type="text" placeholder="输入标题" maxlength="30" v-model="form.title">
					</view>
					<view class="num">
						{{form.title.length}}/30
					</view>
				</view>
				<u-line margin="25rpx 0 0 0" length="690rpx" color="#F6F6F6"></u-line>
			</view>
			<u-line color="#c8c8c8"></u-line>
			<!-- 内容 -->
			<view class="one-line">
				<view class="content">
					<textarea placeholder="请尽情发挥吧..." class="txt input-text post-txt" maxlength="1000"
						:auto-height="true" v-model="form.content"></textarea>
				</view>
				<u-line length="690rpx" color="#F6F6F6" margin="20rpx 0 32rpx 0"></u-line>
			</view>
			<!-- 上传图片 -->
			<view v-if="form.type == 1" style="transform: translateX(-10rpx);">
				<u-upload ref="uUpload" :size-type="['original']" name="Image" :max-count="9" :header="header"
					:action="uploadImgUrl" @on-uploaded="submit" :auto-upload="false" :custom-btn="true">
					<view slot="addBtn" class="slot-btn">
						<u-icon name="plus" size="40" color="#6f6f6f"></u-icon>
						<view class="slot-txt">
							上传图片
						</view>
					</view>
				</u-upload>
				<u-line length="690rpx" color="#F6F6F6" margin="30rpx 0 33rpx 0"></u-line>
			</view>
			<!-- 上传视频 -->
			<block v-if="form.type == 2">
				<view v-if="form.media.length == 0" class="upload-wrap" @click="chooseVideo">
					<image class="icon" src="../static/video.png"></image>
					<text>上传视频</text>
				</view>
				<video v-if="form.media.length > 0" @click="chooseVideo" :controls="false" :show-center-play-btn="false"
					class="upload-video" :src="form.media[0]"></video>
			</block>
			<!-- 话题选择 -->
			<scroll-view class="scroll-view_H" scroll-x="true">
				<view class="topic-list">
					<view class="topic-item" v-for="item in topicList" :key="item.id" @click="chooseTopic(item)"
						:class="{active:item.id == form.discussId}">
						<image src="../static/community/topic.png" mode="" v-if="item.id == form.discussId"></image>
						<image src="../static/community/topic-grey.png" mode="" v-else></image>
						{{item.title}}
						<!-- <image src="@/static/images/close.png" mode="" v-if="item.id == form.discussId"></image> -->
					</view>
				</view>
			</scroll-view>
			<!-- 选择圈子 -->
			<navigator v-if="isTopic && false" url="/pages/topic/choose-topic/choose-topic" class="choose-item">
				<image class="icon" src="../static/p_1.png"></image>
				<text class="txt">{{ topicName }}</text>
				<u-icon class="u-icon" name="arrow-right"></u-icon>
			</navigator>
			<!-- 选择话题 -->
			<navigator v-if="form.topicId && false"
				:url="'/pages/discuss/choose-discuss/choose-discuss?topicId=' + form.topicId" class="choose-item">
				<image class="icon" src="../static/m_1.png"></image>
				<text class="txt">{{ disName }}</text>
				<u-icon class="u-icon" name="arrow-right"></u-icon>
			</navigator>
			<!-- 付费贴价格 -->
			<view class="choose-item" v-if="form.cut==1">
				<image class="icon" src="../static/price.png"></image>
				<text class="txt">付费贴单价</text>
				<u-input class="inputStyle" placeholder="查看详情内容需支付金额" border="surround" type="digit" clearable
					v-model="form.pay" @change="inputChange"></u-input>
			</view>
			<!-- 所在位置 -->
			<view @click="chooseLocation" class="choose-item" style="margin-bottom: 60rpx;" v-if="false">
				<u-icon class="icon add-icon" name="map" color="#999" size="40"></u-icon>
				<text class="txt">{{ form.address || '所在位置' }}</text>
				<u-icon class="u-icon" name="arrow-right"></u-icon>
			</view>
			<!-- 发布按钮 -->
			<view class="release-btn">
				<view class="btn" v-if="form.type == 1" @click="uploadImg">
					发布
				</view>
				<view class="btn" v-if="form.type == 2" @click="videoSubmit">
					发布
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import hTips from '@/components/h-tips/h-tips.vue';
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				uploadImgUrl: this.$c.domain + 'common/upload',
				topicName: '选择圈子',
				disName: '选择话题',
				typeName: '普通贴',
				form: {
					title: '',
					type: 1,
					topicId: '',
					discussId: '',
					content: '',
					media: [],
					longitude: 0,
					latitude: 0,
					address: '',
					cut: 0,
					pay: '',
					brief: ''
				},
				header: {
					token: uni.getStorageSync('token')
				},
				isTopic: true,
				switch2: 0,

				radiolist1: [{
						name: '普通贴',
						disabled: false
					},
					{
						name: '付费贴',
						disabled: false
					}
				],
				radiovalue1: '普通贴',
				payPostBtn: false,
				//只缓存标题和内容这两项：视频和图文贴公用同一缓存
				tmpForm: {
					title: '',
					content: '',
					media: '' //注意这里只对视频生效，文本图片是临时路径未上传 所以不能保存
				},
				isDraft: false,
				topicList: [],
				// 分享相关
				shareImage: '', // 从OH卡分享过来的图片
				pictureCard: '', // 从OH卡分享过来的pictureCard
				isFromShare: false // 是否来自分享
			};
		},
		components: {
			hTips
		},
		onLoad(options) {
			this.form.type = options.type;
			if (options.type == 2) {
				this.checkVideoOpen()
			}
			this.checkPayPostBtn()
			this.checkDraft()
			if (options.isTopic) {
				this.isTopic = options.isTopic;
			}

			if (options.topicId) {
				this.form.topicId = options.topicId;
				this.isTopic = false;
			}
			if (options.discussId) {
				this.form.discussId = options.discussId;
				this.disName = options.disName
			}
			
			// 处理从OH卡分享过来的图片
			if (options.shareImage) {
				this.shareImage = decodeURIComponent(options.shareImage);
				this.isFromShare = true;
			}
			if (options.pictureCard) {
				this.pictureCard = decodeURIComponent(options.pictureCard);
				this.isFromShare = true;
			}
			if (this.isFromShare) {
				// 设置发布到指定话题
				this.form.discussId = 1005;
				// 将分享图片添加到上传组件中
				this.$nextTick(() => {
					this.addShareImageToUpload();
				});
			}

			let location = uni.getStorageSync('location_info');
			this.form.longitude = location.longitude;
			this.form.latitude = location.latitude;
			this.getTopicList();
		},
		onShow() {
			if (!uni.getStorageSync('hasLogin')) {
				uni.navigateTo({
					url: "/pages/user/go-login"
				})
			}
		},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		//onBackPress在微信小程序中不生效 所以单独放到onUnload处理
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
								if (this.form.type == 1) {
									uni.removeStorageSync('linfengTextTmpData');
								} else {
									uni.removeStorageSync('linfengVideoTmpData');
								}
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
		//onBackPress在微信小程序中不生效 所以单独放到onUnload处理
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
							if (this.form.type == 1) {
								uni.removeStorageSync('linfengTextTmpData');
							} else {
								uni.removeStorageSync('linfengVideoTmpData');
							}
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
			chooseTopic(item) {
				// 如果点击的是已选中的话题，则取消选择
				if (this.form.discussId === item.id) {
					this.form.discussId = null;
				} else {
					this.form.discussId = item.id;
				}
			},
			getTopicList() {
				this.$H.post('discuss/addPostList').then(res => {
					if (res.code == 200) {
						this.topicList = res.data
					}
				})
			},
			hasFormChanged() {
				this.tmpForm.title = this.form.title
				this.tmpForm.content = this.form.content
				if (this.form.type == 2) {
					this.tmpForm.media = this.form.media
				}
				const changedKeys = Object.keys(this.tmpForm).filter(key => {
					return !this.$f.isEmpty(this.tmpForm[key]);
				});
				// console.log('是否编辑', changedKeys.length > 0);
				return changedKeys.length > 0;
			},
			saveDraft() {
				if (this.form.type == 1) {
					uni.setStorage({
						key: 'linfengTextTmpData',
						data: this.tmpForm,
						success: function() {},
						fail: function(err) {},
						complete() {
							uni.navigateBack()
						}
					});
				} else {
					uni.setStorage({
						key: 'linfengVideoTmpData',
						data: this.tmpForm,
						success: function() {},
						fail: function(err) {},
						complete() {
							uni.navigateBack()
						}
					});
				}

			},
			checkDraft() {
				var that = this
				if (that.form.type == 1) {
					uni.getStorage({
						key: 'linfengTextTmpData',
						success: function(res) {
							const retrievedTmpForm = res.data;
							// console.log('从本地缓存中读取的数据：', retrievedTmpForm);
							that.form.title = retrievedTmpForm.title
							that.form.content = retrievedTmpForm.content
						},
						fail: function(err) {}
					});
				} else {
					uni.getStorage({
						key: 'linfengVideoTmpData',
						success: function(res) {
							const retrievedTmpForm = res.data;
							// console.log('从本地缓存中读取的数据：', retrievedTmpForm);
							that.form.title = retrievedTmpForm.title
							that.form.content = retrievedTmpForm.content
							if (that.form.type == 2) {
								that.form.media = retrievedTmpForm.media
							}
						},
						fail: function(err) {}
					});
				}
			},
			checkVideoOpen() {
				this.$H.get('user/isOpen').then(res => {
					if (res.result == 0) {
						this.$f.toast("模块未开启")
						setTimeout(function() {
							uni.switchTab({
								url: '/pages/index/index'
							});
						}, 1500);
					}
				});
			},
			inputChange(n) {},
			groupChange(n) {},
			radioChange(n) {

				if (n == '普通贴') {
					this.form.cut = 0;
					this.typeName = '普通贴';
				} else if (n == '付费贴') {
					this.form.cut = 1;
					this.typeName = '付费贴';
				}
			},
			chooseVideo() {
				var self = this;
				uni.chooseVideo({
					count: 1,
					sourceType: ['camera', 'album'],
					success: function(res) {
						let viedoPath = res.tempFilePath;
						if (res.size > 62914560) {
							uni.showToast({
								title: "视频不得大于60M",
								icon: 'none'
							});
							return;
						}
						uni.showLoading({
							mask: true,
							title: '上传中'
						});

						uni.uploadFile({
							url: self.$c.domain + 'common/upload',
							filePath: viedoPath,
							name: 'Image',
							header: {
								token: uni.getStorageSync('token')
							},
							success: uploadFileRes => {
								let upData = JSON.parse(uploadFileRes.data);
								if (upData.code == 0) {
									self.form.media.push(upData.result);
								} else if (upData.code == 500) {
									uni.showToast({
										title: upData.msg,
										icon: 'none'
									});
								}
							},
							complete() {
								uni.hideLoading();
							}
						});
					}
				});
			},
			uploadImg() {
				// 检查是否上传了图片
				const uploadComponent = this.$refs.uUpload;
				if (!uploadComponent.lists || uploadComponent.lists.length === 0) {
					this.$u.toast('请至少上传一张图片');
					return;
				}

				if (!this.form.content) {
					this.$u.toast('内容不能为空');
					return;
				}
				if (!this.form.title) {
					this.$u.toast('标题不能为空');
					return;
				}
				if (this.form.cut == 1) {
					var ret = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
					if (!ret.test(this.form.pay)) {
						this.$u.toast('输入金额不合法');
						return;
					}
					if (this.form.pay <= 0) {
						this.$u.toast('输入金额必须大于0');
						return;
					}
					if (this.form.pay > 100) {
						this.$u.toast('输入金额必须小于100');
						return;
					}
					if (!this.form.brief) {
						this.$u.toast('简介必须填写');
						return;
					}
				}
				uni.showLoading({
					mask: true,
					title: '发布中'
				});
				this.$refs.uUpload.upload();
			},
			chooseLocation() {
				let that = this;
				uni.chooseLocation({
					success: function(res) {
						that.form.address = res.name;
						that.form.latitude = res.latitude;
						that.form.longitude = res.longitude;
					},
					fail(err) {
						console.log(err)
					}
				});
			},
			videoSubmit() {
				if (this.form.media.length == 0) {
					this.$u.toast('请上传视频');
					return;
				}

				// if (!this.form.topicId) {
				// 	this.$u.toast('请选择圈子');
				// 	return;
				// }
				if (!this.form.content) {
					this.$u.toast('内容不能为空');
					return;
				}
				if (!this.form.title) {
					this.$u.toast('标题不能为空');
					return;
				}
				uni.showLoading({
					mask: true,
					title: '发布中'
				});
				this.$H.post('post/addPost', this.form).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						this.isDraft = true
						uni.removeStorageSync('linfengVideoTmpData');
						uni.redirectTo({
							url: '/pages/post/video-detail?id=' + res.result
						});
					} else {
						this.$f.toast(res.msg)
					}

				});
			},
			submit(e) {
				uni.showLoading({
					mask: true,
					title: '发布中'
				});

				const uploadComponent = this.$refs.uUpload;
				let mediaList = [];
				if (uploadComponent && Array.isArray(uploadComponent.lists)) {
					uploadComponent.lists.forEach((it) => {
						const url = it && it.url;
						const filePath = it && it.file && it.file.path;
						const isRemoteOnly = url && !filePath;
						if (isRemoteOnly) mediaList.push(url);
					});
				}

				if (Array.isArray(e)) {
					e.forEach((item) => {
						let resp = item && item.response;
						if (typeof resp === 'string') {
							try { resp = JSON.parse(resp); } catch (err) {}
						}
						if (resp && resp.result) {
							mediaList.push(resp.result);
						} else if (item && item.url) {
							mediaList.push(item.url);
						}
					});
				}

				mediaList = Array.from(new Set(mediaList));
				this.form.media = mediaList;

				this.$H.post('post/addPost', this.form).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						this.isDraft = true
						uni.removeStorageSync('linfengTextTmpData');
						uni.redirectTo({
							url: '/pages/post/detail?id=' + res.result
						});
					} else {
						this.$f.toast(res.msg)
					}

				});
			},
			checkPayPostBtn() {
				this.$H.get('system/checkPayPostBtn').then(res => {
					if (res.code == 0) {
						this.payPostBtn = res.isOpen
					}
				});
			},
			addShareImageToUpload() {
				// 将分享图片添加到上传组件中
				const uploadComponent = this.$refs.uUpload;
				if (!uploadComponent) return;
				const pushToUpload = (imgUrl, shouldUpload) => {
					if (!imgUrl) return;
					const item = {
						url: imgUrl,
						progress: 0,
						error: false
					};
					if (shouldUpload) {
						item.file = { path: imgUrl };
					} else {
						// 远程图片，标记为已上传成功，避免组件再次尝试上传
						item.progress = 100;
						item.status = 'success';
						item.response = { result: imgUrl };
					}
					uploadComponent.lists.push(item);
				};
				// 根据URL判断哪些需要上传，保证 pictureCard 在第一个
				pushToUpload(this.pictureCard, this._shouldUploadForUrl(this.pictureCard));
				pushToUpload(this.shareImage, this._shouldUploadForUrl(this.shareImage));
			},
			// 判定是否需要上传：本地临时路径（http://usr/, http://tmp/, file:// 或无协议）需要上传；正常 http/https 远程资源不上传
			_shouldUploadForUrl(url) {
				if (!url) return false;
				if (/^(file:\/\/|http:\/\/usr\/|http:\/\/tmp\/)/i.test(url)) return true;
				if (!/^https?:\/\//i.test(url)) return true;
				return false;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		position: relative;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		padding: 0;
		margin: 0;
		padding-bottom: 200rpx;

	}

	.container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 432rpx;
		z-index: -1;
		background-image: url('https://ceping.qinglan.cn/uniapp/new/index/1.png');
		background-size: cover;
		background-position: center;
	}

	.innerContainer {
		padding: $gap;
	}


	.title-input {
		border-bottom: 1px solid #F5F5F5;
		margin: 20rpx 0;
		padding: 20rpx 0;
	}

	.post-txt {
		width: 100%;
		padding: 20rpx 0;
		min-height: 300rpx;
	}

	.upload-wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 180rpx;
		height: 180rpx;
		background-color: #F5F5F5;
		margin-top: 30rpx;
		border-radius: 10rpx;

		.icon {
			width: 50rpx;
			height: 50rpx;
		}

		text {
			font-size: 24rpx;
		}
	}

	.upload-video {
		width: 180rpx;
		height: 180rpx;
		margin-top: 30rpx;
	}

	.choose-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #F5F5F5;

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

	.one-line {
		.top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			// padding: 20rpx;
			
			.title {
				flex: 1;
				margin-right: 20rpx;
				
				.txt {
					width: 100%;
					height: 50rpx;
					font-size: 32rpx;
					color: #333;
					
					&::placeholder {
						color: #999;
					}
				}
			}
			
			.num {
				font-size: 24rpx;
				color: #999;
				white-space: nowrap;
			}
		}

		.content {
			margin-top: 26rpx;

			.txt {
				font-size: 30rpx;
				color: #000000;
				line-height: 42rpx;
			}
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

	.release-btn {
		position: fixed;
		display: flex;
		justify-content: center;
		left: 0;
		bottom: 0;
		width: 750rpx;
		// height: 20rpx;
		background-color: $background;
		padding-bottom: $gap;
		z-index: 100;

		.btn {
			width: 690rpx;
			height: 90rpx;
			// background: #323233;
			background: #6986FD;
			border-radius: 10rpx;
			font-size: 28rpx;
			font-weight: 500;
			color: #FFFFFF;
			line-height: 90rpx;
			text-align: center;
		}
	}

	.topic-list {
		display: flex;
		align-items: center;
		// padding: 20rpx 0;
		gap: 20rpx;
		font-weight: 400;
		font-size: 24rpx;
		color: #95959D;
		align-items: center;


		.topic-item {
			background: #F5F5F5;
			border-radius: 8rpx;
			padding: 10rpx 16rpx;
			display: flex;
			align-items: center;
			gap: 10rpx;
			flex-shrink: 0;
		}


		image {
			width: 28rpx;
			height: 28rpx;
		}

		.active {
			color: #6986FD;
			background: #F0F3FF;
		}
	}

	.share-image-section {
		margin-bottom: 30rpx;
		background: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		border: 1rpx solid #F0F0F0;

		.share-image-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 15rpx;

			.share-image-title {
				font-size: 28rpx;
				font-weight: 500;
				color: #333;
			}

			.share-image-remove {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				background-color: #F5F5F5;
				cursor: pointer;

				text {
					font-size: 20rpx;
					color: #999;
				}
			}
		}

		.share-image-container {
			border-radius: 8rpx;
			overflow: hidden;
			border: 1rpx solid #E0E0E0;

			.share-image-preview {
				width: 100%;
				max-height: 400rpx;
				border-radius: 8rpx;
			}
		}
	}
</style>