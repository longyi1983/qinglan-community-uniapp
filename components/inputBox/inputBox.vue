<template>
	<view class="container">
		<view class="in">
			<textarea maxlength="600" @keyup.enter="sendText()" auto-height="true" v-model="text" confirm-type="send" @focus="showKeyBoard()" class="input-area"></textarea>
			<view @tap="sendText()" :class="[isDisable?'send-btn-disable':'send-btn-able','send-btn']">发送</view> 
		</view>
		
		<view class="icon-container">
			<image class="input-icon" @tap="openDrawer(1)" :src="$IMG+'/im/emoji.png'"></image>
			<image class="input-icon" @tap="selectImage()" :src="$IMG+'/im/image.png'"></image>
			<!-- #ifdef MP-WEIXIN || H5 -->
			<image class="input-icon" @tap="selectVideo()" :src="$IMG+'/im/video.png'"></image>
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
			<!-- <lsj-upload
				style="width: 55rpx;height: 55rpx;hebackground-color: red;margin-left: 0rpx;"
				class="input-icon"
				ref="lsjUpload"
				childId="upload1"
				:count="1"
				:size="maxFileMB"
				:option="fileOption"
				@change="fileOnChange"
			>
				<image  class="input-icon" :src="$IMG+'/im/file.png'"></image>
			</lsj-upload> -->
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<!-- <image class="input-icon" @tap="selectFile()" :src="$IMG+'/im/file.png'"></image> -->
			<!-- #endif -->
		</view>
		<view class="emoji-container" v-if="showDrawer===1">
			<!-- <image class="emoji" v-for="(e,index) in emojiList" :key="index" :src="require('@/static/emoji/big/'+e.url)" @click="text += e.alt"></image> -->
			<image class="emoji" v-for="(e,index) in emojiList" :key="index" :src="emojiUrl+e.url" @click="text += e.alt"></image>
			<view style="height: 100rpx;"></view>
			<view style="position: fixed;z-index: 100;right: 20rpx;bottom: 30rpx;display: flex">
				<view class="btn">
					<view @tap="deleteAEmoji()">X</view>
				</view>
				<view class="btn">
					<view @tap="showDrawer = 0">关闭</view>
				</view>
			</view>
		</view>
		
		<view class="image-container" v-if="selectedImage!==null">
			<image @tap="selectImage()" mode="aspectFill" style="width: 80%;height: 70%;overflow: hidden;margin-top: 1%;border-radius: 2%;" :src="selectedImage"></image>
			<view style="display: flex;position: fixed;width: 90%;margin-left: 4%;bottom: 50rpx;">
				<u-button @click="imageCancel()" >取消</u-button>
				<u-button style="margin-left: 2%;" @click="sendImage()" class="send-btn-able" type="primary">发送</u-button>
			</view>
		</view>
		<view class="video-container" v-if="selectedVideo!==null">
			<video style="width: 80%;height: 70%;overflow: hidden;margin-top: 1%;border-radius: 2%;" :src="selectedVideo"></video>
			<view style="display: flex;position: fixed;width: 90%;margin-left: 4%;bottom: 50rpx;">
				<u-button @click="videoCancel()">取消</u-button>
				<u-button style="margin-left: 2%;" @click="sendVideo()" class="send-btn-able" type="primary">发送</u-button>
			</view>
		</view>
		<view class="file-container" v-if="selectedFile!==null">
			<view>
				<image style="width: 100rpx;height: 100rpx;margin-top: 60rpx;" :src="$IMG+'/im/clip.png'"></image>
				<view style="display: block;">
					<view>{{selectedFile===null?'':selectedFile.name}}</view>
					<view>{{selectedFile===null?'':(selectedFile.size/1048576).toFixed(2)+'MB'}}</view>
				</view>
			</view>
			<view style="display: flex;position: fixed;width: 90%;margin-left: 4%;bottom: 50rpx;">
				<u-button @click="fileCancel()">取消</u-button>
				<u-button style="margin-left: 2%;" @click="sendFile()"class="send-btn-able" type="primary">发送</u-button>
			</view>
			
		</view>
		<view :style="{'height':keyboradHeight+'px'}"></view>
	</view>
</template>

