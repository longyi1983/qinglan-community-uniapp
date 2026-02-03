<template>
	<view class="">
		<!-- #ifdef MP-WEIXIN -->
		<page-container :show="isShow" custom-style="height:100vh;overflow:hidden" :overlay="false"
			@beforeleave="onBeforeLeave">
			<!-- #endif -->
			<view class="container">
				<my-navbar title="解析" :navBg="navBg"></my-navbar>
				<scroll-view scroll-y class="scroll-container" @scroll="onScroll">
					<!-- l-painter组件，用于生成图片 -->
					<l-painter ref="painter" @success="onImageSuccess" @fail="onImageFail" path-type="url"
						custom-style="position: fixed; left: 200%">
						<!-- 主容器，设置背景 -->
						<l-painter-view css="width: 750rpx;padding: 20rpx 0;background: #FBFBFF;">
							<!-- 日记头部信息 -->
							<l-painter-view
								css="width: 686rpx; margin-left: 32rpx; margin-top: 20rpx;text-align: center;">
								<l-painter-text :text="diaryDate"
									css="font-size: 24rpx; color: #666; margin-top: 8rpx;" />
								<l-painter-text :text="diaryTime"
									css="font-size: 24rpx; color: #666; margin-top: 8rpx;" />
								<l-painter-text :text="diaryAuthor"
									css="font-size: 24rpx; color: #666; margin-top: 8rpx;" />
							</l-painter-view>

							<!-- OH卡图片区域 -->
							<l-painter-view css="width: 750rpx; height: 800rpx;" v-if="mode === 'OH'">
								<!-- 背景卡片 -->
								<l-painter-image :src="wordCard"
									css="width: 624rpx; height: 800rpx; margin-left: 63rpx; margin-top: 0; border-radius: 40rpx;" />
								<!-- 前景卡片 -->
								<l-painter-image :src="pictureCard"
									css="width: 461rpx; height: 640rpx; margin-left: 145rpx; margin-top: -720rpx; border-radius: 4rpx; border: 4rpx solid #d05369;" />
							</l-painter-view>

							<!-- 遍历所有聊天记录 -->
							<l-painter-view v-for="(chatItem, index) in displayChatList" :key="index"
								v-if="chatItem && chatItem.content"
								css="width: 686rpx; margin-left: 32rpx; margin-top: 20rpx;background:#FBFBFF">
								<!-- AI消息 (靠左) -->
								<template v-if="!chatItem.isMe">
									<l-painter-image :src="chatItem.icon"
										css="width: 50rpx; height: 50rpx; border-radius: 25rpx;" />
									<l-painter-text :text="chatItem.name"
										css="font-size: 22rpx; color: #888; margin-left: 20rpx; margin-top: 10rpx;" />
									<l-painter-view
										css="max-width: 500rpx; background: #ffffff; border-radius: 12rpx; padding: 15rpx 20rpx; margin-left: 70rpx; margin-top: 8rpx;">
										<l-painter-text :text="$f.removeHashAndStar(chatItem.content)"
											css="max-width: 500rpx;font-size: 24rpx; color: #333;" />
									</l-painter-view>
								</template>
								<!-- 用户消息 (靠右) -->
								<template v-else>
									<l-painter-view css="width: 100%; text-align: right;">
										<l-painter-image :src="chatItem.icon"
											css="width: 50rpx; height: 50rpx; border-radius: 25rpx; margin-left: 636rpx;" />
										<l-painter-text :text="chatItem.name"
											css="font-size: 22rpx; color: #888; margin-top: -40rpx; margin-right: 70rpx; text-align: right;" />
										<l-painter-view>
											<l-painter-text :text="chatItem.content"
												css="max-width: 500rpx;font-size: 24rpx; color: #ffffff;max-width: 500rpx; background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%); border-radius: 12rpx; padding: 15rpx 20rpx; margin-right: 50rpx; margin-top: 8rpx;text-align: left;" />
										</l-painter-view>
									</l-painter-view>
								</template>
							</l-painter-view>
						</l-painter-view>
					</l-painter>
					<view class="innerContainer">
						<view class="content">
							<view class="top">
								<!-- 头像昵称 -->
								<view class="info">
									<u-avatar :src="userInfo.avatar"></u-avatar>
									<text class="nickname">{{ userInfo.username }}</text>
									<text class="word">的解析结果</text>
								</view>
								<!-- OH卡图片 -->
								<view class="oh">
									<u-image width="240rpx" height="240rpx" :src="oh" shape="circle"></u-image>
								</view>
							</view>
							<view class="result">
								<MDParserHighlight :resource="useApiData ? dataList : computedDataList">
								</MDParserHighlight>
								<!-- <text>
									{{dataList}}
								</text> -->
								<!-- <mp-html :content="dataList"></mp-html> -->
							</view>
						</view>

						<!-- 底部栏 -->
						<view class="bottom">
							<view :class="{ 'button': true, 'button-disabled': isAnswering }" @click="reChat">
								试试其他的
							</view>
							<view :class="{ 'button': true, 'button-disabled': isAnswering }" @click="generateImage">
								生成日记
							</view>
							<view v-if="mode === 'OH'" :class="{ 'button': true, 'button-disabled': isAnswering }"
								@click="showArchiveSelectorDialog">
								加入档案
							</view>
						</view>

						<!-- 预览弹窗 -->
						<u-modal v-model="showPreview" title="图片预览" :show-cancel-button="true"
							:show-confirm-button="true" cancel-text="关闭" confirm-text="保存到相册" @confirm="saveToAlbum"
							@cancel="showPreview = false">
							<view class="preview-container">
								<image v-if="previewImage" :src="previewImage" mode="widthFix"
									style="width: 100%; border-radius: 8rpx;" />
							</view>
						</u-modal>

						<!-- 分享渠道选择弹窗 -->
						<u-popup v-model="showShareDialog" mode="center" width="80%" height="70vh" border-radius="20rpx"
							:mask-close-able="true" @close="closeShareDialog">
							<view class="share-popup-container">
								<!-- 顶部标题栏 -->
								<view class="share-header">
									<view class="share-title">分享解析结果</view>
									<view class="share-close-btn" @click="closeShareDialog">
										<text>✕</text>
									</view>
								</view>

								<!-- 图片预览区域（可滚动） -->
								<scroll-view scroll-y class="share-image-scroll">
									<view class="share-image-container">
										<image v-if="previewImage" :src="previewImage" mode="widthFix"
											class="share-image" @click="previewImageFullscreen" />
									</view>
								</scroll-view>

								<!-- 分享方式底部 -->
								<view class="share-actions">
									<view class="share-actions-title">选择分享方式</view>
									<view class="share-grid">
										<view v-for="(channel, index) in shareChannels" :key="index" class="share-item"
											@click="handleShareChannel(channel)">
											<view class="share-icon">{{ channel.icon }}</view>
											<text class="share-name">{{ channel.name }}</text>
										</view>
									</view>
								</view>
							</view>
						</u-popup>

						<!-- 档案选择器 -->
						<archive-selector :show="showArchiveSelector" @confirm="onArchiveSelected"
							@close="onArchiveSelectorClose" @newArchive="onNewArchive" />
					</view>

				</scroll-view>
			</view>
			<!-- #ifdef MP-WEIXIN -->
		</page-container>
		<!-- #endif -->


	</view>
