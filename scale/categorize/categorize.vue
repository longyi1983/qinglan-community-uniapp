<template>
	<view class="container">
		<my-navbar title="量表测试" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<categorize-item :item="item" v-for="item in list" :key="item.id"></categorize-item>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	import categorizeItem from '@/scale/components/categorize-item/categorize-item.vue';
	export default {
		mixins: [scrollMixin],
		components: {
			categorizeItem
		},
		data() {
			return {
				list: []
			};
		},
		computed: {},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad() {
			this.getList();
		},
		methods: {
			getList(){
				this.$H.get('scaleLevel/list')
					.then(res => {
						this.list = res.rows;
					});
			},
			// 跳转
			goTo(item) {
				uni.navigateTo({
					url: item.url
				});
			},
		}
	};
</script>
<style lang="scss" scoped>
	.innerContainer {
		padding: $gap;
	}

	.container {
		position: relative;
		min-height: 100vh;
		background-color: $background;
		z-index: 1;
		padding: 0;
		margin: 0;
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