<script>
	import emojiList from '@/static/emoji/emojiList.js';
	import timeUtil from '@/utils/timeUtil.js';
	export default{
		name: 'inputBox',
		props:{
			maxImageMB:{
				type: Number,
				default: 5
			},
			maxVideoMB:{
				type: Number,
				default: 10
			},
			maxFileMB:{
				type: Number,
				default: 10
			},
			fileExtensions:{
				type: Array,
				default: () => ['.zip','.doc','.txt','.pdf','.doc','.docx','.ppt','.exe','.html','.js','.css','.rar','.xls','.png','.jpg','.mp3','.mp4','.wav','.gif']
			},
		},

		watch:{
			text: function(newData,oldData){
				if(newData!== ''){
					this.isDisable = false;
					if(newData[newData.length-1]==='\n'){
						this.text = this.text.replace('\n', ' ')
					}
				}else this.isDisable = true
			},
			showDrawer: function(newData,oldData){
				if(oldData === 5){
					if(this.status){
						this.$refs.recorder.stop();
						this.status = !this.status;
						this.recorder = null;
						// this.$refs.recorder.reSet();
					}
				}
				if(newData !==2 ) this.imageCancel()
				if(newData !==3 ) this.videoCancel()
				if(newData !==4 ) this.fileCancel()
				switch(newData){
					case 0: this.height = 0; break;
					case 1: this.height = 600; break;
					case 2: 
					case 3: 
					case 4: this.height = 500; break;
					case 5: this.height = 450; break;
				}
				this.$emit('bottomHeight', this.height+150);
			}
		},
		mounted() {
			// #ifdef APP-PLUS
			//  监听键盘高度变化	
			uni.onKeyboardHeightChange(res => {
				if(res.height === 0){
					 this.keyboradHeight = 0;
					 this.$emit('keyboradHeight', 20);
				}else{
					this.$emit('keyboradHeight', 90);
					if(this.showDrawer === 0){
						this.keyboradHeight = 35
					}
					else{
						this.showDrawer = 0;
						this.keyboradHeight = res.height
					}			  
				}
			})
			
			// #endif
		},
		created() {
			this.emojiList = emojiList;
			this.emojiUrl=this.$c.emojiUrl
		},
		data(){
			return{
				$IMG: this.$IMG,
				isDisable: true,
				text: '',
				showDrawer: 0,
				emojiList: [],
				status: false,
				recorder: null,
				selectedImage: null,
				selectedVideo: null,
				selectedFile: null,
				audioTime: 0,
				fileOption: {
					url: 'null'
				},
				keyboradHeight: 0,
				height: 0,
				emojiUrl:''
			}
		},
		methods:{
			showKeyBoard(){
				this.showDrawer = 0
			},
			//发送文件消息
			sendFile(){
				// #ifdef APP-PLUS
				uni.showToast({
					icon:'none',
					title:'手机端暂时不行'
				})
				return
				// #endif
				
				let that = this
				uni.showLoading({
					title:'正在上传文件'
				})
				uni.uploadFile({
					url: this.$c.domain+'im/file/upload', //文件上传接口
					filePath: this.selectedFile.url,
					name: 'file',
					fail(res) {
						console.log(res)
					},
					success: (res) => {
						// console.log(res)
						uni.hideLoading();
						let response = JSON.parse(res.data);
						if(response.code!=0){
							uni.showToast({
								icon:'error',
								title:'文件上传失败'
							})
						}else{
							let fileString = {
								name: response.data.name,
								size: response.data.size,
								url: response.data.download
							}
							
							let message = {
								type: 'file',
								time: timeUtil.getFormatTime(new Date()),
								content: JSON.stringify(fileString)
							}
							that.$emit('sendMessage', message);
							that.fileCancel();
						}
					}
				});
			},
			//发送视频消息
			sendVideo(){
				let that = this
				uni.showLoading({
					title:'正在上传视频'
				})
				uni.uploadFile({
					url: this.$c.domain+'im/video/upload', //图片上传接口
					filePath: this.selectedVideo,
					name: 'video',
					success: (res) => {
						uni.hideLoading();
						let response = JSON.parse(res.data);
						if(response.code!=0){
							uni.showToast({
								icon:'error',
								title:'视频上传失败'
							})
						}else{
							let message = {
								type: 'video',
								time: timeUtil.getFormatTime(new Date()),
								content: that.$c.imfile+response.data.url
							}
							that.$emit('sendMessage', message);
							that.videoCancel();
						}
					}
				});
				
			},
			//发送图片消息
			sendImage(){
				let that = this
				uni.showLoading({
					title:'正在上传图片'
				})
				uni.uploadFile({
					url: this.$c.domain+'im/image/upload', //图片上传接口
					filePath: this.selectedImage,
					name: 'image',
					success: (res) => {
						uni.hideLoading();
						let response = JSON.parse(res.data);
						// console.log(response)
						if(response.code!=0){
							uni.showToast({
								icon:'error',
								title:'图片上传失败'
							})
						}else{
							let imageString = {
								originUrl:  that.$c.imfile+response.data.url,
								compressUrl: that.$c.imfile+response.data.compressUrl
							}
							let message = {
								type: 'image',
								time: timeUtil.getFormatTime(new Date()),
								content: JSON.stringify(imageString)
							}
							that.$emit('sendMessage', message);
							that.imageCancel();
						}
					}
				});
			},
			//发送文字
			sendText(){
				if(this.isDisable) return;
				if(this.text.replace(/ /g,'') === ''){
					uni.showToast({
						icon:'none',
						title:'请输入有效内容'
					})
					this.text = '';
					return;
				}
				//不要超过255就行，数据库varchar（255）
				if(this.text.length>200){
					uni.showToast({
						icon:'none',
						title:'字数不要大于200'
					})
					return;
				}
				let message = {
					type: 'text',
					time: timeUtil.getFormatTime(new Date()),
					content: this.text
				}
				this.$emit('sendMessage', message);
				this.text = '';
				
			},
			openDrawer(index){
				if(this.showDrawer === index)	this.showDrawer = 0;
				else this.showDrawer = index
			},
			deleteAEmoji(){
				if(this.text==='' || this.text.lastIndexOf('[') === '-1') return;
				this.text = this.text.slice(0, this.text.lastIndexOf('['));
			},
			handlerSave() {
			    let tag = document.createElement('a')
			    tag.href = this.recorder.localUrl
			    tag.download = '录音'
			    tag.click()
			},
			handlerOnCahnger() {
			    if (this.status) {
			        this.$refs.recorder.stop()
			    } else {
			        this.$refs.recorder.start()
					setTimeout(() => {
						this.handleAudioTime()
					}, 1000)
			    }
			    this.status = !this.status
			},
			handleAudioTime(){
				if(this.status){
					this.audioTime ++;
					setTimeout(() => {
						this.handleAudioTime()
					}, 1000)
				}
			},

			
			imageCancel(){
				this.selectedImage = null;
				if(this.showDrawer === 2) this.showDrawer = 0;
			},
			videoCancel(){
				this.selectedVideo = null;
				if(this.showDrawer === 3) this.showDrawer = 0;
			},
			fileCancel(){
				this.selectedFile = null;
				// #ifdef APP-PLUS
				// this.$refs.lsjUpload.reSet()
				// #endif	
				if(this.showDrawer === 4) this.showDrawer = 0;
			},
			selectImage(){
				let that = this
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album','camera'], //从相册选择
					success: function (res) {
						//console.log(res.tempFilePaths[0])
						if(that.maxImageMB*1048576 < res.tempFiles[0].size){
							uni.showToast({
								icon:'none',
								title:'图片请限制在'+that.maxImageMB+'MB以内'
							})
						}else{
							that.showDrawer = 2;
							that.$nextTick(()=>{
								that.selectedImage = res.tempFilePaths[0];
								console.log(that.selectedImage)
							})	
						}
							
					}
				});
			},
			selectVideo(){
				var self = this;
				uni.chooseVideo({
					sourceType: ['camera', 'album'],
					sizeType: ['compressed'],
					success: function (res) {
						// console.log(res)
						// #ifdef APP-PLUS || MP
							if(self.maxVideoMB*1048576 < res.size){
								uni.showToast({
									icon:'none',
									title:'视频请限制在'+self.maxVideoMB+'MB以内'
								})
							}
						// #endif
						// #ifdef H5
							if(self.maxVideoMB*1048576 < res.tempFile.size){
								uni.showToast({
									icon:'none',
									title:'视频请限制在'+self.maxVideoMB+'MB以内'
								})
							}
								
						// #endif
						else{
							self.showDrawer = 3;
							self.$nextTick(()=>{
								self.selectedVideo = res.tempFilePath;
							})
						}
						
					}
				});
			},
			selectFile(){
				var self = this;
				// #ifdef H5
				uni.chooseFile({
				  count: 1, //默认100
				  extension: this.fileExtensions,
					success: function (res) {
						if(self.maxFileMB*1048576 < res.tempFiles[0].size){
							uni.showToast({
								icon:'none',
								title:'文件请限制在'+self.maxFileMB+'MB以内'
							})
						}else{
							self.showDrawer = 4;
							self.$nextTick(()=>{
								self.selectedFile = {
									name: res.tempFiles[0].name,
									size: res.tempFiles[0].size,
									url: res.tempFilePaths[0]
								}
							})
							// console.log(self.selectedFile)
						}
					
					}
				});
				// #endif
			},
			fileOnChange(files){
				this.showDrawer = 4;
				files.forEach((key,val)=>{
				   this.selectedFile = {
					   name: key.name,
					   size: key.size,
					   url: key.path
				   }
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container{
		position: fixed;
		bottom: 0;
		width: 100%;
		background-color: #efeeee;
	}
	.in{
		position: relative;
		display: flex;
		align-items: center;
		/* #ifdef H5 */
		margin-top: 10rpx;
		/* #endif */
		margin-left: 1%;
		margin-right: 1%;
	}
	/* #ifdef H5 */
	.input-area{
		margin-left: 1%;
		padding: 10rpx;
		background-color: #FFFFFF;
		border-radius: 20rpx;
		width: 79%;
		max-height: 180rpx;
		overflow-y: scroll;
		overflow-x: hidden;
	}
	/* #endif */
	/* #ifdef APP-PLUS || MP */
	.input-area{
		background-color: #FFFFFF;
		padding: 10rpx;
		max-height: 180rpx;
		width: 79%;
	}
	/* #endif */

	.send-btn{
		width: 15%;
		height: 60rpx;
		font-weight: 540;
		font-size: 30rpx;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		color: rgb(255,254,255);
		border-radius: 20rpx;
		text-align: center;
		margin-left: 10rpx;
		line-height: 60rpx;
		flex-shrink: 0;
		 
	}
	.send-btn-disable{
		background-color: #7c7c7c;
	}
	.send-btn-able{
		background-color: #000000;
	}
	.send-btn-able:active{
		background-color: #0071bc;
	}
	.icon-container{
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		padding-left: 20rpx;
		.input-icon{
			width: 55rpx;
			height: 55rpx;
			margin-left: 20rpx;
			margin-right: 30rpx;
		}
	}
	.emoji-container{
		padding-left: 10rpx;
		width: 100%;
		height: 600rpx;
		background-color: #eaeaea;
		overflow: scroll;
		overflow-x: hidden;
		position: relative;
		.btn{
			text-align: center;
			line-height: 80rpx;
			width: 100rpx;
			height: 80rpx;
			border-radius: 20rpx;
			background-color: #ffffff;
			margin-left: 20rpx;
		}
		.btn:active{
			background-color: #cfcfcf;
		}
		.emoji{
			width: 50rpx;
			height: 50rpx;
			margin: 20rpx;
		}
	}

	.recorder-container{
		padding-left: 10rpx;
		width: 100%;
		height: 450rpx;
		background-color: #eaeaea;
		text-align: center;
		.record-btn{
			width: 200rpx;
			height: 200rpx;
			margin-top: 100rpx;
		}
		.btn{
			text-align: center;
			line-height: 80rpx;
			width: 100rpx;
			height: 80rpx;
			border-radius: 20rpx;
			background-color: #ffffff;
			margin-left: 20rpx;
		}
		.btn:active{
			background-color: #cfcfcf;
		}
	}
	.image-container{
		padding-left: 10rpx;
		width: 100%;
		height: 500rpx;
		background-color: #eaeaea;
		text-align: center;
	}
	.video-container{
		padding-left: 10rpx;
		width: 100%;
		height: 500rpx;
		background-color: #eaeaea;
		text-align: center;
	}
	.file-container{
		padding-left: 10rpx;
		width: 100%;
		height: 500rpx;
		background-color: #eaeaea;
		text-align: center;
	}
</style>