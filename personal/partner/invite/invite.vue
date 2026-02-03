<template>
	<view class="container">
		<my-navbar title="分享有礼" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<!-- 加载状态 -->
			<view class="loading-container" v-if="loading">
				<u-loading mode="circle" size="40"></u-loading>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 邀请码卡片 -->
			<view class="invite-card" v-else>
				<view class="card-header">
					<view class="title">我的邀请码</view>
					<view class="code-container" @click="copyInviteCode">
						<view class="code">{{ inviteData.inviteCode || '加载中...' }}</view>
						<view class="copy-btn" v-if="inviteData.inviteCode && inviteData.inviteCode !== '加载中...'">
							<u-icon name="copy" color="#6986FD" size="24"></u-icon>
							<text class="copy-text">复制</text>
						</view>
					</view>
				</view>
				<view class="card-stats">
					<view class="stat-item">
						<view class="stat-number">{{ inviteData.invitedCount || 0 }}</view>
						<view class="stat-label">已邀请</view>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<view class="stat-number">{{ (inviteData.activity && inviteData.activity.total) || 0 }}</view>
						<view class="stat-label">活动数</view>
					</view>
				</view>
			</view>

			<!-- 填写邀请码 -->
			<view class="input-section">
				<view class="section-title">填写邀请码</view>
				<view class="input-container">
					<u-input v-model="inputInviteCode" placeholder="请输入8位邀请码" :border="true" :clearable="true"
						class="invite-input" @input="onInviteCodeInput" :maxlength="8" :focus="inputFocus"
						@focus="onInputFocus" @blur="onInputBlur" confirm-type="done" @confirm="submitInviteCode"
						placeholder-style="color: #999; font-size: 28rpx;"></u-input>
					<view class="submit-btn" @click="submitInviteCode">提交</view>
				</view>
				<view class="input-tip">邀请码为8位字母数字组合（区分大小写）</view>
			</view>

			<!-- 邀请活动 -->
			<view class="activity-section" v-if="!loading">
				<view class="section-title">邀请活动</view>
				<view class="activity-list"
					v-if="inviteData.activity && inviteData.activity.rows && inviteData.activity.rows.length > 0">
					<view class="activity-item" v-for="(item, index) in inviteData.activity.rows" :key="index"
						@click="goToActivity(item)">
						<view class="activity-cover">
							<u-image :src="item.coverUrl" width="120rpx" height="120rpx"
								border-radius="12rpx"></u-image>
						</view>
						<view class="activity-info">
							<view class="activity-title">{{ item.title }}</view>
							<!-- <view class="activity-time">{{item.startEnrollTime}} - {{item.endEnrollTime}}</view> -->
						</view>
						<view class="activity-arrow">
							<u-icon name="arrow-right" color="#95959D" size="24"></u-icon>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<u-empty text="暂无邀请活动" mode="favor"></u-empty>
				</view>
			</view>

			<!-- 邀请列表 -->
			<view class="invite-list-section" v-if="!loading">
				<view class="section-title">邀请记录</view>
				<view class="invite-list"
					v-if="inviteData.invited && inviteData.invited.rows && inviteData.invited.rows.length > 0">
					<view class="invite-item" v-for="(item, index) in inviteData.invited.rows" :key="index">
						<user-info :item="{ 'userInfo': item.userInfo }"></user-info>
					</view>
				</view>
				<view class="empty-state" v-else>
					<u-empty text="暂无邀请记录" mode="favor"></u-empty>
				</view>
			</view>

			<!-- 底部按钮 -->
			<view class="bottom-actions">
				<view class="action-btn primary" @click="getCode">
					查看我的伙伴码
				</view>
			</view>

			<!-- 邀请码图片生成 -->
			<l-painter custom-style="position: fixed; left: 200%" ref="painter" @success="handleSuccess"
				css="width: 560rpx;height: 800rpx;border-radius: 32rpx;">
				<l-painter-view css="width: 560rpx;height: 800rpx;background: white;border-radius: 32rpx;">
					<!-- 图片 -->
					<l-painter-image src="https://ceping.qinglan.cn/uniapp/new/my/1.png"
						css="width: 560rpx; height: 560rpx;border-radius: 32rpx 32rpx 0 0;" />
					<!-- 文字 -->
					<l-painter-view css="margin-left:32rpx;width: 260rpx; height: 230rpx; display: inline-block">
						<l-painter-text text="加入栖心港\n一起寻找自我吧！"
							css="width: 260rpx;font-size:28rpx;font-weight:bold;margin-top:32rpx;line-height:48rpx" />
					</l-painter-view>
					<!-- 邀请码 -->
					<l-painter-view
						css="margin-left:32rpx;margin-top:10rpx;width: 200rpx;height: 200rpx; display: inline-block">
						<l-painter-image :src="imgUrl" css="width: 200rpx; height: 200rpx;" />
					</l-painter-view>
				</l-painter-view>
			</l-painter>
		</view>
	</view>
