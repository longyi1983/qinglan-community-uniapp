<template>
	<view class="container">
		<my-navbar title="说明" :navBg="navBg"></my-navbar>
		<view class="innerContainer">
			<view class="type-container">
				<view class="sheep">
					<u-image :src="sheep" width="200rpx" height="255rpx"></u-image>
				</view>
				<view class="desc">
					<view class="name">
						<view class="">
							<image src="@/static/scale/arrow.png" mode=""></image>
						</view>
						Hi，我是可可
					</view>
					<view class="detail">
						<view v-for="(item, index) in detail[scale].desc" :key="index" class="typewriter-text">
							{{ displayText[index] }}
						</view>
					</view>
				</view>
			</view>
			<view class="btn" v-if="isTextComplete" @click="test">
				测试
			</view>
		</view>
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				sheep: this.$f.geturl("/uniapp/new/ai-bot/3-logo.png"),
				type: "",
				selectedOption: null,
				scale: "",
				displayText: [],
				typewriterSpeed: 50, // 打字速度(ms)
				currentIndex: 0,
				currentTextIndex: 0,
				isTextComplete: false,
				detail: {
					"SCL": {
						desc: [
							"为了全面了解您的情况，我认为您有必要进行一个心理测试，根据你对相关问题的回答，来评估您在人际关系以及心理健康方面是否有焦虑、抑郁、强迫、睡眠障碍等心理健康方面的问题。",
							"题目一共有90个，对每个题目，你可以从没有/很轻/中等/偏重/严重等5个答案中选择一个，全程一般不超过10分钟。",
							"测评结束后，我们会将你的答案提交给AI做出较为公正和客观的评价，并在此基础上制定出本轮咨询的目标和方案，在征得你同意的基础上，开始下面几次的咨询和疗愈。"
						],
						id: 24,
					},
					"SAS": {
						desc: ["看来，您有一定的焦虑倾向，需要再回答相关的20个问题"],
						id: 31,
					},
					"SDS": {
						desc: ["看来，您有一定的抑郁倾向，需要再回答相关的20个问题"],
						id: 32,
					},
					"PPQ": {
						desc: ["看来，您在“人际交往”中出现了一些问题。可可听到您的遭遇，觉得您在这件事上经历了很多的不被理解和不被接纳的事情。",
							"其实从您的角度出发，您一直在很善意地为他人考虑，要不，我们再通过一些问答来验证一下？"
						],
						id: 36
					},
					"ENRICH": {
						desc: [
							"看来，您面临一些关系方面的问题。",
							"可可感觉到您的关切，觉得您在这方面有些迷茫。",
							"接下来请您回答一些相关的问题，以便我们做出更好的判断，为您提供更多的帮助。"
						],
						id: 43,
					},
					"PTSD": {
						desc: [
							"看来，您面临一些创伤和失落方面的问题。",
							"可可感觉到您的关切，觉得您在这方面有些迷茫。",
							"接下来请您回答一些相关的问题，以便我们做出更好的判断，为您提供更多的帮助。"
						],
						id: 34,
					},
					"SEI": {
						desc: [
							"看来，您面临一些自我认知与自尊方面的问题。",
							"可可感觉到您的关切，觉得您在这方面有些迷茫。",
							"接下来请您回答一些相关的问题，以便我们做出更好的判断，为您提供更多的帮助。"
						],
						id: 37,
					},
					"BPBQ": {
						desc: [
							"看来，您有遭遇到校园霸凌的倾向，需要进一步回答一些相关的问题"
						],
						id: 71,
					},
					"LIFE": {
						desc: ["看来，您面临一些生活过渡和适应方面的问题。",
							"可可感觉到您的关切，觉得您在这方面有些迷茫。"
						],
						id: 102
					}
				}
			};
		},
		computed: {},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(options) {
			this.type = options.type;
			this.scale = options.scale;
			this.initTypewriter();
		},
		methods: {
			initTypewriter() {
				if (!this.detail[this.scale]) return;
				this.displayText = new Array(this.detail[this.scale].desc.length).fill('');
				this.currentIndex = 0;
				this.currentTextIndex = 0;
				this.startTypewriter();
			},
			startTypewriter() {
				if (!this.detail[this.scale]) return;
				const text = this.detail[this.scale].desc[this.currentTextIndex];
				if (this.currentIndex < text.length) {
					this.$set(this.displayText, this.currentTextIndex,
						text.substring(0, this.currentIndex + 1));
					this.currentIndex++;
					setTimeout(() => {
						this.startTypewriter();
					}, this.typewriterSpeed);
				} else {
					this.currentTextIndex++;
					if (this.currentTextIndex < this.detail[this.scale].desc.length) {
						this.currentIndex = 0;
						setTimeout(() => {
							this.startTypewriter();
						}, 500); // 段落之间的延迟
					} else {
						this.isTextComplete = true;
					}
				}
			},
			test() {
				uni.navigateTo({
					url: `/scale/test/test?id=${this.detail[this.scale].id}&type=${this.type}`
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

	.type-container {
		position: relative;

		.sheep {
			width: 200rpx;
			height: 255rpx;
			margin: 0 auto;
			z-index: -1;
			padding-top: 50rpx;
		}

		.desc {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 686rpx;
			box-sizing: border-box;
			padding: $gap;
			// height: 188rpx;
			background: #FFFFFF;
			border-radius: 24rpx;
			margin: 0 auto;
			margin-top: -20rpx;
			backdrop-filter: blur(30px);

			.name {
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: bold;
				font-size: 52rpx;
				color: #1B1B26;

				view {
					margin-top: -40rpx;
					margin-right: 20rpx;
				}

				image {
					width: 40rpx;
					height: 32rpx;
				}
			}

			.detail {
				margin-top: $gap;
				font-weight: 400;
				font-size: 28rpx;
				color: #5B5B6E;

				view {
					text-indent: 2em;
					margin-bottom: 10rpx;
				}
			}
		}
	}

	.btn {
		border-radius: 100rpx;
		font-size: 32rpx;
		text-align: center;
		width: 686rpx;
		height: 88rpx;
		line-height: 88rpx;
		margin: 0 auto;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: white;
		border-radius: 16rpx;
	}

	.content {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		border: 1rpx solid #FFFFFF;
		backdrop-filter: blur(30px);
		box-sizing: border-box;
		margin-top: 20rpx;
		padding: $gap;

		.options-list {
			.option-item {
				display: flex;
				align-items: center;
				padding: 30rpx;
				margin-bottom: 20rpx;
				border-radius: 16rpx;
				background: #F8FAFF;
				color: #333;
				transition: all 0.3s ease;

				&.active {
					background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
					color: white;
				}

				.option-text {
					flex: 1;
					font-size: 28rpx;
					line-height: 1.5;
				}
			}
		}
	}

	.typewriter-text {
		min-height: 1.5em;
	}
</style>