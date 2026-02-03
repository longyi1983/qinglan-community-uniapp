<template>
	<view class="container">
		<my-navbar title="疗愈一下" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<mode-item :item="item" v-for="item in list" :key="item.title"></mode-item>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [
				{
					url: "/ai/ohCard/chat/chat?mode=CC",
					title: "轻度·AI聊愈师",
					desc: "有温度懂共情会反问的AI聊天机器人",
					background: "https://ceping.qinglan.cn/uniapp/new/ai/mode-4.png",
					arrow: "https://ceping.qinglan.cn/uniapp/new/ai/arrow-4.png",
					color: "#FE6C44",
					open: true
				}, {
					url: "/ai/ohCard/ohCard",
					title: "中度·视觉聊愈法",
					desc: "透过潜意识投射,实现自我觉察",
					background: "https://ceping.qinglan.cn/uniapp/new/ai/mode-1.png",
					arrow: "https://ceping.qinglan.cn/uniapp/new/ai/arrow-1.png",
					color: "#939CFF",
					open: true
				},
				{
					url: "/ai/ohCard/chat/chat?mode=ED",
					title: "中度·AI探梦",
					desc: "开启你的探梦之旅吧",
					background: "https://ceping.qinglan.cn/uniapp/new/ai/mode-2.png",
					arrow: "https://ceping.qinglan.cn/uniapp/new/ai/arrow-2.png",
					color: "#66B09B",
					open: true
				},
				{
					url: "/ai/deepHealing/deepHealing",
					title: "深度·AI CBT",
					desc: "多模态的认知行为疗法",
					background: "https://ceping.qinglan.cn/uniapp/new/ai/mode-3.png",
					arrow: "https://ceping.qinglan.cn/uniapp/new/ai/arrow-3.png",
					color: "#FFA91F",
					open: false
				}
			]
		};
	},
	computed: {},
	methods: {

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