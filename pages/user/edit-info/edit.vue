<template>
	<view>
		<view class="c-wrap">
			<u-form ref="uForm" label-width="auto">
				<u-form-item label="头像">
					<u-avatar @click="onAvatar" mode="square" slot="right" :src="userInfo.avatar" size="100"></u-avatar>
				</u-form-item>
				<u-form-item label="昵称" right-icon="arrow-right">
					<u-input v-model="editForm.username" :placeholder="userInfo.username"
						 input-align="right" />
				</u-form-item>
				<u-form-item label="手机号" right-icon="arrow-right">
					<u-input :placeholder="userInfo.mobile"
						 input-align="right" disabled />
				</u-form-item>
				<u-form-item label="邮箱" right-icon="arrow-right" v-if="false">
					<u-input v-model="editForm.email" :placeholder="userInfo.email" v-if="userInfo.email"
						 input-align="right" />
					<u-input v-model="editForm.email" placeholder="未绑定" v-else
						 input-align="right" />
				</u-form-item>
				<u-form-item label="性别" right-icon="arrow-right">
					<view @click="showGender = true" style="color: #000000;width: 100%;text-align: right;">{{ userInfo.gender }}</view>
					<u-picker mode="selector" v-model="showGender" :range="gender" :default-selector="[getGenderIndex()]" @confirm="saveGender"></u-picker>
				</u-form-item>
				<u-form-item label="个性签名" right-icon="arrow-right">
					<u-input v-model="editForm.intro" :placeholder="userInfo.intro" 
						input-align="right" />
				</u-form-item>
				<u-form-item label="标签" right-icon="arrow-right" v-if="fasle">
					<view @click="showTagEdit = true" class="tag-display">
						<view v-for="(tag, index) in editForm.tagStr" :key="index" class="tag">{{tag}}</view>
						<view v-if="!editForm.tagStr || editForm.tagStr.length === 0" class="no-tag">暂无标签</view>
					</view>
				</u-form-item>
			</u-form>
		</view>
		
		<!-- 标签编辑弹窗 -->
		<u-popup v-model="showTagEdit" mode="center" border-radius="20" width="90%" height="70%">
			<view class="tag-edit-popup">
				<view class="popup-header">
					<text class="popup-title">编辑标签</text>
					<u-icon @click="showTagEdit = false" name="close" size="30"></u-icon>
				</view>
				<view class="popup-content">
					<view class="f-wrap">
						<view class="title">已选择标签</view>
						<view @click="onTagDel(index)" v-for="(item,index) in editForm.tagStr" :key="index" class="tag">{{item}}</view>
					</view>
					<view class="f-wrap">
						<view class="title">自定义标签</view>
						<view class="tag-add" @click="showAddTag = true">
							<u-icon color="#999" size="50" name="plus"></u-icon>
						</view>
					</view>
					<view class="f-wrap">
						<view class="title">推荐标签</view>
						<view @click="onTagAdd(item)" v-for="(item,index) in tagList" :key="index" class="tag">{{item}}</view>
					</view>
				</view>
				<view class="popup-footer">
					<lf-button @click="saveTagEdit">保存标签</lf-button>
				</view>
			</view>
		</u-popup>
		
		<!-- 添加自定义标签弹窗 -->
		<u-popup v-model="showAddTag" mode="center" border-radius="20" width="80%">
			<view class="popup-wrap">
				<view class="title">自定义标签</view>
				<input v-model="addValue" class="tag-input" type="text" placeholder="最长4个字" />
			</view>
			<view class="btn-wrap">
				<view @click="onCancel" class="btn-cancel">取消</view>
				<view @click="onConfirm" class="btn-confirm">保存</view>
			</view>
		</u-popup>
		
		<view class="f-fixed">
			<lf-button @click="saveUserInfo">保存修改</lf-button>
		</view>
	</view>
</template>

