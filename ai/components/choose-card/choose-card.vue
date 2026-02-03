<template>
	<view class="half-circle" :style="[containerStyle]">
		<!-- 中心文字放在外层，不会旋转 -->
		<view class="center-text" :style="[textStyle]">{{ centerText }}</view>
		<view class="circle rotating-circle" :style="[circleStyle]">
			<view v-for="(card, index) in cardCount" :key="index" class="card" :style="[getCardStyle(index)]">
				<view class="card-inner" @click="choose">
					<u-image width="101rpx" height="152rpx" :src="type == 'pictureCard' ? pictureCard : wordCard"></u-image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "choose-card",
		data() {
			return {
				cardCount: 88,
				radius: 270,
				pictureCard:require('@/ai/static/pictureCard.png'),
				wordCard:require('@/ai/static/wordCard.png'),
			};
		},
		props: {
			type: {
				type: String,
				default: ''
			},
			direction: {
				type: String,
				default: '右', // 默认显示右半圆
				validator: function (value) {
					return ['上', '下', '左', '右'].indexOf(value) !== -1
				}
			}
		},
		computed: {
			containerStyle() {
				const diameter = this.radius * 2;
				const halfDiameter = this.radius;
				
				let style = {
					position: 'relative',
					// overflow: 'hidden'
				};
				
				switch(this.direction) {
					case '右':
						style.width = halfDiameter + 'rpx';
						style.height = diameter + 'rpx';
						break;
					case '左':
						style.width = halfDiameter + 'rpx';
						style.height = diameter + 'rpx';
						break;
					case '上':
						style.width = diameter + 'rpx';
						style.height = halfDiameter + 'rpx';
						break;
					case '下':
						style.width = diameter + 'rpx';
						style.height = halfDiameter + 'rpx';
						break;
				}
				
				return style;
			},
			circleStyle() {
				const diameter = this.radius * 2;
				
				let style = {
					width: diameter + 'rpx',
					height: diameter + 'rpx',
					margin: '0'
				};
				
				switch(this.direction) {
					case '右':
						style.marginLeft = '-' + this.radius + 'rpx';
						break;
					case '左':
						style.marginLeft = '0rpx';
						break;
					case '上':
						style.marginTop = '0rpx';
						break;
					case '下':
						style.marginTop = '-' + this.radius + 'rpx';
						break;
				}
				
				return style;
			},
			centerText() {
				switch(this.direction) {
					case '左':
						return '字卡';
					case '右':
						return '图卡';
					case '上':
						return '图卡';
					case '下':
						return '图卡';
					default:
						return '图卡';
				}
			},
			textStyle() {
				let style = {
					position: 'absolute',
					// 'writing-mode': 'vertical-lr',
					// 'text-orientation': 'upright',
					'font-size': '46rpx',
					'font-weight': 'bold',
					color: '#333',
					'z-index': '10',
					'pointer-events': 'none'
				};
				
				switch(this.direction) {
					case '右':
						style.top = '50%';
						style.left = '20rpx';
						style.transform = 'translateY(-50%)';
						break;
					case '左':
						style.top = '50%';
						style.right = '20rpx';
						style.transform = 'translateY(-50%)';
						break;
					case '上':
						style.left = '50%';
						style.bottom = '0rpx';
						style.transform = 'translateX(-50%)';
						break;
					case '下':
						style.left = '50%';
						style.top = '0rpx';
						style.transform = 'translateX(-50%)';
						break;
				}
				
				return style;
			}
		},
		methods: {
			choose() {
				this.$emit('choose');
			},
			getCardStyle(index) {
				const angleDeg = (360 / this.cardCount) * index;
				const angleRad = (angleDeg * Math.PI) / 180;
				const x = this.radius * Math.cos(angleRad);
				const y = this.radius * Math.sin(angleRad);

				return {
					transform: `translate(-50%, -50%) translate(${x}rpx, ${y}rpx) rotate(${angleDeg + 90}deg)`,
				};
			},
		},
	}
</script>

<style lang="scss" scoped>
	.half-circle {
		// overflow: hidden;
		// margin-bottom: 50rpx;

		.circle {
			position: relative;
			border-radius: 50%;
		}

		.rotating-circle {
			animation: rotateCircle 40s linear infinite;
		}

		.center-text {
			/* 样式已移到计算属性中 */
		}

		.card {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 101rpx;
			height: 152rpx;
			transform-origin: center center;
		}

		.card-inner {
			width: 100%;
			height: 100%;
			// background-color: #4fc08d;
			color: white;
			text-align: center;
			line-height: 30px;
			border-radius: 8px;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
			transform-origin: center center;
		}

		@keyframes rotateCircle {
			from {
				transform: rotate(0deg);
			}

			to {
				transform: rotate(360deg);
			}
		}

		@keyframes counterRotate {
			from {
				transform: rotate(0deg);
			}

			to {
				transform: rotate(-360deg);
			}
		}
	}
</style>
