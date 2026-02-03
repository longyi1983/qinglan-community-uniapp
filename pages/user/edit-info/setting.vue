<template>
	<view class="container">
		<view class="settings-list">
			<u-cell-group>
				<u-cell-item title="私信铃声开关" :arrow="false" label="收到私信后铃声是否开启">
					<u-switch v-model="systemConfig.bell" @change="switchChange" slot="right-icon"></u-switch>
				</u-cell-item>
				<!-- #ifdef APP-PLUS -->
				<u-cell-item title="私信震动" :arrow="false" label="收到私信后私信震动是否开启">
					<u-switch v-model="systemConfig.vibrate" @change="switchChange" slot="right-icon"></u-switch>
				</u-cell-item>
				<!-- #endif -->
				<u-cell-item title="隐藏关注列表" :arrow="false" label="在我的用户主页隐藏我的关注列表,开启后仅自己可见关注列表">
					<u-switch v-model="form.isWatch" @change="change" slot="right-icon"></u-switch>
				</u-cell-item>
				<u-cell-item title="隐藏粉丝列表" :arrow="false" label="在我的用户主页隐藏我的粉丝列表,开启后仅自己可见粉丝列表">
					<u-switch v-model="form.isFollow" @change="change" slot="right-icon"></u-switch>
				</u-cell-item>
				<u-cell-item title="隐藏我的作品" :arrow="false" label="在我的用户主页隐藏我的作品,开启后仅自己可见帖子列表">
					<u-switch v-model="form.isPost" @change="change" slot="right-icon"></u-switch>
				</u-cell-item>
			</u-cell-group>
		</view>
	</view>
</template>
<script>
	import {
		mapGetters
	} from 'vuex';
	import $store from '@/store/index.js';
	export default {
		data() {
			return {
				form: {
					isFollow: false,
					isWatch: false,
					isPost: false
				},
			}
		},
		onLoad() {
			this.getUserSetting();
		},
		computed: {
			...mapGetters(['systemConfig'])
		},
		methods: {
			getUserSetting() {
				this.$H.get('user/userSetting').then(res => {
					if (res.code === 0) {
						this.form.isFollow = res.result.isFan;
						this.form.isWatch = res.result.isWatch;
						this.form.isPost = res.result.isPost;
					}
				});
			},
			switchChange() {
				uni.setStorageSync('system_config', this.systemConfig);
			},
			change() {
				this.$H.post('user/updateUserSetting', {
					isFan: this.form.isFollow,
					isWatch: this.form.isWatch,
					isPost: this.form.isPost
				}).then(res => {
					if (res.code === 0) {
						this.$f.toast(res.msg)
					}
				});
			}
		}
	}
</script>
<style lang="scss" scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 50rpx;
	}

	.settings-list {
		margin-top: 10rpx;
	}
</style>