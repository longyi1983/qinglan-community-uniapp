<template>
	<view>
		<view class="tabbar-wrap">
			<block v-for="(item, index) in list" :key="index">
				<view @click="onTab(item, index)" v-show="active !== index" class="tab-item">
					<image class="icon" :class="{ 'mid-button': item.midButton }" :src="item.iconPath"></image>
					<text class="txt" :style="{ color: color }">{{ item.text }}</text>
					<text v-if="count[index] > 0" class="number">{{count[index] | maxNum}}</text>
				</view>
				<view @click="onTab(item, index)" v-show="active === index" class="tab-item">
					<image class="icon" :class="{ 'mid-button': item.midButton }" :src="item.selectedIconPath"></image>
					<text class="txt" :style="{ color: selectedColor }">{{ item.text }}</text>
					<text v-if="count[index] > 0" class="number">{{count[index] | maxNum}}</text>
				</view>
			</block>
		</view>
		<!-- 中间按钮弹窗 -->
		<lf-popup v-model="showPopup">
			<view class="handle-wrap" v-if="isOpen==1">
				<view @click="handleJump(item)" class="item" v-for="(item,index) in popup" :key="index">	
					<image mode="widthFix" class="icon" :src="item.icon"></image>
					<text class="txt">{{item.text}}</text>
				</view>
			</view>
			<view class="handle-wrap" v-if="isOpen==0">
				<view @click="handleJump(item)" class="item" v-for="(item,index) in popup2" :key="index">	
					<image mode="widthFix" class="icon" :src="item.icon"></image>
					<text class="txt">{{item.text}}</text>
				</view>
			</view>
			<!-- <view class="handle-close">
				<u-icon @click="onClose" size="50rpx" name="close"></u-icon>
			</view> -->
		</lf-popup>
		<view style="height: 52px;"></view>
	</view>
</template>

<script>

import tabbar from '@/utils/tabbar.js';
export default {
	name: 'lf-tabbar',
	props: {
		//tab 上的文字默认颜色
		color: {
			type: String,
			default: '#7A7E83'
		},
		//tab 上的文字选中时的颜色
		selectedColor: {
			type: String,
			default: '#6982FA'
		},
		active:{
			type:Number,
			default:0
		},
		count:{
			type:Array,
			default:[]
		}
	},
	beforeCreate() {
		uni.hideTabBar();
	},
	filters:{
		maxNum(num){

			if(num > 99){
				return '99+'
			}else{
				return num
			}
		}
	},
	data() {
		return {
			isOpen: getApp().globalData.isOpen,
			list: tabbar.list,
			popup:tabbar.popup,
			showPopup:false,
			popup2:[{
				icon: '/static/h_2.png',
				text: '动态',
				url: '/pages/post/add?type=1'
			},
			{
				icon: '/static/h_1.png',
				text: '投票',
				url: '/pages/vote/vote'
			},
			{
				icon: '/static/article.png',
				text: '长文',
				url: '/subpages/content/article/add'
			}]
		};
	},
	methods: {

		onTab(e, index) {
			if (!e.isCustom) {
				uni.switchTab({
					url: e.pagePath
				});
			} else {
				uni.navigateTo({
					url: e.pagePath
				})
			}
			
			// if(e.midButton){
			// 	this.showPopup = true;
			// }
			
			this.$emit('click', e);
		},
		onClose(){
			this.showPopup = false;
		},
		handleJump(e){
			uni.navigateTo({
				url:e.url
			})
			
			this.showPopup = false;
		}
	}
};
</script>

<style lang="scss" scoped>
.tabbar-wrap {
	position: fixed;
	bottom: 0;
	width: 100%;
	z-index: 99999;
	background-color: #fff;
	height: 66px;
	display: flex;
	align-items: center;
	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		height: 100%;
		border-radius: 8px;
		position: relative;
		.icon {
			width: 28px;
			height: 28px;
		}
		.txt {
			font-size: 12px;
		}
		.number{
			background-color: #FA3534;
			color: #fff;
			border-radius: 50%;
			position: absolute;
			right: 25rpx;
			top: 10rpx;
			display: inline-block;
			width: 40rpx;
			height: 40rpx;
			font-size: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.mid-button {
			width: 48px;
			height: 48px;
		}
	}
	
	.tab-item[hidden] {
		display: none !important;
	}
}

// 中间按钮弹出框
.handle-wrap{
	display: flex;
	padding: 50rpx 0;
	.item{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
		padding: 20rpx 0;
		border-radius: 20rpx;
		.icon{
			width: 100rpx;
			margin-bottom: 20rpx;
		}
		.txt{
			font-size: 28rpx;
		}
	}
}

.handle-close{
	display: flex;
	justify-content: center;
	margin-bottom: 50rpx;
}
</style>
