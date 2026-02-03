<template>
	<view class="">
		<!-- #ifdef MP-WEIXIN -->
		<page-container :show="isShow" custom-style="height:100vh;overflow:hidden" :overlay="false"
			@beforeleave="onBeforeLeave">
		<!-- #endif -->
			<view class="container">
				<my-navbar :title="detail.scaleName" :navBg="navBg"></my-navbar>
				<scroll-view scroll-y class="scroll-container" @scroll="onScroll">
					<view class="innerContainer">
						<view class="top">
							<view class="left">
								<view class="">
									<image src="@/static/scale/arrow.png" mode=""></image>
								</view>
								<text v-if="detail.id!=70">
									根据你最近一个月的真实状况进行答题更准确呀～
								</text>
								<text v-else>
									为了更准确地评估你的状况，请你填写基础信息～
								</text>
							</view>
							<view class="right">
								<u-image :src="sheep" width="200rpx" height="255rpx"></u-image>
							</view>
						</view>
						<view class="content">
							<!-- 答题进度 -->
							<view class="progress">
								<view class="left">
									答题进度
								</view>
								<view class="right">
									{{ currentQuestionIndex + 1 }}
									<text>
										/{{ questionList.length }}
									</text>
									<!-- 题库图标 -->
									<view class="question-bank-icon" @click="showQuestionBank">
										<u-icon name="list" size="32" color="#6986FD"></u-icon>
									</view>
								</view>
							</view>
							<u-line-progress active-color="#2979ff" :percent="progressPercent" height="12"
								:show-percent="false"></u-line-progress>

							<!-- 问题内容 -->
							<view class="question-content" v-if="currentQuestion">
								<text class="question-text">{{ currentQuestion.questionText }}</text>
							</view>

							<!-- 选项列表 - 单选题 -->
							<view class="options-list" v-if="currentQuestion && currentQuestion.responseType === 1">
								<view class="option-item" v-for="option in currentQuestion.optionFactorList"
									:key="option.id" :class="{ active: selectedOption === option.id }"
									@click="selectOption(option.id)">
									<text class="option-text">{{ option.optionValue }}</text>
								</view>
							</view>

							<!-- 填空题输入框 -->
							<view class="fill-blank" v-if="currentQuestion && currentQuestion.responseType === 3">
								<u-input v-model="fillBlankAnswer" type="textarea" placeholder="请输入答案" :border="true"
									@input="handleFillBlankInput" maxlength="-1"
									:focus="true"
									:cursor="fillBlankAnswer.length"
									:selection-start="fillBlankAnswer.length"
									:selection-end="fillBlankAnswer.length"
									:show-confirm-bar="false"></u-input>
							</view>
						</view>
						<view class="view1"></view>
						<view class="view2"></view>
						<!-- 导航按钮 -->
						<view class="navigation-buttons">
							<view class="prev-btn" @click="prevQuestion"
								:class="{ disabled: currentQuestionIndex === 0 }">
								上一题
							</view>
							<view class="next-btn" @click="handleNextOrSubmit" :class="{ disabled: !(this.currentQuestion && 
								this.resultList && 
								this.currentQuestion.id && 
								Object.prototype.hasOwnProperty.call(this.resultList, this.currentQuestion.id)) }">
								{{ isLastQuestion ? '提交' : '下一题' }}
							</view>
						</view>
						<!-- 添加一个只有调试模式才显示的全选B按钮 -->
						<!-- <view class="debug-buttons" v-if="isDebug">
							<view class="debug-btn" @click="selectAllB">
								全选B
							</view>
						</view> -->
					</view>
				</scroll-view>
			</view>
			
			<!-- 题库弹窗 -->
			<u-popup v-model="showQuestionBankPopup" mode="bottom" :safe-area-inset-bottom="true">
				<view class="question-bank-popup">
					<view class="popup-header">
						<view class="header-left">
							<text class="popup-title">题库</text>
							<text class="popup-subtitle">已完成 {{ getAnsweredCount() }}/{{ questionList.length }} 题</text>
						</view>
						<view class="mode-switch">
							<text :class="{active: questionBankMode==='detail'}" @click="setQuestionBankMode('detail')">详细</text>
							<text :class="{active: questionBankMode==='simple'}" @click="setQuestionBankMode('simple')">粗略</text>
						</view>
						<view class="close-btn" @click="showQuestionBankPopup = false">
							<text class="close-icon">×</text>
						</view>
					</view>
					<scroll-view scroll-y class="question-list-scroll">
						<!-- 详细模式 -->
						<view v-if="questionBankMode==='detail'" class="question-list">
							<view class="question-item" 
								v-for="(question, index) in questionList" 
								:key="question.id"
								:class="{ 
									'answered': isQuestionAnswered(question.id),
									'current': index === currentQuestionIndex 
								}"
								@click="jumpToQuestion(index)">
								<view class="question-number">{{ index + 1 }}</view>
								<view class="question-info">
									<text class="question-text">{{ question.questionText }}</text>
									<text class="question-status" v-if="isQuestionAnswered(question.id)">
										{{ getQuestionAnswer(question.id) }}
									</text>
								</view>
								<view class="question-status-icon">
									<text v-if="isQuestionAnswered(question.id)" class="answered-icon">✓</text>
									<text v-else class="unanswered-icon">○</text>
								</view>
							</view>
						</view>
						<!-- 粗略模式 -->
						<view v-else class="question-list-simple">
							<view class="question-simple-row" v-for="(row, rowIdx) in questionListSimpleRows" :key="rowIdx">
								<view
									class="question-simple-item"
									v-for="(question, colIdx) in row"
									:key="question.id"
									:class="{
										'answered': isQuestionAnswered(question.id),
										'current': (rowIdx * 5 + colIdx) === currentQuestionIndex
									}"
									@click="jumpToQuestion(rowIdx * 5 + colIdx)"
								>
									<view class="simple-number">{{ rowIdx * 5 + colIdx + 1 }}</view>
									<view class="simple-status">
										<text v-if="isQuestionAnswered(question.id)" class="answered-icon">✓</text>
										<text v-else class="unanswered-icon">○</text>
									</view>
								</view>
							</view>
						</view>
					</scroll-view>
					<view class="question-bank-submit-btn-wrapper">
						<view class="question-bank-submit-btn" @click="submitTest">
							提交
						</view>
					</view>
				</view>
			</u-popup>
		<!-- #ifdef MP-WEIXIN -->
		</page-container>
		<!-- #endif -->
	</view>