</template>

<script>
import scrollMixin from '@/mixins/scrollMixin.js';
import MDParserHighlight from "@/ai/components/MDParserHighlight/MDParserHighlight.vue"
export default {
	mixins: [scrollMixin],
	components: {
		MDParserHighlight,
	},
	data() {
		return {
			userInfo: this.$store.state.loginUserInfo,
			oh: this.$f.geturl(`/uniapp/new/ai/oh.png`),
			isShow: true, // page-container的显示状态
			backgroundImage: 'https://ceping.qinglan.cn/uniapp/new/index/1.png',
			wordCard: '',
			pictureCard: '',
			displayChatList: [],
			showPreview: false,
			previewImage: '',
			// 新增分享相关数据
			showShareDialog: false,
			shareChannels: [{
				name: '保存到相册',
				icon: '📱',
				action: 'saveToAlbum'
			},
			{
				name: '分享到社区',
				icon: '🏠',
				action: 'shareToCommunity'
			},
				// { name: '微信好友', icon: '💬', action: 'shareToWeChat' },
				// { name: '朋友圈', icon: '🌍', action: 'shareToMoments' },
				// { name: '复制链接', icon: '🔗', action: 'copyLink' }
			],
			// 档案选择器相关
			showArchiveSelector: false,
			// 模式参数
			mode: 'OH',
			// 日记头部信息
			diaryDate: '',
			diaryTime: '',
			diaryAuthor: '',
			sessionId: '',
			// 新增
			aiInfo: {
				img: '',
				name: ''
			},
			dataList: '', // 用于MDParserHighlight
			useApiData: false, // 新增：标记是否用接口数据
			back: null,
			archiveId: ""
		};
	},
	// 监听返回按钮事件 (APP和H5平台生效)
	onBackPress(options) {
		// #ifdef APP-PLUS || H5
		if (this.isAnswering) {
			uni.showToast({
				title: 'AI正在思考中，请稍后...',
				icon: 'none'
			});
			return false;
		}
		// uni.showModal({
		// 	title: '提示',
		// 	content: '确定要返回吗？',
		// 	success: (res) => {
		// 		if (res.confirm) {
		// 			// 用户确认返回，跳转到测试分类页
		// 			uni.redirectTo({ url: '/ai/mode/mode' })
		// 		} else {
		// 			return false;
		// 		}
		// 	}
		// });
		// return false;
		// #endif
	},
	computed: {
		isAnswering() {
			return this.$store.state.isAnswering;
		},
		computedDataList() {
			try {
				const aiDataList = this.$store.state.aiDataList;
				if (aiDataList && aiDataList.length > 0 && aiDataList[0].content) {
					const content = aiDataList[0].content;
					return content;
				}
				return '';
			} catch (error) {
				console.error('获取解析内容失败:', error);
				return '';
			}
		}
	},
	mounted() {
		// 初始化日记头部信息
		const now = new Date();
		// 格式化日期：2024年3月21日
		this.diaryDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
		// 格式化时间：星期四 下午 3:30
		const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
		const period = now.getHours() < 12 ? '上午' : '下午';
		const hours = now.getHours() > 12 ? now.getHours() - 12 : now.getHours();
		this.diaryTime = `星期${weekdays[now.getDay()]} ${period} ${hours}:${String(now.getMinutes()).padStart(2, '0')}`;
		// 设置作者信息
		this.diaryAuthor = `作者：${this.userInfo.username || '匿名用户'}`;
	},
	onShow() {
		// 页面显示时触发全局事件，通知档案选择器刷新
		uni.$emit('pageShow');
	},
	onLoad(option) {
		this.mode = option.mode || 'OH';
		this.sessionId = option.id || option.sessionId || '';
		if (option.id) {
			this.useApiData = true;
			// 先查询历史详情，然后根据aiButtonName决定如何获取AI信息
			this.getHistoryDetail();
		} else {
			this.useApiData = false;
			this.loadChatData();
		}
		this.back = option.back || '';
		if (option.archiveId) this.archiveId = option.archiveId;
	},
	watch: {
		// 监听 dataList 变化，自动添加到 displayChatList
		dataList: {
			handler(newVal, oldVal) {
				// 只有当内容发生变化且不为空时才添加
				if (newVal && newVal.trim() && newVal !== oldVal) {
					this.$nextTick(() => {
						this.addDataListToChat();
					});
				}
			},
			immediate: false // 不立即执行，避免初始化时重复添加
		},
		computedDataList: {
			handler(newVal, oldVal) {
				if (newVal && newVal.trim() && newVal !== oldVal) {
					this.$nextTick(() => {
						this.addDataListToChat();
					});
				}
			},
			immediate: false // 不立即执行，避免初始化时重复添加
		},
		// 新增：监听isAnswering变化，实现自动加入档案
		isAnswering: {
			handler(newVal, oldVal) {
				if (oldVal === true && newVal === false && this.archiveId) {
					this.addToArchive();
				}
			},
			immediate: false
		}
	},
	methods: {
		addDataListToChat() {
			try {
				if (this.useApiData) {
					// 有传入id时，找到isMe为false的项并替换content
					const aiChatItem = this.displayChatList.find(item => !item.isMe);
					this.displayChatList.push({
						...aiChatItem,
						content: this.dataList,
					});
					console.log("传入id")
				} else {
					// 没有传入id时，直接替换最后一项的content
					console.log("没有传入id", this.displayChatList)
					if (this.displayChatList.length > 0) {
						this.displayChatList[this.displayChatList.length - 1].content = this.computedDataList;
					}
				}
				console.log('已将 dataList 内容添加到 displayChatList', this.displayChatList);
			} catch (error) {
				console.error('添加 dataList 到 displayChatList 失败:', error);
			}
		},
		// 处理滚动事件
		onScroll(e) {
			// 传递滚动事件给mixin处理
			this.handlePageScroll(e.detail);
		},
		// page-container返回事件处理
		onBeforeLeave(e) {
			this.isShow = false;
			if (this.back == 'true') {
				uni.navigateBack();
				return;
			}
			if (this.isAnswering) {
				console.log(11111111111, this.isShow, this.isAnswering)
				uni.showToast({
					title: 'AI正在思考中，请稍后...',
					icon: 'none'
				});
				setTimeout(() => {
					this.isShow = true;
				}, 1000);
				// return;
			} else {
				// 弹窗提示用户
				uni.showModal({
					title: '提示',
					content: '确定要返回吗？',
					success: (res) => {
						if (res.confirm) {
							// 用户确认返回，跳转到测试分类页
							uni.redirectTo({
								url: '/ai/mode/mode'
							})
						} else {
							this.isShow = true;
						}
					}
				});
			}
		},
		// 跳转
		goTo(item) {
			uni.navigateTo({
				url: item.url
			});
		},
		// 重新聊天
		reChat() {
			if (this.isAnswering) {
				uni.showToast({
					title: 'AI正在思考中，请稍后...',
					icon: 'none'
				});
				return;
			}
			// 返回到chat页面
			uni.redirectTo({
				url: '/ai/mode/mode'
			})
		},
		// 加载聊天数据
		loadChatData() {
			try {
				// 从缓存中获取聊天记录
				const savedData = uni.getStorageSync(`ohCardChatData-${this.mode}`);
				console.log("获取聊天记录", 99999999999, savedData)
				if (savedData && savedData.chatHistory) {
					this.wordCard = savedData.wordCard || '';
					this.pictureCard = savedData.pictureCard || '';
					// 加载所有聊天记录，过滤掉空内容，然后反向排序
					this.displayChatList = savedData.chatHistory.reverse();
				} else {
					// 如果没有缓存数据，从store中获取
					const storeData = this.$store.state.aiDataList;
					console.log("获取聊天记录", 888888888888, storeData)
					if (storeData && Array.isArray(storeData)) {
						this.displayChatList = storeData.reverse();
					}
				}
				// 从现有的 displayChatList 中找到 isMe 为 false 的对象（AI回复）
				const aiChatItem = this.displayChatList.find(item => !item.isMe);
				if (aiChatItem) {
					this.displayChatList[this.displayChatList.length - 1] = {
						...aiChatItem,
						content: "",
						time: Date.now()
					};
				}
			} catch (error) {
				console.error('加载聊天数据失败:', error);
				this.displayChatList = [];
			}
		},

		// 生成图片（直接生成，无需感想弹窗）
		generateImage() {
			if (this.isAnswering) {
				uni.showToast({
					title: 'AI正在思考中，请稍后...',
					icon: 'none'
				});
				return;
			}
			// 直接生成图片
			this.$nextTick(() => {
				setTimeout(() => {
					this.$refs.painter.canvasToTempFilePathSync({
						fileType: "jpg",
						quality: 1,
						success: (res) => {
							console.log('图片生成成功:', res.tempFilePath, this.displayChatList);
							this.previewImage = res.tempFilePath;
							this.showShareDialog = true;
						},
						fail: (error) => {
							console.error('图片生成失败:', error);
							uni.showToast({
								title: '生成图片失败',
								icon: 'error'
							});
						}
					});
				}, 500);
			});
		},

		// 图片生成成功
		onImageSuccess(tempFilePath) {
			uni.hideLoading();
			console.log('图片生成成功:', tempFilePath);

			this.previewImage = tempFilePath;
			this.showShareDialog = true;
		},

		// 图片生成失败
		onImageFail(error) {
			uni.hideLoading();
			console.error('图片生成失败:', error);
			uni.showToast({
				title: '生成图片失败',
				icon: 'error'
			});
		},
		// 加入档案
		addToArchive() {
			if (this.isAnswering) {
				uni.showToast({
					title: 'AI正在思考中，请稍后...',
					icon: 'none'
				});
				return;
			}
			// 自动加入档案时，archiveId 已有值
			if (!this.archiveId) return;

			let params = {
				archiveBagId: this.archiveId,
				type: 4,
				recordId: this.sessionId
			};

			this.$H.post('archiveData', params)
				.then(res => {
					if (res.code == 200) {
						this.showArchiveSelector = false;
						// 弹窗询问用户是否返回档案页
						uni.showModal({
							title: '提示',
							content: '已经自动加入档案，是否返回档案页？',
							success: (modalRes) => {
								if (modalRes.confirm) {
									uni.redirectTo({
										url: `/personal/archive/archive?id=${this.archiveId}`
									});
								}
							}
						});
					} else {
						uni.showToast({
							title: res.msg || '加入档案失败',
							icon: 'error'
						});
					}
				})
				.catch(err => {
					console.error('加入档案失败:', err);
					uni.showToast({
						title: '加入档案失败',
						icon: 'error'
					});
				});
		},
		// 截断文本
		truncateText(text, maxLength) {
			if (!text) return '';
			if (text.length > maxLength) {
				return text.slice(0, maxLength) + '...';
			}
			return text;
		},
		// 为图片生成优化的文本截断
		truncateTextForImage(text, maxLength = 30) {
			if (!text) return '';
			// 移除HTML标签
			const cleanText = text.replace(/<[^>]*>/g, '');
			if (cleanText.length > maxLength) {
				return cleanText.slice(0, maxLength) + '...';
			}
			return cleanText;
		},
		// 保存到相册
		saveToAlbum() {
			if (this.previewImage) {
				uni.saveImageToPhotosAlbum({
					filePath: this.previewImage,
					success: () => {
						uni.showToast({
							title: '图片已保存到相册',
							icon: 'success'
						});
						this.showShareDialog = false;
					},
					fail: (err) => {
						console.error('保存图片失败:', err);
						uni.showModal({
							title: '提示',
							content: '保存图片失败，请检查相册权限',
							showCancel: false
						});
					}
				});
			}
		},

		// 处理分享渠道选择
		handleShareChannel(channel) {
			switch (channel.action) {
				case 'saveToAlbum':
					this.saveToAlbum();
					break;
				case 'shareToCommunity':
					this.shareToCommunity();
					break;
				case 'shareToWeChat':
					this.shareToWeChat();
					break;
				case 'shareToMoments':
					this.shareToMoments();
					break;
				case 'copyLink':
					this.copyLink();
					break;
				default:
					break;
			}
		},

		// 分享到社区
		shareToCommunity() {
			if (this.previewImage) {
				// 关闭分享弹窗
				this.showShareDialog = false;
				let url = `/pages/post/add?type=1&shareImage=${encodeURIComponent(this.previewImage)}`
				if (this.mode == 'OH') {
					url += `&pictureCard=${encodeURIComponent(this.pictureCard)}&from=ohCard`
				}
				// 跳转到发帖页面，传递图片URL和类型参数
				uni.navigateTo({
					url
				});
			} else {
				uni.showToast({
					title: '图片生成中，请稍后...',
					icon: 'none'
				});
			}
		},

		// 分享到微信好友
		shareToWeChat() {
			// #ifdef MP-WEIXIN
			if (this.previewImage) {
				uni.shareImageMessage({
					imageUrl: this.previewImage,
					title: '爱卡解析结果',
					success: () => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						});
						this.showShareDialog = false;
					},
					fail: (err) => {
						console.error('分享失败:', err);
						uni.showToast({
							title: '分享失败',
							icon: 'error'
						});
					}
				});
			}
			// #endif
			// #ifndef MP-WEIXIN
			uni.showToast({
				title: '当前平台不支持此分享方式',
				icon: 'none'
			});
			// #endif
		},

		// 分享到朋友圈
		shareToMoments() {
			// #ifdef MP-WEIXIN
			if (this.previewImage) {
				uni.shareToWeRun({
					imageUrl: this.previewImage,
					title: '爱卡解析结果',
					success: () => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						});
						this.showShareDialog = false;
					},
					fail: (err) => {
						console.error('分享失败:', err);
						uni.showToast({
							title: '分享失败',
							icon: 'error'
						});
					}
				});
			}
			// #endif
			// #ifndef MP-WEIXIN
			uni.showToast({
				title: '当前平台不支持此分享方式',
				icon: 'none'
			});
			// #endif
		},

		// 复制链接
		copyLink() {
			// 这里可以根据实际需求生成分享链接
			const shareText = `我在栖心港完成了爱卡解析，快来看看我的结果吧！`;
			uni.setClipboardData({
				data: shareText,
				success: () => {
					uni.showToast({
						title: '链接已复制',
						icon: 'success'
					});
					this.showShareDialog = false;
				},
				fail: (err) => {
					console.error('复制失败:', err);
					uni.showToast({
						title: '复制失败',
						icon: 'error'
					});
				}
			});
		},

		// 关闭分享弹窗
		closeShareDialog() {
			this.showShareDialog = false;
		},

		// 预览图片全屏
		previewImageFullscreen() {
			if (this.previewImage) {
				uni.previewImage({
					urls: [this.previewImage],
					current: this.previewImage
				});
			}
		},

		// 显示档案选择器
		showArchiveSelectorDialog() {
			console.log('显示档案选择器');
			this.showArchiveSelector = true;
		},

		// 档案选择确认
		onArchiveSelected(selectedArchive) {
			console.log('选中的档案:', selectedArchive);

			// 如果没有选择档案，直接返回
			if (!selectedArchive || !selectedArchive.id) {
				console.log('没有选择档案');
				return;
			}

			let params = {
				archiveBagId: selectedArchive.id,
				type: 4,
				recordId: this.sessionId
			}

			this.$H.post('archiveData', params)
				.then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '加入档案成功',
							icon: 'success'
						});
						this.showArchiveSelector = false;
					} else {
						uni.showToast({
							title: res.msg || '加入档案失败',
							icon: 'error'
						});
					}
				})
				.catch(err => {
					console.error('加入档案失败:', err);
					uni.showToast({
						title: '加入档案失败',
						icon: 'error'
					});
				});
		},

		// 关闭档案选择器
		onArchiveSelectorClose() {
			this.showArchiveSelector = false;
		},

		// 处理新建档案事件
		onNewArchive() {
			console.log('用户点击了新建档案');
		},

		// 拉取AI信息
		getAiInfo() {
			return new Promise((resolve) => {
				this.$H.get('appusermenu/list', {
					code: 'oh-card-ai',
					status: 1
				}).then(res => {
					if (res.code == 200 && res.rows && res.rows[0].appUserMenuList && res.rows[0]
						.appUserMenuList[0]) {
						this.aiInfo = res.rows[0].appUserMenuList[0];
					}
					resolve();
				});
			});
		},
		// 通过aiButton/findPage获取AI信息
		getAiInfoByButton(aiButtonName) {
			return new Promise((resolve) => {
				this.$H.get('aiButton/findPage', {
					pageSize: 100
				}).then(res => {
					if (res.code == 200 && res.rows && res.rows.length > 0) {
						// 找到name相等的对象作为aiInfo
						const matchedAi = res.rows.find(item => item.name === aiButtonName);
						if (matchedAi) {
							this.aiInfo = {
								img: matchedAi.imgUrl,
								name: matchedAi.name,
								logo: matchedAi.logoUrl,
								desc: matchedAi.desc,
								timbre: matchedAi.timbre
							};
						}
					}
					resolve();
				}).catch(() => {
					resolve();
				});
			});
		},
		// 拉取历史详情
		getHistoryDetail() {
			if (!this.sessionId) return;
			this.$H.get('userHistory/' + this.sessionId).then(res => {
				if (res.code === 200 && res.data) {
					const data = res.data;

					// 根据aiButtonName决定如何获取AI信息
					const aiButtonName = data.aiButtonName;
					let aiInfoPromise;

					if (!aiButtonName) {
						// 如果aiButtonName为空，使用原来的getAiInfo方法
						aiInfoPromise = this.getAiInfo();
					} else {
						// 如果aiButtonName不为空，调用aiButton/findPage
						aiInfoPromise = this.getAiInfoByButton(aiButtonName);
					}

					// 等待AI信息获取完成后，再处理聊天历史
					aiInfoPromise.then(() => {
						// 1. 解析聊天历史
						let chatList = [];
						try {
							const historyArr = JSON.parse(data.history).history || [];
							for (let item of historyArr) {
								if (item.user !== undefined) {
									chatList.push({
										time: '',
										icon: this.userInfo.avatar,
										name: this.userInfo.username,
										content: item.user,
										isMe: true
									});
								} else if (item.agent !== undefined) {
									chatList.push({
										time: '',
										icon: this.aiInfo.img,
										name: this.aiInfo.name,
										content: item.agent,
										isMe: false
									});
								}
							}
							// 去掉第一项和最后一项
							chatList.shift();
							chatList.pop();
						} catch (e) {
							chatList = [];
						}
						this.displayChatList = chatList;
						console.log('获取历史详情成功:', this.displayChatList);
					});

					// 2. 赋值 resultContent
					this.dataList = data.resultContent || '';
					// 3. 卡片图片
					this.wordCard = data.wordCardUrl || '';
					this.pictureCard = data.flashcardsUrl || '';
				}
			});
		},
	}
};
</script>
<style lang="scss" scoped>
.scroll-container {
	height: calc(100vh - 88rpx);
}

