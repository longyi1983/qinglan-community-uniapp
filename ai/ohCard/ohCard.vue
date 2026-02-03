<template>
	<view class="container">
		<my-navbar title="爱卡模式" :navBg="0"></my-navbar>
		<!-- 顶层视频弹窗（全页面最外层） -->
		<view v-if="showVideoModal" class="video-modal" @click="closeVideo">
			<view class="video-popup" @click.stop>
				<view class="video-header">
					<text class="video-title">帮助视频</text>
					<view class="close-btn" @click="closeVideo">
						<text class="close-icon">×</text>
					</view>
				</view>
				<video v-if="showVideoPlayer" id="ohCardHelpVideo" :src="videoUrl" class="help-video" controls
					:autoplay="false" :show-center-play-btn="true" :show-play-btn="true" :enable-progress-gesture="true"
					object-fit="contain" @error="onVideoError" @play="onVideoPlay"
					@fullscreenchange="onFullscreenChange" ref="topVideoPlayer"></video>
			</view>
		</view>
		<!-- 洗牌动画 -->
		<!-- 类型选择（type == 0） -->
		<view class="type-select" v-if="type == 0">
			<view class="type-select-title">
				你来访的目的是?
			</view>
			<view class="type-select-subtitle">我们会根据选择为你提供精准的服务</view>
			<view class="type-select-options">
				<view class="type-card" v-for="(card, index) in cardList" :key="index"
					:class="{ active: selectedCardVariant === card.variant }"
					@click="confirmCardVariantDirectly(card.variant)">
					<view class="card-avatar">
						<image :src="card.avatar" class="avatar-image" mode="aspectFill"></image>
					</view>
					<view class="card-content">
						<view class="card-title">{{ card.title }}</view>
						<view class="card-subtitle">{{ card.subtitle }}</view>
					</view>
					<view class="card-arrow">
						<image :src="card.arrow" class="avatar-image" mode="aspectFill"></image>
					</view>
				</view>
			</view>
		</view>

		<view class="shuffle-animation" v-if="type == 1">
			<uni-transition mode-class="slide-left" :show="type == 1">
				<lottie :frames="require('./ohCard.json')" width="750rpx" height="1500rpx" @complete="LoopComplete"
					:loop="false" :speed="1.5"></lottie>
			</uni-transition>
		</view>
		<!-- 选择字卡和图卡 -->
		<view class="choose-card" v-if="type == 2">
			<uni-transition mode-class="slide-right" :show="type == 2">
				<view class="top">
					<view class="title">
						<!-- OH卡模式 -->
					</view>
					<view class="desc">
						<image :src="word"></image>
						<view class="video-help" @click="openTopVideo" v-if="false">
							<view class="floating-help relative-position"
								:style="{ width: '60rpx', height: '60rpx', borderRadius: '60rpx' }">
								<text class="iconfont">?</text>
							</view>
						</view>
					</view>
				</view>
				<view class="ohCard">
					<choose-card direction="右" type="pictureCard" @choose="chooseHandle('pictureCard')" />
					<choose-card direction="左" type="wordCard" @choose="chooseHandle('wordCard')" />
				</view>
				<view class="button-group">
					<view class="button" @click="$u.debounce(type = 1, 500)">
						洗牌
					</view>
					<view class="button" @click="$u.debounce(handleGoChat, 500)">
						一键抽取图卡和字卡
					</view>
				</view>
			</uni-transition>
		</view>
		<!-- 选择卡片后的动画 -->
		<view class="choose-card-animation" v-if="type == 3">
			<uni-transition mode-class="slide-left" :show="type == 3">
				<lottie :frames="require('./ohCard.json')" width="750rpx" height="1500rpx" @complete="LoopComplete"
					:loop="false"></lottie>
			</uni-transition>
		</view>
	</view>
</template>

