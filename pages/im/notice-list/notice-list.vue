<template>
	<view>
		<view v-if="noticeList.length>0" class="title-head">全部通知消息</view>

		<view class="list" v-if="noticeList.length>0">
			<view v-for="(item,index) in noticeList" :key="index">
				<view class="item-info">
					<view style="margin-left: 10rpx;" @click="toUserHome(item)">
						<u-avatar shape="square" size="80" fontSize="26"
							:src="getUserAvatar(item)"
							bgColor="#FEA356"></u-avatar>
					</view>
					<view style="margin-left: 30rpx;">
						<text style="font-size: 25rpx;">{{showDetail(item)}}</text>
						<view class="apply-time">{{item.createTime}}</view>
					</view>
					
					<view class="btns">
						<button class="notice-btn hasRead" @click="check(item.id)"
							v-if="!item.isRead&&item.type==='reject'">
							已读
						</button>
						<button class="notice-btn delete" @tap="deleteNotice(item.id)" v-if="item.isRead">
							删除
						</button>
						<button class="notice-btn agree" @click="agree(item)" v-if="!item.isRead&&item.type!=='reject'">
							同意
						</button>
						<button class="notice-btn refuse" @click="reject(item.id)"
							v-if="!item.isRead&&item.type!=='reject'">
							拒绝
						</button>
					</view>
				</view>

				<u-line color="#c8c8c8"></u-line>
			</view>
		</view>
		<block v-if="noticeList.length == 0">
			<view class="msg-empty">
				<image class="img" mode="widthFix" src="/static/empty.png"></image>
				<text class="txt">暂无通知</text>
			</view>
		</block>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	import $store from '@/store/index.js';
	import websocket from '@/utils/websocket.js';
	export default {
		computed: {
			...mapGetters(['loginUserInfo', 'noticeList'])
		},
		data() {
			return {
				indexList: [''],
			}
		},
		onLoad() {
			//重新获取连接websocket
			// if (!$store.state.isSocketOpen) {
			// 	websocket.initConnect()
			// }
			//从新获取消息列表
			$store.dispatch('getNoticeList')
		},
		onShow() {
			// if (!$store.state.isSocketOpen&&uni.getStorageSync('hasLogin')) {
			// 	websocket.initConnect()
			// }
		},

		methods: {

			check(id) {
				this.$H.post("notice/readById", {
					id: id
				}).then(res => {
					$store.dispatch('getNoticeList')
				})
			},

			reject(id) {
				this.$H.post("notice/reject", {
					id: id,
					senderName: this.loginUserInfo.username,
					senderAvatar: this.loginUserInfo.avatar
				}).then(res => {
					if (res.code == 0) {
						uni.showToast({
							title: '操作成功',
							icon: 'none'
						})
						$store.dispatch('getNoticeList')
					}

				})
			},

			deleteNotice(id) {
				this.$H.post("notice/delete", {
					id: id
				}).then(res => {
					uni.showToast({
						title: '删除成功',
						icon: 'none'
					})
					$store.dispatch('getNoticeList')
				})
			},
			agree(item) {
				if (item.type == 'person-apply') {
					this.agreePersonApply(item.id)
					return
				}
			},
			agreePersonApply(id) {
				let that = this
				//构造websocket消息
				let msg = {
					type: 'person-apply-agree',
					data: {
						id: id
					}
				}
				uni.sendSocketMessage({
					data: JSON.stringify(msg),
					fail(res) {
						setTimeout(function() {
						    that.retry(id);
						}, 1200);
					}
				})
			},
			//websocket掉线则直接走接口发送
			retry(id){
				this.$H.post('friend/agreePersonApply', {
					id:id
				}).then(res => {
					if (res.code == 0) {
						$store.dispatch('getNoticeList')
						uni.showToast({
							icon: 'success',
							title: '操作成功'
						})
					}
				})
			},
			getUserAvatar(item){
				let info = JSON.parse(item.information)
				if(info.senderAvatar){
					return info.senderAvatar;
				}
				return "";
			},
			toUserHome(item) {
				let info = JSON.parse(item.information)
				uni.navigateTo({
					url: '/pages/user/home?uid=' + item.senderId
				})
			},
			showDetail(item) {
				let info = JSON.parse(item.information)
				switch (item.type) {
					case 'person-apply':
						return '验证信息:' + info.applyMessage
						break;
					case 'reject':
						return '拒绝消息(来自:' + info.senderName + ')'
						break;
				}
			},

		}
	}
</script>

<style lang="scss" scoped>
	.title-head{
		color: #989898;
		margin-left: 20rpx;
		font-size: 32rpx;
		margin-top: 20rpx;
		font-weight: 500;
	}
	.msg-empty{
		  display: flex;
		  flex-direction: column;
		  align-items:center ;
		  min-height: 800rpx;
		  .img{
			 width: 200rpx;
			 margin-top: 100rpx;
		  }
		  .txt{
			  color: #999;
			  font-size: 20rpx;
			  margin-top: 20rpx;
		  }
	}
	.notice-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 26rpx;
		color: #ffffff;
		margin-top: 80rpx;

	}
	.item-info{
		display: flex;
		padding: 20rpx;
		height: 180rpx;
	}
	.btns{
		width: 34%;
		display: flex;
		margin-right: auto;
		position: absolute;
		right: 0;
	}
	.apply-time{
		font-size: 20rpx;
		margin-top: 12rpx;
		color: #939393;
	}
	.agree {
		background-color: #2979ff;
	}

	.refuse {
		background-color: #f75555;
	}

	.delete {
		background-color: #fefefe;
		color: #222222;
	}

	.hasRead {
		background-color: #ff5500;
	}
</style>