.innerContainer {
	padding: $gap;
	padding-bottom: 200rpx;
}

.container {
	position: relative;
	min-height: 100vh;
	background-color: $background;
	z-index: 1;
	padding: 0;
	margin: 0;
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

.content {
	width: 686rpx;
	background: #FFFFFF;
	border-radius: 30rpx;
	border: 1rpx solid #FFFFFF;
	backdrop-filter: blur(30px);
	margin-top: 52rpx;
	min-height: 300rpx;
}

.top {
	display: flex;
	justify-content: space-between;
	position: relative;
	padding: 32rpx;

	.info {
		width: calc(686rpx - 64rpx - 250rpx);
		height: 100rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-size: 24rpx;
	}

	.nickname {
		width: 140rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.word {
		color: #95959D;
	}

	.oh {
		position: absolute;
		top: -50rpx;
		right: 32rpx;
	}
}

.result {
	padding: $gap;
}

.bottom {
	background-color: #fff;
	width: 750rpx;
	height: 150rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20rpx;

	.button {
		width: 220rpx;
		height: 80rpx;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		border-radius: 16rpx;
		text-align: center;
		line-height: 80rpx;
		color: #fff;
		font-weight: bold;
		font-size: 24rpx;

		&.button-disabled {
			background: #bbbbbb;
			pointer-events: none;
		}
	}

	.button:nth-child(1) {
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);

		&.button-disabled {
			background: #bbbbbb;
		}
	}

	.button:nth-child(2) {
		background: linear-gradient(270deg, #FFE4B8 0%, #FF9D51 100%);

		&.button-disabled {
			background: #bbbbbb;
		}
	}

	.button:nth-child(3) {
		background: linear-gradient(270deg, #BEE2D8 0%, #51A28B 100%);

		&.button-disabled {
			background: #bbbbbb;
		}
	}
}

.preview-container {
	padding: 20rpx;
}

.share-popup-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #fff;
	border-radius: 20rpx;
	padding: 0;
	overflow: hidden;
}

.share-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 30rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
	flex-shrink: 0;
}

.share-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.share-close-btn {
	font-size: 32rpx;
	color: #666;
	padding: 8rpx;
	line-height: 1;
}

.share-image-scroll {
	flex: 1;
	padding: 20rpx;
	background: #f8f9fa;
}

.share-image-container {
	text-align: center;
	padding: 10rpx 0;
	height: 50vh;
}

.share-image {
	width: 100%;
	max-width: 500rpx;
	border-radius: 12rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: all 0.2s ease;
}

.share-image:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.share-actions {
	background: #fff;
	padding: 20rpx 30rpx 30rpx;
	border-top: 1rpx solid #f0f0f0;
	flex-shrink: 0;
}

.share-actions-title {
	font-size: 22rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	text-align: center;
	color: #333;
}

.share-grid {
	display: flex;
	justify-content: space-around;
	flex-wrap: wrap;
	gap: 15rpx;
}

.share-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 15rpx 10rpx;
	border-radius: 12rpx;
	background: #f8f9fa;
	min-width: 100rpx;
	transition: all 0.2s ease;
}

.share-item:active {
	background: #e9ecef;
	transform: scale(0.95);
}

.share-icon {
	font-size: 40rpx;
	margin-bottom: 8rpx;
	line-height: 1;
}

.share-name {
	font-size: 20rpx;
	color: #666;
	text-align: center;
	line-height: 1.2;
}
</style>