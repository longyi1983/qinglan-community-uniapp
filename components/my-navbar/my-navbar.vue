<template>
	<view>
		<u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent" id="sticky" :z-index="999999999">
			<u-navbar :is-back="isBack" :title="title" :title-bold="true" :is-fixed="false" :border-bottom="false"
				:background="{ background: 'rgba(256,256, 256,' + navBg + ')' }"
				:title-color="navBg > 0.5 ? '#000' : titleColor" :custom-back="back" :z-index="999999999"></u-navbar>
		</u-sticky>
	</view>
</template>

<script>
	export default {
		name: "my-navbar",
		data() {
			return {

			};
		},
		props: {
			navBg: {
				type: Number,
				default: 0
			},
			title: {
				type: String,
				default: ''
			},
			isBack: {
				type: Boolean,
				default: true
			},
			titleColor: {
				type: String,
				default: '#000'
			}
		},
		mounted() {
			// 获取sticky底部的y是多少
			const query = uni.createSelectorQuery().in(this);
			query
				.select("#sticky")
				.boundingClientRect((data) => {
					if (data) {
						// 获取状态栏高度并加到导航栏高度上
						const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
						const totalHeight = data.height + statusBarHeight;
						this.$emit('navbarHeightChange', totalHeight);
					}
				})
				.exec();
		},
		methods: {
			back() {
				// 如果当前页面只有一页，则返回首页
				if (getCurrentPages().length === 1) {
					uni.switchTab({
						url: '/main/index/index'
					});
				} else {
					uni.navigateBack();
				}
			}
		}
	}
</script>

<style lang="scss">
	/* 确保导航栏始终在最顶层 */
	#sticky {
		position: relative !important;
		z-index: 999999999 !important;
	}
	
	/* 强制设置u-navbar的层级 */
	::v-deep .u-navbar {
		z-index: 999999999 !important;
		position: relative !important;
	}
	
	/* 强制设置u-sticky的层级 */
	::v-deep .u-sticky {
		z-index: 999999999 !important;
	}
	
	/* 确保导航栏内的所有元素都在最顶层 */
	::v-deep .u-navbar-inner {
		z-index: 999999999 !important;
		position: relative !important;
	}
</style>