<template>
	<view class="lf-container">
		<view class="content">
			<view class="description">
				本平台严厉打击引流广告、虚假不实信息、色情低俗、辱骂引战、违法违规、涉政言论等违规内容。
			</view>

			<view class="section">
				<view class="section-title">
					选择具体类型 <text class="required">*</text>
				</view>
				<view class="radio-group">
					<view v-for="(item, index) in classList" :key="index" class="radio-item"
						:class="{ 'radio-item-active': selectedItem === item.id }" @click="selectCate(item.id)">
						{{ item.cateName }}
					</view>
				</view>
			</view>

			<view class="section">
				<view class="section-title">
					举报描述 <text class="required">*</text>
				</view>
				<textarea v-model="form.content" class="textarea" placeholder="请描述存在的问题，提供更多信息有助于举报被快速处理。"
					placeholder-style="color: #999;" :disabled="true"></textarea>
			</view>

			<view class="section">
				<view class="upload-area">
					<block>
						<u-upload ref="uUpload" :file-list="fileList" :deletable="false"
							:auto-upload="false"></u-upload>
					</block>
				</view>
			</view>
		</view>
		<view class="footer">
			<button v-if="!form.feedback" class="submit-btn">等待管理员处理</button>
		</view>
		<view class="section" v-if="form.feedback">
			<view class="section-title" style="color: red;">举报结果</view>
			<textarea v-model="form.feedback" class="textarea" placeholder=""
				placeholder-style="color: #999;" :disabled="true"></textarea>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				fileList: [],
				show: false, //选择弹出
				uploadImgUrl: this.$c.domain + 'common/upload',
				classList: [{
						id: 1,
						cateName: '帖子'
					},
					{
						id: 2,
						cateName: '评论'
					},
					{
						id: 3,
						cateName: '用户'
					},
					{
						id: 4,
						cateName: '圈子'
					},
				],
				cateName: '未选择',
				form: {
					linkId: 0,
					cateId: '',
					content: '',
					media: [],
					feedback: ''
				},
				header: {
					token: uni.getStorageSync('token')
				},
				id: '',
				selectedItem: '',

			};
		},
		onLoad(options) {
			if (options.id) {
				this.id = options.id
				this.getDetail();
			}

		},
		methods: {
			getDetail() {
				this.$H.get('/report/detail', {
					id: this.id
				}).then(res => {
					if (res.code == 0) {
						let arr = res.result.media;

						var fileList = [];

						for (var i = 0; i < arr.length; i++) {
							var obj = {};
							obj.url = arr[i];
							fileList.push(obj);
						}
						this.fileList = fileList
						this.form.feedback = res.result.feedback
						this.form.content = res.result.content
						this.selectedItem = res.result.type

					}
				})
			},

			chooseClass(id, name) {
				this.form.cateId = id;
				this.cateName = name;
				this.show = false;
			},

		}
	};
</script>

<style lang="scss" scoped>
	.lf-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.content {
		flex: 1;
		padding: 20px;
	}

	.description {
		font-size: 14px;
		color: #999;
		margin-bottom: 20px;
	}

	.section {
		background-color: #fff;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.required {
		color: #ff6b81;
	}

	.radio-group {
		display: flex;
		flex-wrap: wrap;
	}

	.radio-item {
		width: calc(50% - 10px);
		height: 40px;
		line-height: 40px;
		text-align: center;
		background-color: #f8f8f8;
		border-radius: 20px;
		margin: 5px;
		font-size: 14px;
	}

	.radio-item-active {
		background-color: #ffebee;
		color: #ff6b81;
	}

	.textarea {
		width: 100%;
		height: 120px;
		background-color: #f8f8f8;
		border-radius: 8px;
		padding: 10px;
		font-size: 14px;
	}

	.upload-area {
		display: flex;
		flex-wrap: wrap;
	}

	.upload-btn {
		width: 80px;
		height: 80px;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 8px;
	}

	.icon-plus {
		font-size: 30px;
		color: #999;
	}

	.upload-text {
		font-size: 12px;
		color: #999;
		margin-top: 5px;
	}

	.footer {
		padding: 20px;
	}

	.submit-btn {
		width: 100%;
		height: 44px;
		line-height: 44px;
		background-color: #ff6b81;
		color: #fff;
		border-radius: 22px;
		font-size: 16px;
		text-align: center;
	}
</style>