<script>
	import chooseCard from '@/ai/components/choose-card/choose-card.vue';
	export default {
		components: {
			chooseCard
		},
		data() {
			return {
				type: 0,
				archiveId: "",
				word: this.$f.geturl(`/uniapp/new/ai/word2.png`),
				// 顶层视频弹窗控制
				showVideoModal: false,
				showVideoPlayer: false,
				videoUrl: 'https://ceping.qinglan.cn/uniapp/new/video/ai-OH.mp4',
				choose: {
					wordCard: '',
					pictureCard: ''
				},
				selectedCardVariant: '',
				cardList: [{
					avatar: this.$f.geturl(`/uniapp/new/ai/card-img-1.png`),
					arrow: this.$f.geturl(`/uniapp/new/ai/arrow.png`),
					variant: 'normal',
					title: '成人心理健康',
					subtitle: 'Adult Mental Health'
				}, {
					avatar: this.$f.geturl(`/uniapp/new/ai/card-img-2.png`),
					arrow: this.$f.geturl(`/uniapp/new/ai/arrow.png`),
					variant: 'child',
					title: '情感心理健康',
					subtitle: 'Emotional Mental Health'
				}, {
					avatar: this.$f.geturl(`/uniapp/new/ai/card-img-3.png`),
					arrow: this.$f.geturl(`/uniapp/new/ai/arrow.png`),
					variant: 'emotion',
					title: '青少年心理健康',
					subtitle: 'Adolescent Mental Health'
				}]
			};
		},
		onLoad(option) {
			// 检查是否有本地缓存的聊天记录
			const savedData = uni.getStorageSync('ohCardChatData-OH');
			if (savedData) {
				uni.showModal({
					title: '提示',
					content: '是否继续上一次的爱卡对话？',
					success: (res) => {
						if (res.confirm) {
							// 直接跳转到聊天页面，添加标识
							uni.navigateTo({
								url: "/ai/ohCard/chat/chat?continue=true" + (this.archiveId ?
									`&archiveId=${this.archiveId}` : '')
							})
						} else {
							// 用户选择不继续，清除缓存
							uni.removeStorageSync('ohCardChatData');
							this.type = 0;
						}
					}
				});
			} else {
				this.type = 0;
			}
			if (option.archiveId) this.archiveId = option.archiveId;
		},
		methods: {
			selectCardVariant(variant) {
				this.selectedCardVariant = variant;
			},
			confirmCardVariantDirectly(variant) {
				this.selectedCardVariant = variant;
				this.type = 1;
			},
			confirmCardVariant() {
				if (!this.selectedCardVariant) {
					uni.showToast({
						title: '请先选择卡牌类型',
						icon: 'none'
					});
					return;
				}
				this.type = 1;
			},
			LoopComplete() {
				console.log('动画播放完成');
				this.type = 2;
			},
			// 顶层视频打开
			openTopVideo() {
				if (!this.videoUrl) {
					uni.showToast({
						title: '视频地址为空',
						icon: 'none'
					});
					return;
				}
				this.showVideoModal = true;
				this.showVideoPlayer = true;
			},
			// 顶层视频关闭
			closeVideo() {
				this.showVideoModal = false;
				setTimeout(() => {
					this.showVideoPlayer = false;
				}, 300);
			},
			onVideoError(e) {
				console.error('视频播放错误:', e);
				uni.showToast({
					title: '视频播放失败',
					icon: 'none'
				});
			},
			onVideoPlay() {
				try {
					this.enterFullscreen();
				} catch (e) {}
			},
			enterFullscreen() {
				try {
					// #ifdef H5
					const videoElement = this.$refs.topVideoPlayer;
					if (videoElement && videoElement.requestFullscreen) {
						videoElement.requestFullscreen();
					} else if (videoElement && videoElement.webkitRequestFullscreen) {
						videoElement.webkitRequestFullscreen();
					} else if (videoElement && videoElement.mozRequestFullScreen) {
						videoElement.mozRequestFullScreen();
					} else if (videoElement && videoElement.msRequestFullscreen) {
						videoElement.msRequestFullscreen();
					}
					// #endif

					// #ifdef APP-PLUS
					const appVideoContext = uni.createVideoContext('ohCardHelpVideo', this);
					if (appVideoContext && appVideoContext.requestFullScreen) {
						appVideoContext.requestFullScreen({
							direction: 0
						});
					}
					// #endif

					// #ifdef MP
					const mpVideoContext = uni.createVideoContext('ohCardHelpVideo', this);
					if (mpVideoContext && mpVideoContext.requestFullScreen) {
						mpVideoContext.requestFullScreen({
							direction: 0
						});
					}
					// #endif
				} catch (err) {
					console.log('全屏播放失败:', err);
				}
			},
			onFullscreenChange(e) {
				console.log('全屏状态改变:', e);
			},
			chooseHandle(type) {
				this.choose[type] = true;
			},
			handleClick() {
				this.type = 3;
				let wordIndex = uni.$u.random(1, 88);
				let imgIndex = uni.$u.random(1, 88);
				this.choose.wordCard = this.$f.geturl(
					`/addons/classroom/tarot-assets/images/zika_background01/zika_background01_${wordIndex}.png`
				);
				this.choose.pictureCard = this.$f.geturl(
					`/addons/classroom/tarot-assets/images/tuka/tuka_${imgIndex.toString().padStart(2, '0')}.jpg`
				);
			},
			handleGoChat() {
				if (!uni.getStorageSync('hasLogin')) {
					uni.showModal({
						title: '提示',
						content: '登录后才能进行疗愈，是否立即登录？',
						success: (res) => {
							if (res.confirm) {
								this.$f.login();
							}
						}
					});
					return;
				}
				this.goChat();
			},
			goChat() {
				// 判断是否已经选择
				if (!this.selectedCardVariant) {
					uni.showToast({
						title: '请先选择卡牌类型',
						icon: 'none'
					});
					this.type = 0;
					return;
				}
				const cardTypeParam = encodeURIComponent(this.selectedCardVariant);
				const archiveParam = this.archiveId ? `&archiveId=${this.archiveId}` : '';
				uni.navigateTo({
					url: `/ai/ohCard/chat/chat?continue=false&cardType=${cardTypeParam}${archiveParam}`
				})
			}
		},
	};