<script>
	import $store from '@/store/index.js';
	import websocket from '@/utils/websocket.js';
	export default {
		data() {
			return {
				form: {},
				userInfo: {},
				editForm: {
					username: '',
					email: '',
					intro: '',
					tagStr: []
				},
				showGender: false,
				showTagEdit: false,
				showAddTag: false,
				addValue: '',
				tagList: ["发帖达人", "旅行", "生活", "干饭人", "摄影", "读书", "运动", "码农", "新人"],
				gender: ["男", "女", "保密"]
			};
		},
		onShow(options) {
			this.getUserInfo();
		},
		methods: {
			// 修改性别
			saveGender(index) {
				let genderIndex = index[0];
				let genderText = this.gender[genderIndex];
				let genderValue = genderIndex === 0 ? 1 : genderIndex === 1 ? 2 : 0;
				
				this.$H.post("user/userInfoEdit", {
					gender: genderValue
				}).then(res => {
					if (res.code == 0) {
						this.userInfo.gender = genderText;
						$store.state.loginUserInfo = this.userInfo;
						uni.setStorageSync("userInfo", this.userInfo);
					}
				})
			},
			// 获取当前性别索引
			getGenderIndex() {
				if (this.userInfo.gender === '男') return 0;
				if (this.userInfo.gender === '女') return 1;
				return 2; // 保密
			},
			getUserInfo() {
				this.$H.get("user/userInfo").then(res => {
					this.userInfo = res.result
					if (res.result.gender === 1) {
						this.userInfo.gender = '男'
					} else if (res.result.gender === 2) {
						this.userInfo.gender = '女'
					} else {
						this.userInfo.gender = '保密'
					}
					
					// 初始化编辑表单
					this.editForm.username = this.userInfo.username || '';
					this.editForm.email = this.userInfo.email || '';
					this.editForm.intro = this.userInfo.intro || '';
					this.editForm.tagStr = this.userInfo.tagStr ? JSON.parse(this.userInfo.tagStr) : [];
					
					$store.state.loginUserInfo = this.userInfo
					uni.setStorageSync("userInfo", this.userInfo)
				})
			},
			// 保存用户信息
			saveUserInfo() {
				let updateData = {};
				
				// 检查哪些字段有变化
				if (this.editForm.username !== this.userInfo.username) {
					updateData.username = this.editForm.username;
				}
				if (this.editForm.email !== this.userInfo.email) {
					updateData.email = this.editForm.email;
				}
				if (this.editForm.intro !== this.userInfo.intro) {
					updateData.intro = this.editForm.intro;
				}
				
				// 验证邮箱格式
				if (updateData.email) {
					var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
					if (!emailRegExp.test(updateData.email)) {
						this.$u.toast('请输入规范的邮箱');
						return;
					}
				}
				
				// 如果没有变化，提示用户
				if (Object.keys(updateData).length === 0) {
					this.$u.toast('没有需要保存的修改');
					return;
				}
				
				uni.showLoading({
					mask: true,
					title: "正在保存"
				});
				
				this.$H.post("user/userInfoEdit", updateData).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						this.$u.toast('保存成功');
						// 更新本地数据
						Object.assign(this.userInfo, updateData);
						$store.state.loginUserInfo = this.userInfo;
						uni.setStorageSync("userInfo", this.userInfo);
					} else {
						this.$u.toast('保存失败');
					}
				}).catch(() => {
					uni.hideLoading();
					this.$u.toast('保存失败');
				});
			},
			// 标签相关方法
			onTagDel(index) {
				this.editForm.tagStr.splice(index, 1);
			},
			onTagAdd(name) {
				let str = this.editForm.tagStr.toString();
				if (str.includes(name)) {
					this.$u.toast('已存在相同标签');
					return;
				}
				this.editForm.tagStr.push(name);
			},
			onCancel() {
				this.showAddTag = false;
				this.addValue = "";
			},
			onConfirm() {
				if (!this.addValue) {
					this.$u.toast('自定义标签不能为空');
					return;
				}

				if (this.addValue.length > 4) {
					this.$u.toast('不能超过4个字');
					return;
				}

				let str = this.editForm.tagStr.toString();
				if (str.includes(this.addValue)) {
					this.$u.toast('已存在相同标签');
					return;
				}

				this.editForm.tagStr.push(this.addValue);
				this.showAddTag = false;
				this.addValue = "";
			},
			saveTagEdit() {
				uni.showLoading({
					mask: true,
					title: "正在保存"
				});
				
				this.$H.post("user/userInfoEdit", {
					tagStr: JSON.stringify(this.editForm.tagStr)
				}).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						this.userInfo.tagStr = JSON.stringify(this.editForm.tagStr);
						$store.state.loginUserInfo = this.userInfo;
						uni.setStorageSync("userInfo", this.userInfo);
						this.showTagEdit = false;
						this.$u.toast('标签保存成功');
					} else {
						this.$u.toast('标签保存失败');
					}
				}).catch(() => {
					uni.hideLoading();
					this.$u.toast('标签保存失败');
				});
			},
			onAvatar() {
				let that = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album'],
					success: function(res) {
						uni.showLoading({
							mask: true,
							title: "上传头像中"
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
									that.updateAvatar(data.result)
									uni.hideLoading();
								}
							}
						});
					}
				});

			},
			updateAvatar(avatar) {
				this.$H.post("user/userInfoEdit", {
					avatar: avatar
				}).then(res => {
					if (res.code == 0) {
						this.userInfo.avatar = avatar;
						$store.state.loginUserInfo = this.userInfo;
						uni.setStorageSync("userInfo", this.userInfo)
					}
				})
			},
			onBgImg() {
				let that = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album'],
					success: function(res) {
						uni.showLoading({
							mask: true,
							title: "上传背景图中"
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
									that.updateBgImg(data.result)
									uni.hideLoading();
								}
							}
						});
					}
				});
			},
			updateBgImg(bgImg) {
				this.$H.post("user/userInfoEdit", {
					bgImg: bgImg
				}).then(res => {
					if (res.code == 0) {
						this.userInfo.bgImg = bgImg;
						$store.state.loginUserInfo = this.userInfo;
						uni.setStorageSync("userInfo", this.userInfo)
					}
				})
			}
		}
	}
