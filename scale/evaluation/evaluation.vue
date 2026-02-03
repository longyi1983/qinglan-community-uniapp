<template>
	<view class="container">
		<my-navbar title="个人信息" :navBg="navBg"></my-navbar>
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
						<view v-for="(item, index) in detail[type]" :key="index" class="typewriter-text">
							{{ displayText[index] }}
						</view>
					</view>
				</view>
				<!-- 题目选择 -->
				<view class="content" v-if="isTextComplete">
					<view class="options-list">
						<view class="option-item" v-for="(item, index) in question[type]" :key="index"
							:class="{ active: selectedOption === index }" @click="selectOption(index)">
							<text class="option-text">{{item.title}}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="btn" v-if="isTextComplete" @click="test">
				下一步
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
				displayText: [],
				typewriterSpeed: 50, // 打字速度(ms)
				currentIndex: 0,
				currentTextIndex: 0,
				isTextComplete: false,
				detail: {
					"1": [
						"为了全面了解您的情况，我认为您有必要进行一个心理测试，根据你对相关问题的回答，来评估您在人际关系以及心理健康方面是否有焦虑、抑郁、强迫、睡眠障碍等心理健康方面的问题。",
						"题目一共有90个，对每个题目，你可以从没有/很轻/中等/偏重/严重等5个答案中选择一个，全程一般不超过10分钟。",
						"测评结束后，我们会将你的答案提交给AI做出较为公正和客观的评价，并在此基础上制定出本轮咨询的目标和方案，在征得你同意的基础上，开始下面几次的咨询和疗愈。"
					],
					"2": [
						"涉及情感方面的咨询常见问题通常包括以下几类，请你点击进行选择下面的选项",
						"这些问题往往相互交织，情感咨询师会通过与来访者的对话，帮助你们理解自己的情感和行为模式，寻找解决问题的策略，促进心理健康和情感的良好发展。"
					],
					"3": [
						"小同学你好！我是你的可可，请你告诉我，你最近是不是遇到了下面的一些问题？请你进行选择。",
						"这些问题往往相互交织，我会通过与你的对话，帮助你理解自己的意识和行为模式，寻找解决问题的策略，促进心理健康和情感的良好发展。"
					]
				},
				question: {
					"2": [{
							title: "关系问题：有伴侣关系：如沟通不畅、信任问题、冲突解决、亲密关系的维持等。有家庭关系：如亲子关系、兄弟姐妹之间的冲突、家庭角色分配等。有友谊关系：如友情的维护、冲突解决、友情的终结等。",
							url: "/scale/evaluation/instruction/instruction?scale=ENRICH&type=2",
						},
						{
							title: "情绪管理：有焦虑和压力：如日常生活中的焦虑、工作压力、人际关系压力等。有抑郁：如长期的情绪低落、缺乏动力、失眠等。有愤怒管理：如愤怒的表达和控制、愤怒的根源等。",
							url: "/scale/evaluation/instruction/instruction?scale=SCL&type=2", //个人咨询流程，todo
						},
						{
							title: "自我认知与自尊：有自我价值感：如自我评价低、自卑、缺乏自信等。有身份认同：如自我认同问题、性别认同问题、职业认同问题等。",
							url: "/scale/evaluation/instruction/instruction?scale=SEI&type=2"
						},
						{
							title: "创伤和失落：有失恋：如分手后的情感恢复、应对失恋的痛苦等。有丧亲之痛：如亲人去世后的哀悼与恢复等。有创伤后应激障碍（PTSD）：如经历重大事件后的心理创伤、回忆和应对机制等。",
							url: "/scale/evaluation/instruction/instruction?scale=PTSD&type=2"
						},
						{
							title: "生活过渡和适应：有重大生活变化：如搬迁、新工作、退休、孩子出生等。有适应问题：如适应新环境、应对文化冲击、处理生活中的重大变动等。",
							url: "/scale/evaluation/instruction/instruction?scale=LIFE&type=2",
						},
						// {
						// 	title: "个人发展与成长：有职业发展：如职业选择、职业倦怠、职业发展规划等。有个人成长：如自我提升、目标设定和实现、时间管理等。",
						// 	url: "/scale/test/test?id=2&type=2"
						// }
					],
					"3": [{
							title: "情绪变化：显著的悲伤或抑郁情绪，持续感到空虚或无助。易怒或愤怒情绪增加，对小事易爆发。",
							url: "/scale/evaluation/instruction/instruction?scale=SCL&type=3"
						},
						{
							title: "行为改变：对平时喜欢的活动失去兴趣，不再参与社交和学校活动。- 表现出消极或退缩的行为，减少与家人和朋友的互动。",
							url: "/scale/evaluation/instruction/instruction?scale=SCL&type=3"
						},
						{
							title: "认知功能：学习成绩下降，注意力和集中力减退。- 自我评价过低，对自己的未来感到悲观。",
							url: "/scale/evaluation/instruction/instruction?scale=SCL&type=3"
						},
						{
							title: "睡眠和食欲变化：睡眠模式改变，可能表现为失眠或过度睡眠。- 食欲改变，可能表现为食欲减退或暴食。",
							url: "/scale/evaluation/instruction/instruction?scale=SCL&type=3"
						},
						{
							title: "身体症状：经常感到疲倦或缺乏活力。- 抱怨不明的身体痛症，如头痛、胃痛。",
							url: "/scale/evaluation/instruction/instruction?scale=SCL&type=3"
						},
						{
							title: "我被校园霸凌了或者参与了校园霸凌：校园霸凌可以是身体的、言语的、社交的或网络的形式，这种行为不仅对被欺负者产生长远的负面心理影响。",
							url: "/scale/evaluation/instruction/instruction?scale=BPBQ&type=3"
						}
					]
				}
			};
		},
		computed: {},
		onPageScroll(e) {
			this.handlePageScroll(e)
		},
		onLoad(options) {
			this.type = options.type;
			this.initTypewriter();
		},
		methods: {
			initTypewriter() {
				if (!this.detail[this.type]) return;
				this.displayText = new Array(this.detail[this.type].length).fill('');
				this.currentIndex = 0;
				this.currentTextIndex = 0;
				this.startTypewriter();
			},
			startTypewriter() {
				if (!this.detail[this.type]) return;
				const text = this.detail[this.type][this.currentTextIndex];
				if (this.currentIndex < text.length) {
					this.$set(this.displayText, this.currentTextIndex,
						text.substring(0, this.currentIndex + 1));
					this.currentIndex++;
					setTimeout(() => {
						this.startTypewriter();
					}, this.typewriterSpeed);
				} else {
					this.currentTextIndex++;
					if (this.currentTextIndex < this.detail[this.type].length) {
						this.currentIndex = 0;
						setTimeout(() => {
							this.startTypewriter();
						}, 500); // 段落之间的延迟
					} else {
						this.isTextComplete = true;
					}
				}
			},
			selectOption(index) {
				this.selectedOption = index;
			},
			test() {
				if (this.type == "1") {
					this.goTo({
						url: "/scale/evaluation/instruction/instruction?scale=SCL&type=1"
					});
					return;
				}
				if (this.selectedOption === null) {
					uni.showToast({
						title: '请选择一个选项',
						icon: 'none'
					});
					return;
				}
				const selectedItem = this.question[this.type][this.selectedOption];
				if (!selectedItem.url) {
					uni.showToast({
						title: '该功能正在开发中',
						icon: 'none'
					});
					return;
				}
				this.goTo(selectedItem);
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