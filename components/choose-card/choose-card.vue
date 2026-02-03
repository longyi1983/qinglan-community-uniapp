<template>
	<view class="hlaf-circle">
		<view class="circle">
			<view v-for="(card, index) in cardCount" :key="index" class="card" :style="[getCardStyle(index)]">
				<view class="card-inner" @click="choose">
					<!-- <u-image width="101rpx" height="152rpx" src="@/static/ai/card.png"></u-image> -->
				</view>
			</view>
		</view>
		<view class="word">
			点击选择{{type}}
		</view>
	</view>
</template>

<script>
	export default {
		name: "choose-card",
		data() {
			return {
				cardCount: 88,
				radius: 300,
			};
		},
		props: {
			type: {
				type: String,
				default: ''
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
					transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angleDeg +90}deg)`,
				};
			},
		},
	}
</script>

<style lang="scss" scoped>
	.hlaf-circle {
		width: 750rpx;
		height: 300rpx;
		position: relative;
		overflow: hidden;
		margin-bottom: 50rpx;

		.circle {
			position: relative;
			width: 300px;
			height: 300px;
			margin: 200px auto;
			border-radius: 50%;
			animation: rotateCircle 40s linear infinite;
		}

		.word {
			position: absolute;
			top: 80%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 36rpx;
			color: #95959D;
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
			background-color: #4fc08d;
			color: white;
			text-align: center;
			line-height: 30px;
			border-radius: 8px;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
			transform: rotate(-360deg); // 将会通过动画动态调整
			// animation: counterRotate 10s linear infinite;
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