</script>

<style lang="scss" scoped>
	.container {
		position: relative;
		min-height: 100vh;
		background: $background;
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
		height: 100vh;
		z-index: -1;
		background-image: url('../static/cardback.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.choose {
		display: flex;
		justify-content: space-around;
		margin-top: 100rpx;

		.left,
		.right {
			width: 200rpx;
			height: 300rpx;
			background-color: #F6F6FF;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.u-icon {
				font-size: 50rpx;
				color: #999;
			}
		}
	}

	.button-group {
		display: flex;
		justify-content: space-between;
		margin: 100rpx auto;
		width: 686rpx;

		.button {
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 16rpx;
			margin: 80rpx auto;
			font-weight: 600;
			font-size: 32rpx;
			color: #FFFFFF;
			text-align: center;
		}

		.button:nth-child(1) {
			width: 200rpx;
			background-color: #F6F6FF;
			color: #7691FF;
		}

		.button:nth-child(2) {
			width: 450rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		}
	}

	.shuffle-animation {
		margin-top: -150rpx;
	}

	/* 类型选择样式（type == 0） */
	.type-select {
		padding: 140rpx 32rpx 60rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
	}

	.type-select-title {
		font-size: 52rpx;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 24rpx;
		position: relative;
		line-height: 1.4;
		letter-spacing: 0.5rpx;
		width: 100%;
		text-align: left;
	}

	.type-select-subtitle {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 100rpx;
		line-height: 1.6;
		letter-spacing: 0.3rpx;
		width: 100%;
		text-align: left;
	}

	.type-select-options {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
		width: 100%;
		max-width: 686rpx;
		padding: 0;
	}

	.type-card {
		background: #FFFFFF;
		border-radius: 28rpx;
		padding: 36rpx 32rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		cursor: pointer;
	}

	.type-card:active {
		transform: scale(0.98);
		box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.1);
	}

	.type-card.active {
		box-shadow: 0 4rpx 16rpx rgba(118, 145, 255, 0.2);
		background: #FFFFFF;
	}

	.card-avatar {
		width: 128rpx;
		height: 128rpx;
		border-radius: 64rpx;
		overflow: hidden;
		margin-right: 28rpx;
		flex-shrink: 0;
		background: #F5F5F5;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 64rpx;
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}

	.card-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 10rpx;
		line-height: 1.4;
		letter-spacing: 0.3rpx;
	}

	.card-subtitle {
		font-size: 24rpx;
		color: #999;
		line-height: 1.4;
		letter-spacing: 2rpx;
		font-weight: 500;
	}

	.card-arrow {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-left: 16rpx;
	}

	.arrow-icon {
		font-size: 40rpx;
		color: #7a7e80;
		font-weight: 300;
		line-height: 1;
	}


	.top {
		width: 300rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		margin: 150rpx auto;

		.title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.desc {
			font-size: 24rpx;
			color: #999;
			margin-top: 10rpx;
			position: relative;

			image {
				width: 650rpx;
				height: 151rpx;
			}
		}
	}

	.ohCard {
		display: flex;
		justify-content: space-between;
		// padding-top: 100rpx;
	}

	.video-help {
		position: absolute;
		top: 0;
		// right: 120rpx;
		right: -80rpx;
	}

	/* 顶层弹窗样式 */
	.video-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999999;
	}

	.video-popup {
		width: 95vw;
		max-width: 800rpx;
		background-color: #000000;
		border-radius: 16rpx;
		overflow: hidden;

		.video-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx 32rpx;
			background-color: rgba(0, 0, 0, 0.9);

			.video-title {
				color: #ffffff;
				font-size: 36rpx;
				font-weight: 500;
			}

			.close-btn {
				padding: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.close-icon {
					color: #ffffff;
					font-size: 44rpx;
					font-weight: bold;
					line-height: 1;
				}
			}
		}

		.help-video {
			width: 100%;
			height: 800rpx;
			background-color: #000000;
		}
	}

	/* 浮动问号（仿 video-help 的视觉） */
	.floating-help {
		width: 80rpx;
		height: 80rpx;
		background: rgba(118, 145, 255, 0.22);
		border-radius: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.12);
		border: 1rpx solid rgba(118, 145, 255, 0.35);
		opacity: 0.95;
		transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
		backdrop-filter: saturate(140%) blur(6rpx);

		&.relative-position {
			position: relative;
			z-index: auto;
		}

		.iconfont {
			font-size: 40rpx;
			color: #5B7CFF;
			font-weight: 600;
			opacity: 1;
			line-height: 1;
			text-align: center;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.floating-help:hover,
	.floating-help:active {
		opacity: 1;
		background: rgba(118, 145, 255, 0.26);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.16);
		transform: scale(1.02);
	}
</style>