</template>

<script>
	import scrollMixin from '@/mixins/scrollMixin.js';
	export default {
		mixins: [scrollMixin],
		data() {
			return {
				sheep: this.$f.geturl("/uniapp/new/ai-bot/3-logo.png"),
				detail: "",
				id: "",
				archiveId:"",
				type: 0,
				questionList: [],
				resultList: {},
				currentQuestionIndex: 0,
				selectedOption: null,
				fillBlankAnswer: "", // 新增：填空题答案
				startTime: null, // 开始答题时间
				endTime: null, // 结束答题时间
				duration: 0, // 答题用时（秒）
				timer: null, // 计时器
				isShow: true, // page-container的显示状态
				lastAnsweredIndex: 0, // 记录最后回答的题目索引
				isDebug: true, // 调试模式标志
				showQuestionBankPopup: false, // 题库弹窗显示状态
				questionBankMode: 'simple' // 题库弹窗模式: detail 或 simple
			};
		},
		computed: {
			currentQuestion() {
				return this.questionList[this.currentQuestionIndex] || null;
			},
			progressPercent() {
				if (!this.questionList.length) return 0;
				return (this.currentQuestionIndex + 1) / this.questionList.length * 100;
			},
			isLastQuestion() {
				return this.currentQuestionIndex === this.questionList.length - 1;
			},
			hasCurrentAnswer() {
				return this.currentQuestion &&
					this.resultList &&
					this.currentQuestion.id &&
					Object.prototype.hasOwnProperty.call(this.resultList, this.currentQuestion.id);
			},
			questionListSimpleRows() {
				const rows = [];
				for (let i = 0; i < this.questionList.length; i += 5) {
					rows.push(this.questionList.slice(i, i + 5));
				}
				return rows;
			}
		},
		onLoad(option) {
			this.id = option.id;
			this.type = option.type;
			this.getDetail();
			// 检查是否有保存的进度
			this.checkSavedProgress();
			// 开始计时
			this.startTime = new Date();
			this.startTimer();
			if (option.archiveId) this.archiveId = option.archiveId;
		},
		onUnload() {
			// 清除计时器
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		// 监听返回按钮事件 (APP和H5平台生效)
		onBackPress(options) {
			// #ifdef APP-PLUS || H5
			// uni.showModal({
			// 	title: '提示',
			// 	content: '是否保存答题进度？',
			// 	success: (res) => {
			// 		if (res.confirm) {
			// 			// 保存进度
			// 			this.saveProgress();
			// 			// 用户确认返回，跳转到测试分类页
			// 			uni.navigateBack({
			// 				delta: 1
			// 			});
			// 			return false;
			// 		} else {
			// 			this.isShow = true;
			// 			uni.removeStorageSync(`scale_progress_${this.id}`);
			// 			uni.navigateBack({
			// 				delta: 1
			// 			});
			// 		}
			// 	}
			// });
			// #endif
		},
		methods: {
			// 处理滚动事件
			onScroll(e) {
				// 传递滚动事件给mixin处理
				this.handlePageScroll(e.detail);
			},
			getResult(id) {
				this.$H.get(`/userResponse/free/${id}`, {})
					.then(async res => {
						// 保存信息
						let info = uni.getStorageSync(`evaluation`);
						// info["量表名称1"] = id; // 测试用
						info[res.data.scaleName] = id;
						uni.setStorageSync(`evaluation`, info);
						console.log("info", info)

						let factorScore = JSON.parse(res.data.factorScore);
						let responseDetail = JSON.parse(res.data.responseDetail);
						let scaleName = res.data.scaleName;
						let url = `/scale/evaluation/result/result?type=1`; //默认结果页
						console.log("scaleName", scaleName, responseDetail)
						// 特殊判断得分,SCL:24,SAS:31,SDS:32,PPQ:36
						if (scaleName.includes("SCL")) {
							console.log("SCL", res.data)
							// 第十五题如果大于B，跳转危机干预
							if (responseDetail[14].optionValue.split('.')[0] > "B") {
								// 弹窗询问
								let answer = await uni.showModal({
									title: '提示',
									content: '看来，您有点极端倾向啊，请不要着急，您近期是否存在自杀的念头或计划， 您近期是否有伤害自己的冲动？',
									cancelText:	'没有',
									confirmText: '有'
								}).then((res)=>{
									console.log("res", res)
									if(res[1].confirm){
										url = `/scale/evaluation/result/result?type=2`
									}
								})
								if(url == '/scale/evaluation/result/result?type=2'){
									uni.navigateTo({
										url: url
									})
									return;
								}
							}
							if (factorScore.JL >= 2) {
								// 如果res.data.factorScore的JL焦虑因子分分>=2，跳转SAS量表
								url = `/scale/evaluation/instruction/instruction?scale=SAS&type=${this.type}`
							} else if (factorScore.YY >= 2) {
								// 如果res.data.factorScore的YY抑郁因子分>=2，跳转SDS量表
								url = `/scale/evaluation/instruction/instruction?scale=SDS&type=${this.type}`
							} else if (factorScore.RJGXMG >= 2) {
								// 如果res.data.factorScore的RJGXMG人际关系因子分>=2，跳转PPQ量表
								url = `/scale/evaluation/instruction/instruction?scale=PPQ&type=${this.type}`
							}
						} else if (scaleName.includes("SAS")) {
							// SAS总分>69,跳转医生转接
							if (factorScore.QT >= 69) {
								url = `/scale/evaluation/result/result?type=2`
							}
						} else if (scaleName.includes("SDS")) {
							// SDS总分>72,跳转医生转接
							if (factorScore.QT >= 72) {
								url = `/scale/evaluation/result/result?type=2`
							}
						}
						console.log("url", url)
						if (this.archiveId) {
							if (url.includes('?')) {
								url += `&archiveId=${this.archiveId}`;
							} else {
								url += `?archiveId=${this.archiveId}`;
							}
						}
						uni.navigateTo({
							url: url
						})
					});
			},
			getDetail() {
				// 获取详情
				this.$H.get(`scale/${this.id}`, {
						// id: this.id
					})
					.then(res => {
						this.detail = res.data;
					});
				// 获取题目
				this.$H.get(`question/questionList`, {
						scaleId: this.id
					})
					.then(res => {
						this.questionList = res.rows;
					});
			},
			// 跳转
			goTo(item) {
				uni.navigateTo({
					url: item.url
				});
			},
			handleNextOrSubmit() {
				if (this.isLastQuestion) {
					this.submitTest();
				} else {
					this.nextQuestion();
				}
			},
			selectOption(optionId) {
				this.$u.debounce(() => {
					this.selectedOption = optionId;
					// 保存完整的选项信息
					if (this.currentQuestion) {
						const selectedOption = this.currentQuestion.optionFactorList.find(opt => opt.id ===
							optionId);
						if (selectedOption) {
							this.resultList[this.currentQuestion.id] = selectedOption;
							// 保存进度
							this.saveProgress();
							// 延迟一小段时间后自动跳转到下一题，让用户能看到选中效果
							setTimeout(() => {
								if (!this.isLastQuestion) {
									this.handleNextOrSubmit();
								}
							}, 500);
						}
					}
				}, 500, true)
			},
			// 新增：处理填空题输入
			handleFillBlankInput(value) {
				if (this.currentQuestion) {
					// 检查输入是否为空或只包含空格
					const trimmedValue = value.trim();
					if (!trimmedValue) {
						// 如果为空或只包含空格，从resultList中删除该题目的答案
						delete this.resultList[this.currentQuestion.id];
					} else {
						// 创建填空题答案对象
						const answer = {
							id: this.currentQuestion.id,
							// questionText: this.currentQuestion.questionText,
							optionValue: trimmedValue // 使用去除首尾空格的值
						};
						this.resultList[this.currentQuestion.id] = answer;
					}
					// 保存进度
					this.saveProgress();
				}
			},
			startTimer() {
				// 每秒更新一次用时
				this.timer = setInterval(() => {
					const now = new Date();
					this.duration = Math.floor((now - this.startTime) / 1000);
				}, 1000);
			},
			formatDuration(seconds) {
				const minutes = Math.floor(seconds / 60);
				const remainingSeconds = seconds % 60;
				return `${minutes}分${remainingSeconds}秒`;
			},
			submitTest() {
				// 记录结束时间
				this.endTime = new Date();

				// 检查是否所有题目都已答完
				const answeredQuestions = Object.keys(this.resultList).length;
				if (answeredQuestions < this.questionList.length) {
					// 先打开题库弹窗
					this.showQuestionBank();
					// 延迟显示提示，让用户先看到弹窗
					setTimeout(() => {
						uni.showToast({
							title: '请完成所有题目',
							icon: 'none',
							duration: 2000
						});
					}, 500);
					return;
				}

				// 转换为数组格式
				const answersArray = this.questionList.map(question => {
					const answer = this.resultList[question.id];
					if (!answer) return null;
					return answer;
				}).filter(item => item !== null);

				// 清除计时器
				if (this.timer) {
					clearInterval(this.timer);
				}


				uni.showLoading({
					title: '提交中...'
				});

				if (this.id == 70) {
					// 评估模式
					let data = answersArray.reduce((acc, item, index) => {
						acc['text' + (index + 1)] = item.optionValue;
						return acc;
					}, {});
					console.log(data);
					// 检查text2是否为数字字符串并且在有效范围内
					if (data.text2) {
						if (!/^\d+$/.test(data.text2)) {
							uni.showToast({
								title: '请输入正确的年龄',
								icon: 'none'
							});
							return;
						}
						const age = parseInt(data.text2);
						if (age < 1 || age > 100) {
							uni.showToast({
								title: '年龄应在1-100之间',
								icon: 'none'
							});
							return;
						}
					}
					this.$H.post(`psychologicalAssessmentUser`, data).then(res => {
						// 首先晴空数据
						uni.removeStorageSync(`evaluation`);
						// 保留数据到本地
						uni.setStorageSync(`evaluation`, {
							userData: res.data
						});
						// 清除答题记录
						uni.removeStorageSync(`scale_progress_${this.id}`);
						if (this.type == "1") {
							uni.navigateTo({
								url: `/scale/evaluation/instruction/instruction?scale=SCL&type=1`
							})
						} else {
							uni.navigateTo({
								url: `/scale/evaluation/evaluation?type=${this.type}`
							})
						}
					}).finally(() => {
						uni.hideLoading();
					})
					return;
				}
				// 特殊量表 生活过渡和适应 id为102
				if (this.id == 102) {
					// 保存信息到本地缓存
					console.log(1111111, answersArray);
					let scaleData = uni.getStorageSync(`evaluation`);
					scaleData.emotionData = {
						aspectValue: answersArray[0].optionValue,
						questionValue: answersArray[1].optionValue,
					}
					uni.setStorageSync(`evaluation`, scaleData);
					uni.navigateTo({
						url: `/scale/evaluation/result/result?type=1`
					})
					return;
				}

				// 提交答案，包含用时信息
				this.$H.post(`scale/calculate`, {
					optionFactors: answersArray,
					scaleId: this.id,
					durationSeconds: this.duration, // 添加用时（秒）
					responseTime: this.$u.timeFormat(this.startTime, 'yyyy-mm-dd hh:MM:ss'), // 开始时间
					// endTime: this.endTime.toISOString() // 结束时间
				}).then(res => {
					// 删除本地缓存
					uni.removeStorageSync(`scale_progress_${this.id}`);
					uni.hideLoading();
					if (res.code === 200) {
						uni.showToast({
							title: `完成测试`,
							icon: 'success',
							duration: 2000
						});

						// 提交成功后的跳转
						if (this.type) {
							this.getResult(res.data);
						} else {
							setTimeout(() => {
								// 跳转到结果页
								uni.navigateTo({
									url: "/scale/result/result?id=" + res.data + (this.archiveId ? `&archiveId=${this.archiveId}` : '')
								})
							}, 2000);
						}
					} else {
						uni.showToast({
							title: res.msg || '提交失败',
							icon: 'none'
						});
					}
				}).catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: '提交失败',
						icon: 'none'
					});
				});
			},
			prevQuestion() {
				if (this.currentQuestionIndex > 0) {
					this.currentQuestionIndex--;
					// 恢复之前的选择
					if (this.currentQuestion) {
						if (this.currentQuestion.responseType === 1) {
							this.selectedOption = this.resultList[this.currentQuestion.id]?.id || null;
						} else if (this.currentQuestion.responseType === 3) {
							this.fillBlankAnswer = this.resultList[this.currentQuestion.id]?.optionValue || "";
						}
					}
				}
			},
			nextQuestion() {
				if (this.currentQuestionIndex < this.questionList.length - 1) {
					this.currentQuestionIndex++;
					// 恢复之前的选择
					if (this.currentQuestion) {
						if (this.currentQuestion.responseType === 1) {
							this.selectedOption = this.resultList[this.currentQuestion.id]?.id || null;
						} else if (this.currentQuestion.responseType === 3) {
							this.fillBlankAnswer = this.resultList[this.currentQuestion.id]?.optionValue || "";
						}
					}
				}
			},
			// page-container返回事件处理
			onBeforeLeave(e) {
				this.isShow = false;
				// 弹窗提示用户
				uni.showModal({
					title: '提示',
					content: '是否保存答题进度？',
					success: (res) => {
						if (res.confirm) {
							// 保存进度
							this.saveProgress();
							// 用户确认返回，跳转到测试分类页
							uni.navigateBack({
								delta: 1
							})
						} else {
							this.isShow = true;
							uni.removeStorageSync(`scale_progress_${this.id}`);
							uni.navigateBack({
								delta: 1
							});
						}
					}
				});
			},
			// 检查保存的进度
			checkSavedProgress() {
				const savedProgress = uni.getStorageSync(`scale_progress_${this.id}`);
				if (savedProgress) {
					uni.showModal({
						title: '提示',
						content: '检测到您有未完成的测试，是否继续上次的进度？',
						success: (res) => {
							if (res.confirm) {
								// 恢复进度
								const progress = JSON.parse(savedProgress);
								this.resultList = progress.resultList;
								this.currentQuestionIndex = progress.currentQuestionIndex;
								this.lastAnsweredIndex = progress.currentQuestionIndex;
								this.duration = progress.duration;
								// 恢复当前题目的选择
								if (this.currentQuestion) {
									if (this.currentQuestion.responseType === 1) {
										this.selectedOption = this.resultList[this.currentQuestion.id]?.id ||
											null;
									} else if (this.currentQuestion.responseType === 3) {
										this.fillBlankAnswer = this.resultList[this.currentQuestion.id]
											?.optionValue || "";
									}
								}
							} else {
								uni.removeStorageSync(`scale_progress_${this.id}`);
							}
						}
					});
				}
			},
			// 保存进度
			saveProgress() {
				const progress = {
					resultList: this.resultList,
					currentQuestionIndex: this.currentQuestionIndex,
					duration: this.duration
				};
				uni.setStorageSync(`scale_progress_${this.id}`, JSON.stringify(progress));
			},
			// 添加全选B的方法
			selectAllB() {
				this.questionList.forEach(question => {
					if (question.responseType === 1) { // 只处理单选题
						const optionB = question.optionFactorList.find(option => option.optionValue.includes('B'));
						if (optionB) {
							this.resultList[question.id] = {
								...optionB
							};
						}
					}
				});
				// 更新当前题目的选中状态
				if (this.currentQuestion && this.currentQuestion.responseType === 1) {
					const optionB = this.currentQuestion.optionFactorList.find(option => option.optionValue === 'B');
					if (optionB) {
						this.selectedOption = optionB.id;
					}
				}
				// 跳转到最后一题
				this.currentQuestionIndex = this.questionList.length - 1;
				// 恢复最后一题的选择状态
				if (this.currentQuestion) {
					if (this.currentQuestion.responseType === 1) {
						this.selectedOption = this.resultList[this.currentQuestion.id]?.id || null;
					} else if (this.currentQuestion.responseType === 3) {
						this.fillBlankAnswer = this.resultList[this.currentQuestion.id]?.optionValue || "";
					}
				}
			},
			// 显示题库弹窗
			showQuestionBank() {
				this.showQuestionBankPopup = true;
			},
			// 获取已回答题目数量
			getAnsweredCount() {
				return Object.keys(this.resultList).length;
			},
			// 判断题目是否已回答
			isQuestionAnswered(questionId) {
				return Object.prototype.hasOwnProperty.call(this.resultList, questionId);
			},
			// 获取题目答案
			getQuestionAnswer(questionId) {
				const answer = this.resultList[questionId];
				if (answer) {
					if (answer.optionValue) {
						return answer.optionValue;
					}
					return '已回答';
				}
				return '未回答';
			},
			// 跳转到指定题目
			jumpToQuestion(index) {
				this.currentQuestionIndex = index;
				this.showQuestionBankPopup = false;
				// 恢复当前题目的选择
				if (this.currentQuestion) {
					if (this.currentQuestion.responseType === 1) {
						this.selectedOption = this.resultList[this.currentQuestion.id]?.id || null;
					} else if (this.currentQuestion.responseType === 3) {
						this.fillBlankAnswer = this.resultList[this.currentQuestion.id]?.optionValue || "";
					}
				}
			},
			// 题库模式切换
			setQuestionBankMode(mode) {
				this.questionBankMode = mode;
			}
		}
	};
