<template>
	<view>
		<!-- <u-form-item label="问题" label-position="top"><u-input type="textarea" v-model="form.question"
				placeholder="" /></u-form-item> -->
		<lf-field label="问题" type="textarea" v-model="form.question" :disabled2="dis"></lf-field>
		<lf-field label="回答" type="textarea" v-model="form.answer" placeholder="请填写你的回答(100字以内)"></lf-field>
		
		<!-- 提交按钮 -->
		<lf-button shape="circle" @click="submit">提交</lf-button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				topicId:'',
				dis:true,
				form: {
					answer:'',
					question: '',
					topicId: ''
				},
			}
		},
		onLoad(options) {
			if(options.id){
				this.topicId=options.id
				this.form.topicId=options.id
				this.getTopicInfo()
			}
		},
		methods: {
			getTopicInfo() {
				this.$H
					.get('topic/detail', {
						id: this.topicId
					})
					.then(res => {
						if (res.code == 500) {
							this.$u.toast(res.msg);
							setTimeout(function() {
								uni.switchTab({
									url: '/pages/square/square'
								});
							}, 1500);
						}
						this.form.question = res.result.question;
					});
			},
			submit(){
				if(!this.form.answer){
					this.$u.toast('回答内容不能为空');
					return;
				}
				this.$H.post('topic/joinTopicApply', this.form).then(res => {
					if (res.code == 0) {
						this.$u.toast('请等待圈子管理员审核');
						setTimeout(function() {
							uni.navigateBack()
						}, 1500);
						
					}
				});
			},
		}
	}
</script>

<style>

</style>
