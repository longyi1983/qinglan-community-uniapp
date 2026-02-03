<template>
	<view>
		<view style="margin: 6rpx;width: 100%;">
			<u-search
				placeholder="输入用户名搜索"
				:show-action="false"
				v-model="searchContent"
				@custom="searchList"
				@search="searchList"
				@change="searchList"
			></u-search>
		</view>
		<block v-for="(item,index) in userList" :key="index">
			<navigator :url="'/pages/user/home?uid='+item.uid" class="member-item" v-if="type==0">
				<u-avatar class="avatar" :src="item.avatar"></u-avatar>
				<view class="user">
					<text class="name">{{item.username}}</text>
					<text v-if="item.gender == '男'" class="iconfont icon-nan"></text>
					<text v-if="item.gender == '女'" class="iconfont icon-nv"></text>
				</view>
				<block v-if="item.isAdmin">
				<u-button @click="adminDel(index,item.uid)" class="btn-gz" type="primary"
					size="mini">解除管理员</u-button>
				</block>
				<block v-else>
					<u-button @click="adminAdd(index,item.uid)" class="btn-gz" type="default"
						size="mini">设为管理员</u-button>
				</block>
			</navigator>
		
		<navigator :url="'/pages/user/home?uid='+item.uid" class="member-item" v-else>
			<u-avatar class="avatar" :src="item.avatar"></u-avatar>
			<view class="user">
				<text class="name">{{item.username}}</text>
				<text v-if="item.gender == '男'" class="iconfont icon-nan"></text>
				<text v-if="item.gender == '女'" class="iconfont icon-nv"></text>
			</view>
			<block>
				<u-button @click="giveTopic(index,item)" class="btn-gz" type="default"
					size="mini">转让圈主</u-button>
			</block>
		</navigator>
		</block>
		<!-- 加载状态 -->
		<block v-if="userList.length === 0 && loadStatus == 'nomore'">
			<u-empty margin-top="100" text="暂无用户" mode="favor"></u-empty>
		</block>
		<block v-else>
			<u-loadmore margin-bottom="50" margin-top="50" v-if="userList.length > 10" :status="loadStatus" />
		</block>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userList: [],
				page: 1,
				loadStatus: "loadmore",
				topicId: "",
				searchContent:"",
				type:0,//0设置管理员  1转让圈主
			};
		},
		onLoad(options) {
			this.topicId = options.id;
			if(options.type){
				this.type=options.type
			}
			this.getUserList();
		},
		onReachBottom() {
			this.page++;
			this.getUserList()
		},
		methods: {
			getUserList() {
				this.loadStatus = "loading";
				this.$H.post('topic/user', {
					page: this.page,
					id:this.topicId,
					searchContent:this.searchContent
				}).then(res => {
					this.userList = this.userList.concat(res.result.data);
					if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
						this.loadStatus = "nomore";
					} else {
						this.loadStatus = "loadmore"
					}
				})
			},
			adminAdd(index,uid){
				this.$H.post("post/setAdmin",{
					topicId:this.topicId,
					uid:uid
				}).then( res =>{
					if(res.code == 0){
						this.$u.toast('已设置为管理员');
						this.userList[index].isAdmin = true;
					}
				})
			},
			adminDel(index,uid){
				this.$H.post("post/cancelAdmin",{
					topicId:this.topicId,
					uid:uid
				}).then( res =>{
					if(res.code == 0){
						this.$u.toast('已解除管理员');
						this.userList[index].isAdmin = false;
					}
				})
			},
			searchList(){
				this.userList=[]
				this.getUserList()
			},
			giveTopic(index,item){
				var that = this;
				uni.showModal({
					title: '警告',
					content: '该操作不可逆，你确定转让圈主权限给用户【'+item.username+'】吗？',
					success: function(res) {
						if (res.confirm) {
							that.$H.post("topic/giveTopic",{
								topicId:that.topicId,
								uid:item.uid
							}).then( res =>{
								if(res.code == 0){
									that.$u.toast('转让成功');
									setTimeout(function() {
										uni.redirectTo({
											url: '/pages/my/topic'
										});
									}, 1500);
								}
							})
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
				
			},
		}
	}
</script>

<style lang="scss" scoped>
	.member-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #F5F5F5;
		background-color: #FFFFFF;
	}

	.member-item .icon-nv {
		color: #ff4d94;
	}

	.member-item .icon-nan {
		color: #0091ff;
	}

	.member-item .avatar {
		margin-right: 20rpx;
	}

	.member-item .user .name {
		margin-right: 20rpx;
	}

	.member-item .user .iconfont {
		font-size: 12px;
	}
	/* #ifndef MP */
	.member-item .btn-gz {
		// margin-left: auto;
		margin-right: 20rpx;
	}
	/* #endif */
	/* #ifdef MP */
	.member-item .btn-gz {
		margin-left: auto;
	}
	/* #endif */
</style>
