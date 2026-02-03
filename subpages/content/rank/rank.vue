<template>
	<view>
		<view style="background-color: #aaaaff;">
			<view class="tab">
				<view :class="{'tab-active' : currentRank === 0}" @click="tabChangeRank()"><text>发帖排行</text></view>
				<view :class="{'tab-active' : currentRank === 1}" @click="tabChangeRank()"><text>涨粉排行</text></view>
			</view>
			
			<view class="top" v-if="userList.length > 0">
				<view class="top-item" v-if="userList.length >= 2">
					<image class="top-avatar" :src="userList[1].avatar" @click="goUser(userList[1].uid)"></image>
					<text class="top-username">{{userList[1].username}}</text>
					<text class="top-num" v-if="currentRank==0">新帖+{{userList[1].postNumber}}</text>
					<text class="top-num" v-if="currentRank==1">粉丝:{{userList[1].fans}}</text>
				</view>
				<view class="top-item">
					<image class="top-avatar" :src="userList[0].avatar" @click="goUser(userList[0].uid)"></image>
					<text class="top-username">{{userList[0].username}}</text>
					<text class="top-num" v-if="currentRank==0">新帖+{{userList[0].postNumber}}</text>
					<text class="top-num" v-if="currentRank==1">粉丝:{{userList[0].fans}}</text>
				</view>
				<view class="top-item" v-if="userList.length >= 3">
					<image class="top-avatar" :src="userList[2].avatar" @click="goUser(userList[2].uid)"></image>
					<text class="top-username">{{userList[2].username}}</text>
					<text class="top-num" v-if="currentRank==0">新帖+{{userList[2].postNumber}}</text>
					<text class="top-num" v-if="currentRank==1">粉丝:{{userList[2].fans}}</text>
				</view>
			</view>
			<view class="ranking">
				<view class="rank-items" v-if="userList.length > 0" v-for="(item,index) in userList" :key="index">
					<text class="rank-index">{{index+1}}</text>
					<view class="rank-name" @click="goUser(item.uid)">
						<image :src="item.avatar"></image>
						<text>{{item.username}}</text>
					</view>
					<text class="rank-num" v-if="currentRank==0">+{{item.postNumber}}</text>
					<text class="rank-num" v-if="currentRank==1">{{item.fans}}</text>
				</view>
			</view>
			<view class="tip-info" v-if="currentRank==0">发帖排行：按照近一周发帖数量进行排名</view>
			<view class="tip-info" v-if="currentRank==1">涨粉排行：按照最近粉丝数增长幅度进行排名</view>
			<block v-if="userList.length == 0">
				<u-empty margin-top="100" text="暂无排行" mode="list"></u-empty>
			</block>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentRank: 0,
				userList: []
			}
		},
		onLoad() {
			if(this.currentRank==0){
				this.getUserRanking()
			}else{
				this.getHotUserList()
			}
		},
		methods: {
			tabChangeRank() {
				this.currentRank = this.currentRank ? 0 : 1;
				this.userList=[]
				if(this.currentRank==0){
					this.getUserRanking()
				}else{
					this.getHotUserList()
				}
			},
			getUserRanking() {
				this.$H
					.post('user/userRank')
					.then(res => {
						this.userList = res.result;
					});
			},
			getHotUserList() {
				this.$H
					.get('user/getHotUserList')
					.then(res => {
						this.userList = res.result;
					});
			},
			goUser(uid) {
				uni.navigateTo({
					url: "/pages/user/home?uid=" + uid
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.tab {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 25rpx;
		color: #fff;
		margin-bottom: 25rpx;

		view {
			height: 70rpx;
			width: 220rpx;
			line-height: 70rpx;
			box-sizing: border-box;
			border: 1px solid #fff;
			font-size: 16px;
			text-align: center;
			font-weight: bold;

			&:nth-child(1) {
				border-radius: 35rpx 0 0 35rpx;
			}

			&:nth-child(2) {
				border-radius: 0 35rpx 35rpx 0;
			}
		}

		.tab-active {
			background: #fff;
			color: #000000;
		}
	}

	.top {
		width: 660rpx;
		margin: auto;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;

		.top-item {
			width: 200rpx;
			height: 300rpx;
			display: flex;
			flex-direction: column;
			position: relative;
			align-items: center;
			border-radius: 100rpx 100rpx 0 0;
			color: #fff;

			&:nth-child(1) {
				.top-avatar {
					border: 4rpx solid #c7c7c7;
				}
			}

			&:nth-child(2) {
				height: 320rpx;

				.top-avatar {
					border: 2rpx solid #ff9ba2;
				}
			}

			&:nth-child(3) {
				.top-avatar {
					border: 4rpx solid #b4b4b4;
				}
			}

			.top-avatar {
				border-radius: 50%;
				width: 140rpx;
				height: 140rpx;
			}

			.top-num {
				font-size: 16px;
				font-weight: 700;
			}

			.top-username {
				margin: 10rpx 0;
			}
		}
	}

	.ranking {
		width: 700rpx;
		border-radius: 30rpx;
		margin: auto;
		background: #fff;
		box-sizing: border-box;
		padding: 20rpx;

		.rank-items {
			height: 110rpx;
			display: flex;
			align-items: center;
			font-size: 14px;

			.rank-index {
				display: block;
				width: 70rpx;
				color: #777;
				font-weight: 700;
			}

			.rank-num {
				display: block;
				width: 70rpx;
				color: #E28935;
				font-size: 16px;
			}

			.rank-name {
				display: flex;
				align-items: center;
				width: calc(100% - 140rpx);

				image {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					margin-right: 20rpx;
				}

				text {
					width: auto;
				}
			}
		}
	}
	.tip-info{
		text-align: center;
		font-weight: 800;
		font-size: 26rpx;
	}
</style>