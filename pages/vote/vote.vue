<template>
	<view>
		<!-- 投票弹窗 -->
		<lf-popup v-model="showVotePopup" height="100%">
			<scroll-view scroll-y style="height: 100%;">
				<view class="vote-wrap">
					<lf-field v-model="title" placeholder="添加标题"></lf-field>
					<lf-field v-model="item.value" v-for="(item, index) in voteOption" :key="index"
						:placeholder="'选项' + (index + 1)" right-icon="close" @onRightIcon="onRightIcon(index)">
					</lf-field>
					<view class="option-add" @click="optionAdd">
						<u-icon name="plus" color="#333"></u-icon>
						<text class="txt">添加选项</text>
					</view>
					<!-- 投票类型 -->
					<view class="block-title">投票类型</view>
					<view class="choose-wrap">
						<view class="item" @click="type = 1" :class="{ active: type === 1 }">单选</view>
						<view class="item" @click="type = 2" :class="{ active: type === 2 }">多选</view>
					</view>
					<!-- 投票有效期 -->
					<view class="block-title">投票有效期</view>
					<view class="choose-wrap">
						<view class="item" @click="expireTime = 1" :class="{ active: expireTime === 1 }">1天</view>
						<view class="item" @click="expireTime = 2" :class="{ active: expireTime === 2 }">7天</view>
						<view class="item" @click="expireTime = 3" :class="{ active: expireTime === 3 }">30天</view>
						<view class="item" @click="expireTime = 4" :class="{ active: expireTime === 4 }">90天</view>
					</view>
					<view v-if="title && voteOption[0].value && voteOption[1].value" @click="showVotePopup = false"
						style="margin-top: 50rpx;">
						<lf-button color="#333333">下一步</lf-button>
					</view>
					<view v-else style="margin: 50rpx;"><button style="border-radius: 20rpx;">下一步</button></view>
				</view>
			</scroll-view>
		</lf-popup>
		<!-- 帖子 -->
		<view class="container">
			<textarea placeholder="说些什么叭..." :auto-height="true" maxlength="-1" v-model="content"
				class="post-txt"></textarea>
			<!-- 上传图片（与发帖图片字段一致） -->
			<view style="transform: translateX(-10rpx);">
				<u-upload ref="uUpload" :size-type="['original']" name="Image" :max-count="9" :header="header"
					:action="uploadImgUrl" @on-uploaded="submit" :auto-upload="false" :custom-btn="true">
					<view slot="addBtn" class="slot-btn">
						<u-icon name="plus" size="40" color="#6f6f6f"></u-icon>
						<view class="slot-txt">上传图片</view>
					</view>
				</u-upload>
			</view>
			<view class="vote-preview" @click="showVotePopup = true">
				<view class="title">{{ title }}</view>
				<view v-if="type === 1" class="type">单选</view>
				<view v-if="type === 2" class="type">多选</view>
				<view class="option-item" v-for="(item, index) in voteOption" :key="index">{{ item.value }}</view>
			</view>
			<!-- 选择圈子 -->
			<navigator v-if="isTopic" url="/pages/topic/choose-topic/choose-topic" class="choose-item">
				<image class="icon" src="../static/p_1.png"></image>
				<text class="txt">{{ topicName }}</text>
				<u-icon class="u-icon" name="arrow-right"></u-icon>
			</navigator>
			<lf-button color="#333333" @click="uploadImg">发布</lf-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				uploadImgUrl: this.$c.domain + 'common/upload',
				header: {
					token: uni.getStorageSync('token')
				},
				title: '',
				showVotePopup: true,
				voteOption: [{
						value: ''
					},
					{
						value: ''
					}
				],
				type: 1,
				expireTime: 1,
				content: '',
				form: {
					topicId: '',
					discussId: '',
					address: ''
				},
				topicName: '请选择圈子',
				disName: '选择话题',
				isTopic: true
			};
		},
		onLoad(options) {
			if (options.topicId) {
				this.form.topicId = options.topicId;
				this.isTopic = false;
			}
		},
		onShow() {
			if (!uni.getStorageSync('hasLogin')) {
				uni.navigateTo({
					url: "/pages/user/go-login"
				})
			}
		},
		methods: {
			uploadImg() {
				// 若无本地待上传文件，直接提交；否则先触发组件上传
				const uploadComponent = this.$refs.uUpload;
				if (!uploadComponent || !Array.isArray(uploadComponent.lists)) {
					this.submit([]);
					return;
				}
				const hasLocalFiles = uploadComponent.lists.some(it => it && it.file && it.file.path);
				if (hasLocalFiles) {
					uni.showLoading({ mask: true, title: '发布中' });
					uploadComponent.upload();
				} else {
					this.submit([]);
				}
			},
			optionAdd() {
				this.voteOption.push({
					value: ''
				});
			},
			onRightIcon(index) {
				this.voteOption.splice(index, 1);
			},
			hasDuplicateValue(voteOption) {
			  const values = voteOption.map(option => option.value);
			  return values.some((value, index) => values.indexOf(value) !== index);
			},
			submit(e) {
				if (!this.form.topicId) {
					uni.showToast({
						title: '请选择圈子',
						icon: 'none'
					});
					return;
				}
				//过滤空的选项
				var r = this.voteOption.filter((s) => {
					if (s.value) {
						return s;
					}
				});
				//筛选重复选项 拒绝发布
				const hasDuplicate = this.hasDuplicateValue(this.voteOption);
				if(hasDuplicate){
					uni.showToast({
						title: '选项内容不能重复',
						icon: 'none'
					});
					return;
				}

				// 组装图片媒体列表（与发帖一致）
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

				this.voteOption = r;
				uni.showLoading({ mask: true, title: '发布中' });
				this.$H
					.post('post/voteAdd', {
						topicId: this.form.topicId,
						address: this.form.address,
						content: this.content,
						voteTitle: this.title,
						voteType: this.type,
						expireTime: this.expireTime,
						voteOptions: this.voteOption,
						media: mediaList
					})
					.then(res => {
						uni.hideLoading();
						if (res.code == 0) {
							uni.redirectTo({
								url: '/pages/post/detail?id=' + res.result
							});
						}
					})
					.finally(() => { try { uni.hideLoading(); } catch (e) {} });
			}
		}
	};
