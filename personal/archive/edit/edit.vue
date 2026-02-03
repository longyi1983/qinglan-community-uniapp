<template>
	<view class="container">
		<my-navbar title="档案编辑" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<u-form :model="formData" ref="uForm" :label-width="250">
				<u-form-item label="档案袋名称" prop="archiveBagName" required>
					<u-input v-model="formData.archiveBagName" placeholder="请输入档案袋名称" />
				</u-form-item>
				
				<u-form-item label="家庭身份" prop="familyIdentity" required>
					<u-input
						v-model="formData.familyIdentity"
						placeholder="请选择家庭身份"
						disabled
						@click="showFamilyPicker = true"
					></u-input>
					<u-picker 
						mode="selector" 
						v-model="showFamilyPicker" 
						:default-selector="[0]" 
						:range="familyIdentityOptions"
						@confirm="familyConfirm"
						@cancel="showFamilyPicker = false"
					></u-picker>
				</u-form-item>
				
				<u-form-item label="姓名" prop="name" required>
					<u-input v-model="formData.name" placeholder="请输入姓名" />
				</u-form-item>
				
				<u-form-item label="电话号码" prop="phone" required>
					<u-input v-model="formData.phone" placeholder="请输入电话号码" type="text" maxlength="11" />
				</u-form-item>
				
				<u-form-item label="性别" prop="sex" required>
					<u-radio-group v-model="formData.sex" @change="radioGroupChange">
						<u-radio 
							v-for="(item, index) in sexList" 
							:key="index"
							:name="item.value"
						>
							{{item.label}}
						</u-radio>
					</u-radio-group>
				</u-form-item>
			</u-form>
			
			<view class="btn-wrap">
				<u-button 
					type="primary" 
					@click="submit"
					:custom-style="{
						background: 'linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%)',
						border: 'none'
					}"
				>保存</u-button>
			</view>
		</view>
	</view>
</template>

<script>
  import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
    mixins: [scrollMixin],
		data() {
			return {
				formData: {
					archiveBagName: '',
					familyIdentity: '',
					name: '',
					phone: '',
					sex: 1
				},
				familyIdentityOptions: ['父亲', '母亲', '子女', '配偶', '其他'],
				showFamilyPicker: false,
				sexList: [
					{
						label: '男',
						value: 1
					},
					{
						label: '女',
						value: 2
					}
				],
				rules: {
					archiveBagName: [{
						required: true,
						message: '请输入档案袋名称',
						trigger: ['blur', 'change']
					}],
					familyIdentity: [{
						required: true,
						message: '请选择家庭身份',
						trigger: ['blur', 'change']
					}],
					name: [{
						required: true,
						message: '请输入姓名',
						trigger: ['blur', 'change']
					}],
					phone: [{
						required: true,
						message: '请输入电话号码',
						trigger: ['blur', 'change']
					}, {
						validator: (rule, value, callback) => {
							return this.$u.test.mobile(value);
						},
						message: '手机号码不正确',
						trigger: ['blur', 'change']
					}],
					sex: [{
						validator: (rule, value, callback) => {
							if (value === undefined || value === null || value === '') {
								return false;
							}
							return true;
						},
						message: '请选择性别',
						trigger: ['blur', 'change']
					}]
				}
			};
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		computed: {},
    onPageScroll(e) {
			this.handlePageScroll(e)
		},
		methods: {
			familyConfirm(e) {
				console.log(e)
				this.formData.familyIdentity = this.familyIdentityOptions[e[0]];
				this.showFamilyPicker = false;
			},
			
			radioGroupChange(e) {
				this.formData.sex = e;
			},
			
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						// TODO: 提交表单数据
						console.log('表单数据：', this.formData);
						this.$H.post('archiveBagUserData',this.formData).then(res => {
							console.log(res)
							if(res.code == 200) {
								uni.showToast({
									title: '保存成功',
									icon: 'success'
								});
								// 三秒后返回
								setTimeout(() => {
									uni.navigateBack();
								}, 3000);
							}
						});
					}
				});
			}
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
	
	.btn-wrap {
		margin-top: 40rpx;
		padding: 0 20rpx;
	}
</style>