</template>

<script>
import scrollMixin from '@/mixins/scrollMixin.js';
import userInfo from '@/components/user-info/user-info.vue';
export default {
	mixins: [scrollMixin],
	components: {
		userInfo
	},
	data() {
		return {
			inviteData: {
				inviteCode: '',
				invitedCount: 0,
				activity: {
					total: 0,
					rows: []
				},
				invited: {
					total: 0,
					rows: []
				}
			},
			inputInviteCode: '',
			imgUrl: "",
			loading: false,
			inputFocus: false,
			navBg: 0
		};
	},
	computed: {},
	onPageScroll(e) {
		this.handlePageScroll(e)
	},
	onLoad() {
		this.getInviteData();
	},
	onPullDownRefresh() {
		this.getInviteData();
		uni.stopPullDownRefresh();
	},
	methods: {
		// 获取邀请数据
		getInviteData() {
			this.loading = true;
			this.$H.get('qlInviteCode/invite')
				.then(res => {
					this.loading = false;
					console.log('获取邀请数据响应:', res);
					if (res.code === 200 && res.data) {
						this.inviteData = res.data;
						console.log('邀请数据已设置:', this.inviteData);
					} else {
						console.log('获取数据失败:', res);
						uni.showToast({
							title: res.msg || '获取数据失败',
							icon: 'none'
						});
					}
				})
				.catch(err => {
					this.loading = false;
					console.error('获取邀请数据失败:', err);
					uni.showToast({
						title: '获取数据失败',
						icon: 'none'
					});
				});
		},

		// 邀请码输入处理
		onInviteCodeInput(value) {
			// 自动转换为大写
			// this.inputInviteCode = value.toUpperCase();
		},

		// 输入框聚焦
		onInputFocus() {
			this.inputFocus = true;
		},

		// 输入框失焦
		onInputBlur() {
			this.inputFocus = false;
		},

		// 提交邀请码
		submitInviteCode() {
			if (!this.inputInviteCode.trim()) {
				uni.showToast({
					title: '请输入邀请码',
					icon: 'none'
				});
				return;
			}

			// 验证邀请码格式（假设邀请码是8位字母数字组合）
			const inviteCodePattern = /^[a-zA-Z0-9]{8}$/;
			if (!inviteCodePattern.test(this.inputInviteCode.trim())) {
				uni.showToast({
					title: '邀请码格式不正确',
					icon: 'none'
				});
				return;
			}

			uni.showLoading({
				title: '提交中',
				mask: true
			});

			this.$H.post('qlInviteLog', {
				invitationCode: this.inputInviteCode.trim()
			}).then(res => {
				uni.hideLoading();
				if (res.code === 200) {
					uni.showToast({
						title: '邀请码提交成功',
						icon: 'success'
					});
					this.inputInviteCode = '';
					// 刷新数据
					this.getInviteData();
				} else {
					uni.showToast({
						title: res.msg || '提交失败',
						icon: 'none'
					});
				}
			}).catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: '提交失败',
					icon: 'none'
				});
			});
		},

		// 跳转到活动详情
		goToActivity(item) {
			uni.navigateTo({
				url: `/main/activity/detail/detail?id=${item.id}`
			});
		},

		// 生成邀请码图片
		handleSuccess(res) {
			uni.previewImage({
				urls: [res.tempFilePath],
				success: function () {
					console.log('preview success');
				}
			});
		},

		getCode() {
			uni.showLoading({
				title: '生成中',
				mask: true
			})
			// 首先获取邀请码
			this.$H.post('qlInviteCode', {})
				.then(res => {
					this.$H.post('qlInviteCode/wxcode', {
						path: `/pages/user/login?inviteCode=${res.msg}`,
						// env_version: "trial",
					})
						.then(code => {
							const base64 = "data:image/png;base64," + code //这里需要添加前缀
							this.imgUrl = base64 || '';
							setTimeout(() => {
								// 延迟一会
								this.$refs.painter.canvasToTempFilePathSync({
									fileType: "png",
									quality: 1,
									success: (res) => {
										this.handleSuccess(res)
										uni.hideLoading()
									},
									fail: () => {
										uni.hideLoading()
										uni.showToast({
											title: '生成失败',
											icon: 'none'
										})
									}
								});
							}, 500)
						});
				});
		},

		// 复制邀请码
		copyInviteCode() {
			console.log('复制邀请码:', this.inviteData.inviteCode);
			if (!this.inviteData.inviteCode) {
				uni.showToast({
					title: '邀请码为空',
					icon: 'none'
				});
				return;
			}

			// #ifdef APP-PLUS || H5
			uni.setClipboardData({
				data: this.inviteData.inviteCode,
				success: () => {
					uni.showToast({
						title: '复制成功',
						icon: 'success'
					});
				},
				fail: (err) => {
					console.log(err)
					uni.showToast({
						title: '复制失败',
						icon: 'none'
					});
				}
			});
			// #endif

			// #ifdef MP-WEIXIN
			uni.setClipboardData({
				data: this.inviteData.inviteCode,
				success: () => {
					uni.showToast({
						title: '复制成功',
						icon: 'success'
					});
				},
				fail: () => {
					uni.showToast({
						title: '复制失败',
						icon: 'none'
					});
				}
			});
			// #endif
		},

		// 跳转
		goTo(item) {
			uni.navigateTo({
				url: item.url
			});
		},
	}
};
</script>
<style lang="scss" scoped>
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

