<template>
	<view class="my-swiper">
		<u-swiper :list="swiperList" :height="height" :imgMode="imgMode" :bgColor="bgColor" name="img" @click="handleClick"></u-swiper>
	</view>
</template>

<script>
	export default {
		name: 'my-swiper',
		props: {
			code: {
				type: String,
				default: 'home'
			},
			height: {
				type: [String, Number],
				default: 360
			},
			imgMode: {
				type: String,
				default: 'widthFix'
			},
			bgColor: {
				type: String,
				default: 'none'
			}
		},
		data() {
			return {
				swiperList: []
			}
		},
		created() {
			this.getSwiperData()
		},
		methods: {
			getSwiperData() {
				this.$H.get('appusermenu/list', {
					code: this.code,
					status: 1
				}).then(res => {
					if (res.code == 200 && res.rows) {
						this.swiperList = res.rows[0].appUserMenuList || []
						console.log(this.swiperList)
					}
				})
			},
			handleClick(index) {
				const item = this.swiperList[index]
				if (item && item.url) {
					uni.navigateTo({
						url: item.url,
						fail: () => {
							uni.switchTab({
								url: item.url
							})
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.my-swiper {
	width: 100%;
}
</style> 