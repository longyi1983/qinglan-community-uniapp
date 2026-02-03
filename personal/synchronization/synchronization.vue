<template>
	<view class="container">
		<my-navbar title="数据同步" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="sync-list">
				<view class="content">
					<view class="toolbar">
						<view class="tool-btn" @click="toggleSelectAll">全选</view>
						<view class="tool-btn primary" @click="syncBatch">批量同步</view>
					</view>
					<view class="item" v-for="(item, index) in list" :key="index">
						<history-sync-item :item="item" :checked="isSelected(item)" @toggle="toggleSelect" @sync="syncOne" />
					</view>
					<u-loadmore :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
				</view>
			</view>
			<!-- 悬浮问号按钮 -->
			<view class="floating-help" @click="showHelp = true">
				<text class="iconfont">?</text>
			</view>
			<!-- 教程弹窗 -->
			<u-popup v-model="showHelp" mode="bottom" :mask-close-able="true" :border-radius="24" height="50vh">
				<view class="help-popup-content bottom-popup"
					style="padding: 32rpx 24rpx; border-radius: 24rpx 24rpx 0 0; background: #f8f9fa; overflow: hidden;padding-bottom: 200rpx;">
					<view
						style="font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; text-align: center;">
						档案同步使用说明
					</view>
					<view style="color: #555; line-height: 2;">
						1. 首次进入页面会自动检查是否已绑定同步码。<br />
						2. 如果未绑定，会自动弹出绑定同步码窗口。<br />
						3. 输入同步码后，可查看对应用户的信息。<br />
						4. 点击同步按钮可将该用户档案同步到您的档案列表中。<br />
						<view style="margin-top: 18rpx; color: #888;">如有疑问，请联系客服获取帮助。</view>
					</view>
				</view>
			</u-popup>

			<!-- 同步码输入弹窗 -->
			<u-popup v-model="showSyncCodePopup" mode="center" width="600rpx" height="auto" :border-radius="20"
				:mask-close-able="true">
				<view class="sync-code-popup">
					<view class="popup-title">绑定同步码</view>
					<view class="input-container">
						<u-input v-model="syncCode" placeholder="请输入要绑定的同步码" :border="true" :clearable="true"
							:maxlength="20" style="margin-bottom: 32rpx;"></u-input>
					</view>
					<view class="popup-buttons">
						<view class="btn cancel-btn" @click="showSyncCodePopup = false">取消</view>
						<view class="btn confirm-btn" @click="searchBySyncCode">确认</view>
					</view>
				</view>
			</u-popup>

			<!-- 用户信息展示弹窗 -->
			<u-popup v-model="showUserInfoPopup" mode="center" width="650rpx" height="auto" :border-radius="20"
				:mask-close-able="true">
				<view class="user-info-popup">
					<view class="popup-title">用户信息</view>
					<view class="user-info-content" v-if="searchedUser">
						<view class="user-details">
							<view class="user-nickname">{{ searchedUser.userName }}</view>
							<view class="user-archive">{{ searchedUser.companyName }}</view>
						</view>
						<view class="sync-action">
							<view v-if="!bindSuccess" class="sync-btn-large" @click="confirmBindSyncCode">
								<u-icon name="checkmark" color="#fff" size="32"></u-icon>
								<text>确认绑定</text>
							</view>
							<view v-else class="sync-success-info">
								<u-icon name="checkmark-circle" color="#52c41a" size="32"></u-icon>
								<text>绑定成功</text>
							</view>
						</view>
					</view>
					<view class="popup-buttons">
						<view class="btn cancel-btn" @click="closeUserInfoPopup">关闭</view>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script>