</script>
<style scoped>
	.c-wrap {
		padding: 20rpx;
		background-color: #FFFFFF;
	}

	.bind-mobile {
		display: flex;
	}

	/* 标签 */
	.tag-box {}

	.tag-box .tag {
		padding: 10rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		display: inline-block;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		background-color: #ffebe5;
	}

	.tag-box .tag:nth-child(2n) {
		background-color: #ecf9f2;
	}

	.tag-box .tag:nth-child(3n) {
		background-color: #fff7e5;
	}

	.tag-box .tag:nth-child(5n) {
		background-color: #b3e0ff;
	}
	
	/* 标签显示区域 */
	.tag-display {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		min-height: 60rpx;
	}
	
	.no-tag {
		color: #999;
		font-size: 28rpx;
	}
	
	/* 标签编辑弹窗 */
	.tag-edit-popup {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1px solid #eee;
	}
	
	.popup-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.popup-content {
		flex: 1;
		padding: 30rpx;
		overflow-y: auto;
	}
	
	.popup-footer {
		padding: 30rpx;
		border-top: 1px solid #eee;
	}
	
	.f-wrap {
		margin-bottom: 40rpx;
	}
	
	.f-wrap .title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.tag-add {
		padding: 20rpx;
		background-color: #F5F5F5;
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.tag {
		padding: 10rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		display: inline-block;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		background-color: #ffebe5;
	}

	.tag:nth-child(2n) {
		background-color: #ecf9f2;
	}

	.tag:nth-child(3n) {
		background-color: #fff7e5;
	}

	.tag:nth-child(5n) {
		background-color: #b3e0ff;
	}
	
	/* 添加标签弹窗样式 */
	.popup-wrap {
		padding: 50rpx 30rpx;
	}

	.popup-wrap .tag-input {
		background-color: #F5F5F5;
		margin-bottom: 30rpx;
		padding: 20rpx;
	}

	.popup-wrap>.title {
		text-align: center;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.btn-wrap {
		display: flex;
	}

	.btn-wrap .btn-cancel {
		width: 50%;
		padding: 20rpx 0;
		text-align: center;
		background-color: #F5F5F5;
	}

	.btn-wrap .btn-confirm {
		background-color: #8687fd;
		width: 50%;
		padding: 20rpx 0;
		text-align: center;
		color: #FFFFFF;
	}
	
	/* 输入框文字颜色 */
	.c-wrap /deep/ .u-input__input {
		color: #000000 !important;
	}
	
	.c-wrap /deep/ .u-input__input::placeholder {
		color: #999999 !important;
	}
	

</style>
