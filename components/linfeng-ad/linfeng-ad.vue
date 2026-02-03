<template>
	<view>
		<!-- 广告后台申请的广告位(adpid)需要自定义基座/云打包/本地打包后生效 -->
		<!-- #ifdef H5 -->
		<view class="content ad-view" v-if="isVip!=1&&open==1">
			<!-- <ad :adpid="h5Adpid" @load="onload" :ad-intervals="35" @close="onclose" @error="onerror"></ad> -->
		</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
		<view class="content ad-view" v-if="isVip!=1&&open==1">
			<!-- <ad :adpid="wxAdpid" @load="onload" :ad-intervals="35" @close="onclose" @error="onerror"></ad> -->
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		name: 'linfeng-ad',
		props: {
			isVip: Number,
			open: {
			      type: String,
			      default: '0'
			},
			h5Adpid: {
				type: String,
				default: '1818425366'
			},
			wxAdpid: {
				type: String,
				default: '1872486102'
			}
		},
		data() {
			return {
				title: 'ad'
			}
		},

		methods: {
			onload(e) {
				console.log("onload");
			},
			onclose(e) {
				console.log("onclose: " + e.detail);
			},
			onerror(e) {
				console.log("onerror: " + e.detail.errCode + " message:: " + e.detail.errMsg);
			}
		}
	}
</script>

<style>
	.content {
		background-color: #f5eded;
		padding: 10rpx;
	}

	.ad-view {
		background-color: #FFFFFF;
		margin-bottom: 10rpx;
	}
</style>
