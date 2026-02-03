<template>
	<view>
		<view @click="onMask" v-show="value" class="mask"></view>
		<view v-show="value" :style="{ height: height }" class="popup-wrap"><slot></slot></view>
	</view>
</template>

<script>

export default {
	name: 'lf-popup',
	props: {
		value: {
			type: Boolean,
			default: false
		},
		height: {
			type: String,
			default: 'auto'
		}
	},
	data() {
		return {};
	},
	methods: {
		onMask() {
			let show = this.value;
			if (show) {
				show = false;
			} else {
				show = true;
			}
			
			this.$emit('input', show);
		}
	}
};
</script>

<style lang="scss" scoped>
.mask {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 99;
	background-color: rgba(0, 0, 0, 0.3);
}
.popup-wrap {
	width: 100%;
	position: fixed;
	bottom: 0;
	background-color: #ffffff;
	animation-name: mymove;
	animation-duration: 0.3s;
	border-radius: 20rpx 20rpx 0 0;
	z-index: 999999;
}

@keyframes mymove {
	from {
		bottom: -50vh;
	}
	to {
		bottom: 0;
	}
}
</style>