import scrollMixin from '@/mixins/scrollMixin.js';
import historySyncItem from '@/personal/components/history-sync-item/history-sync-item.vue';
export default {
	components: {
		historySyncItem
	},
	mixins: [scrollMixin],
	data() {
		return {
			// 列表相关
			page: 1,
			loadStatus: 'loadmore',
			list: [],
			selectedIds: new Set(),
			showHelp: false, // 控制教程弹窗显示
			showSyncCodePopup: false, // 控制同步码输入弹窗
			showUserInfoPopup: false, // 控制用户信息展示弹窗
			syncCode: '', // 同步码
			searchedUser: null, // 搜索到的用户信息
			tempSyncCode: '', // 临时保存的同步码
			bindSuccess: false, // 绑定成功状态
			routeCode: '', // 路由携带的同步码
		};
	},
	computed: {},
	onLoad(options) {
		// 进入页面时记录路由参数中的 code
		if (options && options.code) {
			this.routeCode = options.code;
		}
	},
	onPageScroll(e) {
		this.handlePageScroll(e)
	},
	onShow() {
		// 每次页面显示时重置分页和列表，重新获取数据
		this.page = 1;
		this.list = [];
		this.loadStatus = 'loadmore';
		// 检查用户是否已绑定同步码
		this.checkUserSyncCode();
	},
	onReachBottom() {
		this.page++;
		this.getData();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.list = [];
		this.loadStatus = 'loading';
		this.getData();
		uni.stopPullDownRefresh();
	},
	methods: {
		// 检查用户是否已绑定同步码
		checkUserSyncCode() {
			this.$H.get('synchronizeCode/getSynchronizeCode').then(res => {
				if (res.code == 200 && res.data && res.data.synchronizeCode) {
					this.getData();
				} else {
					// 用户未绑定同步码
					if (this.routeCode) {
						// 若路由携带 code，则自动填入并获取对应用户信息
						this.syncCode = this.routeCode;
						this.getBUserInfo(this.routeCode);
					} else {
						// 无路由 code，弹出输入框让用户填写
						this.showSyncCodePopup = true;
					}
				}
			}).catch(err => {
				console.error('检查同步码状态失败:', err);
				// 出错时优先使用路由 code 自动获取信息，否则弹窗
				if (this.routeCode) {
					this.syncCode = this.routeCode;
					this.getBUserInfo(this.routeCode);
				} else {
					this.showSyncCodePopup = true;
				}
			});
		},
		// 获取同步码对应的用户信息
		getBUserInfo(syncCode) {
			this.$H.get(`synchronizeCode/getBUser/${syncCode}`).then(res => {
				if (res.code == 200 && res.data) {
					// 直接使用接口返回的数据结构
					this.searchedUser = res.data;
					this.tempSyncCode = syncCode; // 保存同步码
					this.showUserInfoPopup = true;
				}
			}).catch(err => {
				console.error('获取用户信息失败:', err);
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none'
				});
			});
		},
		syncArchive(syncItem) {
			this.list = this.list.filter(item => item.id !== syncItem.id);
		},
		getData() {
			if (this.loadStatus == 'nomore') return;
			this.getSyncList();
		},
		handleStatus(res) {
			if (res.code == 200 && res.rows) {
				const sanitizedRows = res.rows.map(it => {
					const copy = { ...it };
					if (copy.userId !== undefined) delete copy.userId;
					if (copy.user_id !== undefined) delete copy.user_id;
					return copy;
				});
				this.list = this.list.concat(sanitizedRows);
				if (res.rows.length < 10) {
					this.loadStatus = 'nomore';
				}
			} else {
				this.loadStatus = 'nomore';
			}
		},
		// 获取同步列表
		getSyncList() {
			this.loadStatus = 'loading';
			this.$H.get('synchronizeCode/list', {
				pageNum: this.page,
				pageSize: 10,
				type: 1
			})
				.then(res => {
					this.handleStatus(res)
				});
		},
		// 同步单条记录
		syncOne(item) {
			uni.showModal({
				title: '提示',
				content: '是否确认同步该量表记录？',
				confirmText: '同步',
				success: (res) => {
					if (!res.confirm) return;
					const payload = { userResponses: [item], userHistorys: [] };
					this.$H.post('synchronizeCode/adds', payload).then(res => {
						if (res.code == 200) {
							uni.showToast({ title: '同步成功', icon: 'success' });
							this.list = this.list.filter(it => it.id !== item.id);
							if (this.list.length < 10 && this.loadStatus !== 'nomore') {
								this.addRandomData();
							}
						} else {
							uni.showToast({ title: res.msg || '同步失败', icon: 'none' });
						}
					}).catch(() => {
						uni.showToast({ title: '同步失败，请重试', icon: 'none' });
					});
				}
			});
		},
		// 通过同步码搜索用户信息
		searchBySyncCode() {
			if (!this.syncCode.trim()) {
				uni.showToast({
					title: '请输入同步码',
					icon: 'none'
				});
				return;
			}

			// 先验证同步码是否存在并获取用户信息
			this.$H.get(`synchronizeCode/getBUser/${this.syncCode.trim()}`, {
				code: this.syncCode.trim()
			}).then(res => {
				if (res.code == 200 && res.data) {
					// 同步码存在，显示用户信息给用户确认
					this.searchedUser = res.data;
					this.tempSyncCode = this.syncCode.trim(); // 保存同步码
					this.showSyncCodePopup = false;
					this.showUserInfoPopup = true;
					this.syncCode = ''; // 清空输入
				} else {
					uni.showToast({
						title: res.msg || '同步码不存在',
						icon: 'none'
					});
				}
			}).catch(err => {
				uni.showToast({
					title: '验证同步码失败，请重试',
					icon: 'none'
				});
			});
		},

		// 用户确认绑定同步码
		confirmBindSyncCode() {
			if (!this.searchedUser) return;

			// 直接调用绑定同步码接口
			this.bindSyncCode(this.tempSyncCode, this.searchedUser);
		},
		// 显示绑定成功状态
		showBindSuccess() {
			// 将按钮改为成功状态
			this.bindSuccess = true;
		},
		// 关闭用户信息弹窗
		closeUserInfoPopup() {
			this.showUserInfoPopup = false;
			this.searchedUser = null;
			this.tempSyncCode = '';
			this.bindSuccess = false; // 重置绑定成功状态
		},
		// 绑定同步码
		bindSyncCode(syncCode, userData) {
			// 调用绑定同步码接口
			this.$H.get(`synchronizeCode/addUser/${syncCode}`).then(res => {
				if (res.code == 200) {
					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					});
					// 绑定成功后显示成功状态
					this.showBindSuccess();
					// 刷新列表
					this.page = 1;
					this.list = [];
					this.selectedIds = new Set();
					this.loadStatus = 'loadmore';
					this.getData();
				} else {
					uni.showToast({
						title: res.msg || '绑定失败',
						icon: 'none'
					});
				}
			}).catch(err => {
				console.error('绑定同步码失败:', err);
				uni.showToast({
					title: '绑定失败，请重试',
					icon: 'none'
				});
			});
		},
		// 跳转
		goTo(item) {
			uni.navigateTo({
				url: item.url
			});
		},
		// 加载更多数据
		addRandomData() {
			this.page++;
			this.getData();
		},
		// 勾选切换
		toggleSelect(item) {
			const id = item && item.id;
			if (!id) return;
			if (this.selectedIds.has(id)) {
				this.selectedIds.delete(id)
			} else {
				this.selectedIds.add(id)
			}
			this.selectedIds = new Set(this.selectedIds)
		},
		// 是否勾选
		isSelected(item) {
			return !!(item && this.selectedIds.has(item.id))
		},
		// 全选/反选
		toggleSelectAll() {
			if (this.list.length === 0) return;
			const allSelected = this.list.every(it => this.selectedIds.has(it.id))
			if (allSelected) {
				this.selectedIds = new Set()
			} else {
				const next = new Set(this.selectedIds)
				this.list.forEach(it => next.add(it.id))
				this.selectedIds = next
			}
		},
		// 批量同步
		syncBatch() {
			const selectedItems = this.list.filter(it => this.selectedIds.has(it.id))
			if (selectedItems.length === 0) {
				uni.showToast({ title: '请选择要同步的记录', icon: 'none' })
				return
			}
			uni.showModal({
				title: '提示',
				content: `确认同步选中的 ${selectedItems.length} 条记录？`,
				confirmText: '同步',
				success: (res) => {
					if (!res.confirm) return
					const payload = { userResponses: selectedItems, userHistorys: [] }
					this.$H.post('synchronizeCode/adds', payload).then(res => {
						if (res.code == 200) {
							uni.showToast({ title: '同步成功', icon: 'success' })
							const ids = new Set(selectedItems.map(it => it.id))
							this.list = this.list.filter(it => !ids.has(it.id))
							this.selectedIds = new Set()
							if (this.list.length < 10 && this.loadStatus !== 'nomore') {
								this.addRandomData()
							}
						} else {
							uni.showToast({ title: res.msg || '同步失败', icon: 'none' })
						}
					}).catch(() => {
						uni.showToast({ title: '同步失败，请重试', icon: 'none' })
					})
				}
			})
		},
	}
};
</script>

