<template>
	<view class="container">
		<z-paging ref="pagePaging" refresher-only @onRefresh="onRefresh" @scrolltolower="scrolltolower" @scroll="scroll">
			<template #top>
				<my-navbar title="近期活动" :navBg="navBg"></my-navbar>
			</template>
			<view class="banner">
				<my-swiper code="activity-swiper"></my-swiper>
			</view>
			<view class="swiper-container">
				<view style="z-index: 100;position: sticky;top: 0;">
					<u-tabs :list="tabs" @click="click" font-size="$gap"
							:bar-style="{background: 'linear-gradient( 226deg, #B9FFED 0%, #6986FD 100%)',borderRadius: '4rpx'}"
							:current="current" @change="change" bg-color="#FBFBFF"></u-tabs>
				</view>
				<swiper class="swiper" :style="[{height:swiperHeight+'px'}]" :current="current"  @change="swiperChange">
					<swiper-item class="swiper-item" v-for="(item, index) in tabs" :key="index">
						<swiper-activity-list ref="swiperList" :tabIndex="index" :currentIndex="current" @heightChanged="heightChanged">
						</swiper-activity-list>
					</swiper-item>
				</swiper>
			</view>
		</z-paging>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				swiperHeight: 0,
				tabs: [{
					name: '推荐',
					type: 0
				}, {
					name: '社区活动',
					type: 1
				}, {
					name: '线下活动',
					type: 2
				}],
				bannerList: [
					"https://ceping.qinglanxinqing.com/uniapp/new/index/banner.png"
				],
				current: 0,
				navBg: 'transparent'
			}
		},
		methods: {
			scroll(e) {
				this.handlePageScroll(e.detail);
			},
			change(index) {
				this.current = index;
			},
			onRefresh(){
				this.$refs.swiperList[this.current].reload(() => {
					this.$refs.pagePaging.endRefresh();
				});
			},
			scrolltolower(){
				this.$refs.swiperList[this.current].doLoadMore();
			},
			swiperChange(e) {
				this._setCurrent(e.detail.current);
			},
			heightChanged(height){
				if(height === 0){
					height = uni.getSystemInfoSync().windowHeight - uni.upx2px(80);
				}
				this.swiperHeight = height;
			},
			_setCurrent(current){
				if (current !== this.current){
					this.$refs.swiperList[this.current].clear();
				}
				this.current = current;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.banner {
		margin-top: $gap;
		padding: $gap;
		height: 392rpx;
	}

	.swiper {
		height: 1000px;
		padding: $gap;

	}
	.container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		margin: 0;
		padding: 0;
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
</style>