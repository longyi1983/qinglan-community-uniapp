<template>
	<view>
		<view id="text">
			<!-- <rich-text :nodes="content"></rich-text> -->
			<text class="font-size: 26rpx;" style="color: #464646;">{{content}}</text>
		</view>
	</view>
</template>
<script>

	export default{
		data(){
			return{
				type:'app_protocol_context',
				content:''
			}
		},
		onLoad(options){
			if(options.type){
				this.type=options.type;
			}
			if(this.type=='app_privacy_agreement'){
				this.getPrivacyAgreement()
			}else if(this.type=='app_protocol_context'){
				this.getProtocolContext()
			}else if(this.type=='app_vip_recharge_context'){
				this.getVipRechargeContext()
			}
			
		},
		methods:{
			getProtocolContext(){
				this.$H.get('system/protocol').then(res => {
					this.content = res.result;
				});
			},
			getPrivacyAgreement(){
				this.$H.get('system/privacy').then(res => {
					this.content = res.result;
				});
			},
			getVipRechargeContext(){
				console.log('1111111')
				this.$H.get('system/vipRecharge').then(res => {
					this.content = res.result;
				});
			}
			
		}
	}
</script>

<style scoped>
	#text{
		padding: 40rpx;
	}
</style>