// 加载状态
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;

	.loading-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999;
	}
}

// 邀请码卡片
.invite-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.card-header {
		text-align: center;
		margin-bottom: 40rpx;

		.title {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}

		.code-container {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;

			.code {
				font-size: 48rpx;
				font-weight: bold;
				color: #6986FD;
				letter-spacing: 4rpx;
			}

			.copy-btn {
				display: flex;
				align-items: center;
				gap: 8rpx;
				padding: 12rpx 20rpx;
				background: #F8F9FF;
				border-radius: 16rpx;
				border: 1rpx solid #E5E5E5;
				transition: all 0.3s ease;
				cursor: pointer;

				&:active {
					background: #E8F0FF;
					transform: scale(0.95);
				}

				.copy-text {
					font-size: 24rpx;
					color: #6986FD;
					font-weight: 500;
				}
			}
		}
	}

	.card-stats {
		display: flex;
		justify-content: center;
		align-items: center;

		.stat-item {
			text-align: center;
			flex: 1;

			.stat-number {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 8rpx;
			}

			.stat-label {
				font-size: 24rpx;
				color: #999;
			}
		}

		.stat-divider {
			width: 2rpx;
			height: 60rpx;
			background: #E5E5E5;
			margin: 0 40rpx;
		}
	}
}

// 输入邀请码区域
.input-section {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		position: relative;
	}

	.input-container {
		display: flex;
		align-items: center;
		gap: 20rpx;

		.invite-input {
			flex: 1;
			font-weight: bold;
			letter-spacing: 2rpx;
			border: 2rpx solid #E5E5E5;
			border-radius: 12rpx;
			padding: 20rpx;
			background: #FAFAFA;
			font-size: 32rpx;

			&:focus {
				border-color: #6986FD;
				background: #FFFFFF;
				box-shadow: 0 0 0 4rpx rgba(105, 134, 253, 0.1);
			}
		}

		.submit-btn {
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			color: #FFFFFF;
			padding: 20rpx 40rpx;
			border-radius: 12rpx;
			font-size: 28rpx;
			font-weight: 600;
			white-space: nowrap;
		}
	}

	.input-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 20rpx;
		text-align: center;
	}
}

// 活动区域
.activity-section {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
	}

	.activity-list {
		.activity-item {
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #F5F5F5;

			&:last-child {
				border-bottom: none;
			}

			.activity-cover {
				margin-right: 20rpx;
			}

			.activity-info {
				flex: 1;

				.activity-title {
					font-size: 28rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 8rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}

				.activity-time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.activity-arrow {
				margin-left: 20rpx;
			}
		}
	}
}

// 邀请列表区域
.invite-list-section {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
	}

	.invite-list {
		.invite-item {
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}

// 底部操作按钮
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #FFFFFF;
	padding: 30rpx $gap;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		border-radius: 16rpx;
		font-size: 32rpx;
		font-weight: 600;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: #FFFFFF;
	}
}

// 空状态样式
.empty-state {
	padding: 60rpx 0;
	text-align: center;
}
</style>