</script>
<style lang="scss" scoped>
	.scroll-container {
		height: calc(100vh - 140rpx);
	}

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

	.top {
		display: flex;
		justify-content: space-between;
		padding: 0 20rpx;

		.left {

			image {
				width: 40rpx;
				height: 32rpx;
				margin-right: 10rpx;
			}
		}

	}

	.content {
		width: 686rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		border: 1rpx solid #FFFFFF;
		backdrop-filter: blur(30px);
		box-sizing: border-box;
		margin-top: -60rpx;
		padding: $gap;

		.question-bank-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: 20rpx;
			padding: 12rpx;
			border-radius: 12rpx;
			transition: all 0.3s ease;
			border: 1rpx solid transparent;

			&:active {
				transform: scale(0.9);
				background-color: rgba(118, 145, 255, 0.1);
				border-color: rgba(118, 145, 255, 0.3);
			}
		}

		.progress {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-weight: bold;
			font-size: 32rpx;
			color: #6986FD;

			.right {
				display: flex;
				align-items: center;

				text {
					font-size: 24rpx;
					color: #21252D;
				}
			}
		}
	}

	.view1 {
		width: 582rpx;
		height: 36rpx;
		background: #EEEEFF;
		border-radius: 0 0 24rpx 24rpx;
		backdrop-filter: blur(30px);
		margin: 0 auto;
	}

	.view2 {
		width: 520rpx;
		height: 36rpx;
		background: #E3E3FF;
		border-radius: 0 0 24rpx 24rpx;
		backdrop-filter: blur(30px);
		margin: 0 auto;
	}

	.question-content {
		margin: 40rpx 0;

		.question-text {

			font-weight: 600;
			font-size: 36rpx;
			color: #1B1B26;
			line-height: 50rpx;
		}
	}

	.options-list {
		.option-item {
			display: flex;
			align-items: center;
			padding: 30rpx;
			margin-bottom: 20rpx;
			border-radius: 16rpx;
			background: #F8FAFF;
			color: #333;

			&.active {

				background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
				color: white;
			}

			.option-text {
				flex: 1;
			}
		}
	}

	.fill-blank {
		margin-top: 40rpx;
	}

	.navigation-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 60rpx;

		.prev-btn,
		.next-btn {
			padding: 20rpx 60rpx;
			border-radius: 100rpx;
			font-size: 32rpx;
			text-align: center;
			// transition: all 0.3s ease;
			width: 274rpx;
			height: 88rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;
				pointer-events: none;
			}
		}

		.prev-btn {
			color: #2979ff;
			background: #fff;
			// border: 2rpx solid #2979ff;

			&.disabled {
				border-color: #ccc;
				color: #ccc;
			}
		}

		.next-btn {
			color: #fff;
			background: #2979ff;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);

			&.disabled {
				background: #ccc;
				color: #fff;
			}
		}
	}

	.debug-buttons {
		display: flex;
		justify-content: center;
		margin-top: 20rpx;

		.debug-btn {
			padding: 20rpx 60rpx;
			border-radius: 100rpx;
			font-size: 32rpx;
			text-align: center;
			width: 274rpx;
			height: 88rpx;
			background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
			border-radius: 16rpx;
		}
	}

	/* 题库弹窗样式 */
	.question-bank-popup {
		background-color: #fff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		padding: 20rpx;
		height: 80vh; /* 弹窗高度 */
		display: flex;
		flex-direction: column;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
		position: relative;

		.header-left {
			flex: 1;
		}

		.popup-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}

		.popup-subtitle {
			font-size: 24rpx;
			color: #666;
			margin-top: 5rpx;
			margin-left: 20rpx;
		}

		.mode-switch {
			display: flex;
			align-items: center;
			margin-left: 20rpx;
			margin-right: 20rpx;
			text {
				margin-left: 12rpx;
				font-size: 28rpx;
				color: #999;
				padding: 4rpx 16rpx;
				border-radius: 8rpx;
				cursor: pointer;
				&.active {
					color: #2979ff;
					background: #e1f3d8;
					font-weight: bold;
				}
			}
		}

		.close-btn {
			padding: 10rpx;
			border-radius: 50%;
			background-color: #f0f0f0;
			width: 60rpx;
			height: 60rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 40rpx;
			color: #999;
		}
	}

	.question-list-scroll {
		flex: 1;
		overflow-y: auto;
	}

	.question-list {
		display: flex;
		flex-direction: column;
	}

	.question-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-bottom: 10rpx;
		transition: all 0.3s ease;
		border: 2rpx solid transparent;

		&:last-child {
			margin-bottom: 0;
		}

		&.answered {
			background-color: #f0f9eb;
			border-color: #67c23a;
		}

		&.current {
			background-color: #e1f3d8;
			border-color: #2979ff;
			font-weight: bold;
		}

		&:active {
			transform: scale(0.98);
		}

		.question-number {
			font-size: 32rpx;
			font-weight: bold;
			color: #666;
			margin-right: 20rpx;
			width: 60rpx;
			height: 60rpx;
			background: #f5f5f5;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.question-info {
			flex: 1;
			margin-right: 20rpx;

			.question-text {
				font-size: 28rpx;
				color: #333;
				line-height: 36rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}

			.question-status {
				font-size: 22rpx;
				color: #999;
				margin-top: 8rpx;
			}
		}

		.question-status-icon {
			font-size: 40rpx;
			margin-left: 20rpx;
		}

		.answered-icon {
			color: #67c23a;
		}

		.unanswered-icon {
			color: #f56c6c;
		}
	}

	.question-list-simple {
		display: flex;
		flex-direction: column;
		padding: 10rpx 0;
		.question-simple-row {
			display: flex;
			flex-direction: row;
			gap: 19rpx;
			margin-bottom: 16rpx;
			justify-content: flex-start;
			padding-left: 16rpx;
			padding-right: 16rpx;
		}
		.question-simple-item {
			flex: 0 0 120rpx;
			max-width: 120rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 16rpx 0;
			border-radius: 12rpx;
			background: #f5f7fa;
			transition: all 0.2s;
			&.answered {
				background: #e1f3d8;
			}
			&.current {
				border: 2rpx solid #2979ff;
			}
			.simple-number {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 4rpx;
			}
			.simple-status {
				font-size: 24rpx;
			}
		}
	}
	.question-bank-submit-btn-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24rpx 0 0 0;
	}
	.question-bank-submit-btn {
		width: 686rpx;
		max-width: 686rpx;
		padding: 12rpx 0;
		background: linear-gradient(333deg, #DEE4FF 0%, #7691FF 100%);
		color: #fff;
		font-size: 32rpx;
		border-radius: 16rpx;
		text-align: center;
		font-weight: bold;
		box-shadow: 0 2rpx 8rpx rgba(118,145,255,0.12);
		transition: all 0.2s;
		margin: 0 auto;
		cursor: pointer;
		&:active {
			background: #7691FF;
		}
	}
</style>