</script>

<style lang="scss" scoped>
	.vote-wrap {
		.block-title {
			margin-bottom: 20rpx;
			margin-left: 20rpx;
		}

		.option-add {
			display: flex;
			align-items: center;
			justify-content: center;
			border: 1px solid #333;
			background-color: #f5f5f5;
			margin: 30rpx;
			padding: 20rpx;
			border-radius: 20rpx;

			.txt {
				margin-left: 10rpx;
			}
		}

		.choose-wrap {
			display: flex;
			margin: 20rpx;

			.item {
				padding: 20rpx 40rpx;
				font-size: 24rpx;
				margin-right: 20rpx;
				background-color: #f5f5f5;
				border-radius: 10rpx;
			}

			.active {
				background-color: #333;
				color: #fff;
			}
		}
	}

	.post-txt {
		width: 100%;
		padding: 20rpx 0;
		min-height: 300rpx;
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

	.vote-preview {
		background-color: #f5f5f5;
		padding: 30rpx;
		border-radius: 20rpx;

		.type {
			font-size: 24rpx;
			color: #999;
			margin: 20rpx 0;
		}

		.option-item {
			background-color: #fff;
			border: 1px solid #999;
			border-radius: 10rpx;
			text-align: center;
			margin-bottom: 20rpx;
		}
	}

	.choose-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #f5f5f5;

		&:last-child {
			border: 0;
		}

		.txt {
			margin-left: 20rpx;
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
</style>