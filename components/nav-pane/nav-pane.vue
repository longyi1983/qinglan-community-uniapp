<template>
	<view class="lf-scroll-view" v-if="list.length">
		<swiper :autoplay="false" class="swiper" :style="{ height: swiperHeight + 'rpx'}" @change="categoryChange">
			<swiper-item v-for="(listItem,i) in list" :key="i">
				<view class="swiperItem">
					<view class="item" @click="clickItem(item.url,item.type)" v-for="(item, index) in listItem"
						:key="index">
						<image :src="imgKey(item)"></image>
						<view>{{labelKey(item)}}</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
		<view class="dots" v-if="showDot">
			<view v-for="(dot, index) in list" :key="index" :style="index == currentIndex ? dotActive : ''">
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'nav-pane',
		props: {
			content: {
				type: Array,
				default () {
					return []
				}
			},
			// 图片的key
			imgKeyName: {
				type: String,
				default: 'img'
			},
			// 底部文字的key
			labelKeyName: {
				type: String,
				default: 'title'
			},
			// 一屏显示多少个
			count: {
				type: Number,
				default: 10
			},
			// 是否显示底部滑动条
			showDot: {
				type: Boolean,
				default: true
			},
			// 滑块颜色
			activeColor: {
				type: String,
				default: '#aaaaff'
			}
		},
		data() {
			return {
				currentIndex: 0,
				swiperHeight: 280,
			};
		},
		computed: {
			list() {
				return this.chunk(this.content, this.count);
			},
			/**
			 * @description: 底部滑条选中颜色
			 */
			dotActive() {
				return {
					'background': this.activeColor
				}
			},
		},
		methods: {

			clickItem(url, type) {

				if (type == 1) {
					// #ifdef MP-WEIXIN
					uni.navigateTo({
						url: '/pages/webview/webview?src=' + url
					});
					// #endif
					// #ifdef H5
					window.open(url)
					// #endif
					// #ifdef APP-PLUS
					plus.runtime.openURL(url)
					// #endif
				} else {
					if (url == '/pages/index/index' || url == '/pages/square/square' || url == '/pages/message/message' ||
						url == '/pages/my/my') {
						uni.switchTab({
							url: url
						})
					} else {
						uni.navigateTo({
							url: url
						})
					}
				}
			},

			/**
			 * @description: 获取图片key
			 * @param {*} item 某一项
			 */
			imgKey(item) {
				return typeof item == 'object' ? item[this.imgKeyName] : item;
			},
			/**
			 * @description: 获取底部文字key
			 * @param {*} item 某一项
			 */
			labelKey(item) {
				return typeof item == 'object' ? item[this.labelKeyName] : item;
			},
			/**
			 * @description: 更新分类指示器
			 * @param {*} e 下标
			 */
			categoryChange(e) {
				let length = this.list[e.detail.current].length;
				if (length == 10 || length > 5) {
					this.swiperHeight = 270;
				} else {
					this.swiperHeight = this.swiperHeight / 2;
				}
				this.currentIndex = e.detail.current;
			},
			/**
			 * @description:      传进数组和指定个数，进行拆分
			 * @param {Array}  array  需要切割的数组
			 * @param {Number}  size   切割为几个
			 */
			chunk(array, size) {
				//获取数组的长度，如果你传入的不是数组，那么获取到的就是undefined
				const length = array.length
				//判断不是数组，或者size没有设置，size小于1，就返回空数组
				if (!length || !size || size < 1) {
					return []
				}
				let index = 0 //用来表示切割元素的范围start
				let resIndex = 0 //用来递增表示输出数组的下标
				//根据length和size算出输出数组的长度，并且创建它。
				let result = new Array(Math.ceil(length / size))
				//进行循环
				while (index < length) {
					//循环过程中设置result[0]和result[1]的值。该值根据array.slice切割得到。
					result[resIndex++] = array.slice(index, (index += size))
				}
				//输出新数组
				return result;
			},
		}

	}
</script>


<style scoped lang="scss">
	.swiper {
		transition: all .5s;
	}

	.lf-scroll-view {
		width: 100%;
		background-color: #f5f5f5;
		padding: 20rpx 0;

		.dots {
			display: flex;
			justify-content: center;
			height: 10rpx;

			view {
				width: 30rpx;
				height: 5rpx;
				background: #EDEAEB;
			}
		}

		.swiperItem {
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
			align-content: space-between;

			.item {
				width: 20%;
				display: flex;
				justify-content: center;
				flex-direction: column;
				align-items: center;
				font-size: 26rpx;
				color: #515151;



				image {
					width: 80rpx;
					height: 80rpx;
				}

				view {
					margin: 10rpx 0;
					width: 100%;
					text-align: center;
				}
			}
		}
	}
</style>