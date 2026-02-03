<template>
    <view>
        <view 
            class="floating-help" 
            :class="{ 'fixed-position': fixed, 'relative-position': !fixed }"
            :style="[positionStyle, {
                position: fixed ? 'fixed' : 'relative',
                width: size,
                height: size,
                borderRadius: size,
                zIndex: fixed ? 99999 : 'auto'
            }]" 
            @click="showVideo" 
            v-if="url"
        >
            <text class="iconfont">?</text>
        </view>

        <!-- 视频弹窗 -->
        <view v-if="showModal" class="video-modal" @click="closeVideo">
            <view class="video-popup" @click.stop>
                <view class="video-header">
                    <text class="video-title">帮助视频</text>
                    <view class="close-btn" @click="closeVideo">
                        <text class="close-icon">×</text>
                    </view>
                </view>
                <video 
                    v-if="showVideoPlayer" 
                    id="helpVideo"
                    :src="url" 
                    class="help-video" 
                    controls 
                    :autoplay="false"
                    :show-center-play-btn="true" 
                    :show-play-btn="true" 
                    :enable-progress-gesture="true"
                    object-fit="contain" 
                    @error="onVideoError" 
                    @play="onVideoPlay"
                    @fullscreenchange="onFullscreenChange"
                    ref="videoPlayer"
                ></video>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'VideoHelp',
    props: {
        // 视频URL
        url: {
            type: String,
            required: true,
            default: ''
        },
        // 悬浮位置 top-right, top-left, bottom-right, bottom-left
        position: {
            type: String,
            default: 'top-right'
        },
        // 距离边缘的距离
        offset: {
            type: Object,
            default: () => ({
                top: '180rpx',
                right: '20rpx'
            })
        },
        // 图标大小
        size: {
            type: String,
            default: '80rpx'
        },
        // 是否使用固定定位
        fixed: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            showModal: false,
            showVideoPlayer: false
        }
    },
    computed: {
        // 根据position计算样式
        positionStyle() {
            // 如果不是固定定位，返回空样式
            if (!this.fixed) {
                return {};
            }

            const positions = this.position.split('-');
            const vertical = positions[0]; // top 或 bottom
            const horizontal = positions[1]; // left 或 right

            console.log('Position debug:', {
                position: this.position,
                offset: this.offset,
                vertical,
                horizontal
            });

            let style = {};

            // 垂直位置
            if (vertical === 'top') {
                let topValue = this.offset.top || '20rpx';
                
                // 在小程序中，如果offset包含top属性，需要减去头部标题栏的高度
                // #ifdef MP
                if (this.offset.top) {
                    // 获取系统信息
                    const systemInfo = uni.getSystemInfoSync();
                    const statusBarHeight = systemInfo.statusBarHeight || 0;
                    const navigationBarHeight = 44; // 小程序导航栏默认高度44px
                    const totalHeaderHeight = statusBarHeight + navigationBarHeight;
                    
                    // 将rpx转换为px进行计算
                    const topRpx = parseInt(topValue.replace('rpx', ''));
                    const topPx = topRpx * (systemInfo.windowWidth / 750); // 750rpx = 屏幕宽度
                    const adjustedPx = Math.max(0, topPx - totalHeaderHeight); // 减去头部高度，确保不小于0
                    const adjustedRpx = Math.round(adjustedPx * (750 / systemInfo.windowWidth));
                    
                    topValue = adjustedRpx + 'rpx';
                }
                // #endif
                
                style.top = topValue;
                style.bottom = 'auto';
            } else {
                style.bottom = this.offset.bottom || '180rpx';
                style.top = 'auto';
            }

            // 水平位置 
            if (horizontal === 'right') {
                style.right = this.offset.right || '20rpx';
                style.left = 'auto';
            } else if (horizontal === 'left') {
                style.left = this.offset.left || '20rpx';
                style.right = 'auto';
            }

            console.log('Computed style:', style);
            return style;
        }
    },
    methods: {
        // 显示视频
        showVideo() {
            if (!this.url) {
                uni.showToast({
                    title: '视频地址为空',
                    icon: 'none'
                });
                return;
            }
            this.showModal = true;
            this.showVideoPlayer = true;
        },

        // 关闭视频
        closeVideo() {
            this.showModal = false;
            // 延迟隐藏视频组件，避免闪烁
            setTimeout(() => {
                this.showVideoPlayer = false;
            }, 300);
        },

        // 视频播放错误
        onVideoError(e) {
            console.error('视频播放错误:', e);
            uni.showToast({
                title: '视频播放失败',
                icon: 'none'
            });
        },

        // 视频开始播放
        onVideoPlay() {
            console.log('视频开始播放');
            // 通知父组件视频已开始播放
            try { this.$emit('play'); } catch(e) {}
            this.enterFullscreen();
        },

        // 进入全屏
        enterFullscreen() {
            try {
                // #ifdef H5
                const videoElement = this.$refs.videoPlayer;
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
                const appVideoContext = uni.createVideoContext('helpVideo', this);
                if (appVideoContext && appVideoContext.requestFullScreen) {
                    appVideoContext.requestFullScreen({
                        direction: 0 // 0: 正常竖向, 90: 屏幕逆时针90度, -90: 屏幕顺时针90度
                    });
                }
                // #endif

                // #ifdef MP
                const mpVideoContext = uni.createVideoContext('helpVideo', this);
                if (mpVideoContext && mpVideoContext.requestFullScreen) {
                    mpVideoContext.requestFullScreen({
                        direction: 0
                    });
                }
                // #endif
            } catch (error) {
                console.log('全屏播放失败:', error);
            }
        },

        // 全屏状态改变
        onFullscreenChange(e) {
            console.log('全屏状态改变:', e);
        }
    }
}
</script>

<style lang="scss" scoped>
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

    &.fixed-position {
        position: fixed;
        z-index: 99999;
    }

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
</style>