<style lang="scss" scoped>
.innerContainer {
	padding: $gap;
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

.sync-list {
	margin-top: $gap;
	width: 686rpx;
	box-sizing: border-box;
	border-radius: 30rpx 30rpx 0 0;
	padding-bottom: 150rpx;

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;

		.tool-btn {
			padding: 16rpx 24rpx;
			border-radius: 12rpx;
			background: #f5f5f5;
			color: #666;
			font-size: 26rpx;
		}

		.tool-btn.primary {
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			color: #fff;
		}
	}
}

.bottom {
	background-color: #fff;
	width: 750rpx;
	height: 150rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: space-around;
	align-items: center;
	z-index: 999;

	.button {
		width: 686rpx;
		height: 80rpx;
		border-radius: 16rpx;
		text-align: center;
		line-height: 80rpx;
		color: #fff;
		margin: 0 auto;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		border-radius: 16rpx;
		font-weight: 600;
		font-size: 32rpx;
		color: #FFFFFF;
		position: relative;
	}
}

.floating-help {
	position: fixed;
	bottom: 180rpx;
	right: 40rpx;
	width: 80rpx;
	height: 80rpx;
	background: #7691FF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	z-index: 1000;
	cursor: pointer;
}

.floating-help .iconfont {
	font-size: 48rpx;
	color: #fff;
	font-weight: bold;
}

.help-popup-content {
	padding: 40rpx 32rpx;
	font-size: 30rpx;
	color: #333;
	text-align: left;
	max-width: 500rpx;
	line-height: 1.7;
	padding-bottom: 200rpx;
}

.help-popup-content.bottom-popup {
	max-width: none;
	width: 100vw;
	box-sizing: border-box;
	border-radius: 32rpx 32rpx 0 0;
	background: #fff;
}

// 同步码弹窗样式
.sync-code-popup {
	padding: 40rpx;
	background: #fff;
	border-radius: 20rpx;

	.popup-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.input-container {
		margin-bottom: 40rpx;
	}

	.popup-buttons {
		display: flex;
		gap: 20rpx;

		.btn {
			flex: 1;
			height: 80rpx;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			font-weight: 600;
		}

		.cancel-btn {
			background: #f5f5f5;
			color: #666;
		}

		.confirm-btn {
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			color: #fff;
		}
	}
}

// 用户信息弹窗样式
.user-info-popup {
	padding: 40rpx;
	background: #fff;
	border-radius: 20rpx;

	.popup-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.user-info-content {
		text-align: center;
		margin-bottom: 40rpx;

		.user-details {
			margin-bottom: 32rpx;

			.user-nickname {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 12rpx;
			}

			.user-archive {
				font-size: 28rpx;
				color: #6A8BFF;
			}
		}

		.sync-action {
			.sync-btn-large {
				display: inline-flex;
				align-items: center;
				gap: 12rpx;
				background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
				color: #fff;
				padding: 20rpx 40rpx;
				border-radius: 12rpx;
				font-size: 30rpx;
				font-weight: 600;
			}

			.sync-success-info {
				display: inline-flex;
				align-items: center;
				gap: 12rpx;
				color: #52c41a;
				padding: 20rpx 40rpx;
				font-size: 30rpx;
				font-weight: 600;
			}
		}
	}

	.popup-buttons {
		display: flex;
		justify-content: center;

		.btn {
			width: 200rpx;
			height: 80rpx;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			font-weight: 600;
		}

		.cancel-btn {
			background: #f5f5f5;
			color: #666;
		}
	}
}
</style>
