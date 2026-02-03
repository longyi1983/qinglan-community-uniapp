import $store from '@/store/index.js';
import request from '@/utils/request.js'
import config from '@/utils/config.js';
import { base64ToFile } from '@/utils/tools.js';
let headerTimer = null;
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;
let reconnectTimer = null;
let isReconnecting = false;
let isInitiating = false;
let socketAi = null;
let sessionId = null;
let mode = "OH";
// 保存初始配置，用于重连时使用
let currentInitConfig = null;
let workflow = {
	OH: "7498546152947171340", //OH卡
	ED: "7506726447454191650", //探梦
	CC: "7506711784053538851", //疗愈师
	CBT: "", //CBT
}
let initQuestion = {
	OH: "你好爱卡师，我抽到了一张图卡和一张字卡。",
	ED: "你好",
	CC: "你好",
	CBT: "你好CBT师，我最近很焦虑，不知道该怎么办。",
}

export default {
	// 音频队列
	audioQueue: [],
	// 是否正在播放
	isPlaying: false,
	// 当前播放的音频上下文
	currentAudioContext: null,

	async getSessionId() {
		return new Promise((resolve, reject) => {
			request.get('userHistory/sessionId', {})
				.then(res => {
					if (res.code == 200) {
						sessionId = res.data;
						resolve(sessionId);
					} else if (res.code == 666) {
						// 处理付费错误
						console.log('AI模式需要付费：', res);
						reject({
							code: 666,
							needPay: true,
							payData: res.data,
							msg: res.msg
						});
					} else {
						reject(res.msg);
					}
				}).catch((err) => {
					reject(err);
				});
		});
	},

	// 获取旧的sessionId，不生成新的
	getOldSessionId() {
		return sessionId;
	},

	initWebSocket(initConfig) {
		// 确保清理之前的状态
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		if (isInitiating) {
			console.log('WebSocket正在连接中，跳过重复连接');
			return;
		}

		// 保存当前配置，用于重连时使用
		if (initConfig) {
			currentInitConfig = initConfig;
		}
		
		// 如果没有传入配置但有保存的配置，则使用保存的配置
		const configToUse = initConfig || currentInitConfig || {};

		// 如果传入了sessionId，则使用传入的sessionId
		if (configToUse?.sessionId) {
			sessionId = configToUse.sessionId;
		}
		// 只在首次初始化或明确传入mode时才更新mode
		if (configToUse?.mode) {
			console.log(`更新mode从 ${mode} 到 ${configToUse.mode}`);
			mode = configToUse.mode;
		}
		
		console.log(`当前使用的mode: ${mode}, sessionId: ${sessionId}`);
		
		// 添加登录状态检查
		if (!$store.state.token) {
			console.error('Token不存在，WebSocket无法连接');
			// 让用户登录
			uni.showModal({
				title: '提示',
				content: '请先登录',
				showCancel: false,
				success: () => {
					uni.navigateTo({
						url: '/pages/user/go-login'
					});
				}
			});

			return;
		}

		isInitiating = true;
		isReconnecting = false;

		// 确保之前的连接完全清理
		this.cleanup();

		// 建立新连接
		socketAi = uni.connectSocket({
			url: config.websocketOhCard + $store.state.token,
			success: res => {
				console.log('WebSocket连接请求成功1:', config.websocketOhCard + $store.state.token,
					res, $store.state.aiHistory.length);
				$store.state.isAnswering = false;
				setTimeout(() => {
					if ($store.state.aiHistory.length == 0) {
						// 优先使用chat.vue中的doAnswer方法
						if ($store.state.chatDoAnswer) {
							console.log('使用chat.vue中的doAnswer方法发送初始消息');
							$store.state.chatDoAnswer(initQuestion[mode], 'voice');
						} else {
							// 备用：使用aiWebsocket中的doAnswer方法
							console.log('使用aiWebsocket中的doAnswer方法发送初始消息');
						// 当mode为OH时，传入图卡和字卡URL
						if (mode === 'OH' && configToUse.wordCard && configToUse.pictureCard) {
							this.doAnswer(initQuestion[mode], "voice", configToUse.wordCard, configToUse.pictureCard);
						} else {
							this.doAnswer(initQuestion[mode], "voice");
							}
						}
					}
				}, 800)
			},
			fail: res => {
				console.error('WebSocket连接请求失败:', res);
				// 延迟一下再重连，避免立即重连
				setTimeout(() => {
					this.reconnect();
				}, 1000);
			}
		});



		socketAi.onOpen(() => {
			console.log('WebSocket打开成功');
			$store.state.isOhCardSocketOpenetOpen = true;
			reconnectAttempts = 0;
			isReconnecting = false;
			isInitiating = false;
			this.sendHeader();
			
			// WebSocket重连成功后，如果有等待播放的音频队列，继续播放
			this.resumeAudioPlaybackAfterReconnect();
		});

		socketAi.onClose(() => {
			console.log('WebSocket连接已关闭');
			$store.isOhCardSocketOpenrdSocketOpen = false;
			isInitiating = false;
			isReconnecting = false;

			if (headerTimer) {
				clearInterval(headerTimer);
				headerTimer = null;
			}

			// 延迟一下再重连，避免立即重连
			setTimeout(() => {
				this.reconnect();
			}, 1000);
		});

		socketAi.onError((error) => {
			console.error('WebSocket连接错误:', error);
			// $isOhCardSocketOpenisOhCardSocketOpen = false;
			isInitiating = false;
			isReconnecting = false;

			if (headerTimer) {
				clearInterval(headerTimer);
				headerTimer = null;
			}

			// 延迟一下再重连，避免立即重连
			setTimeout(() => {
				this.reconnect();
			}, 1000);
		});

		socketAi.onMessage((res) => {
			try {
				console.log('WebSocket收到消息:', res.data);
				let data = JSON.parse(res.data);
				this.handleMessage(data);
			} catch (error) {
				console.error('消息解析错误:', error);
				console.error('原始消息内容:', res.data);
			}
		});
	},
	//心跳检测
	sendHeader() {
		// 清理已存在的心跳定时器
		if (headerTimer) {
			clearInterval(headerTimer);
			headerTimer = null;
		}

		headerTimer = setInterval(() => {
			// 只在连接开启状态下发送心跳
			if (!$store.state.isOhCardSocketOpen) {
				clearInterval(headerTimer);
				headerTimer = null;
				return;
			}

			let message = {
				type: 'ping',
				data: {}
			}
			socketAi.send({
				data: JSON.stringify(message),
				success: () => {
					console.log("发送心跳成功");
				},
				fail: () => {
					console.log("发送心跳失败");
					clearInterval(headerTimer);
					headerTimer = null;
					this.reconnect();
				}
			});
		}, 10000);
	},
	reconnect() {
		console.log("开始重连", reconnectAttempts, MAX_RECONNECT_ATTEMPTS)
		// 先清理之前的定时器
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		// 重置状态
		isReconnecting = false;
		isInitiating = false;

		// if (reconnectAttempts = MAX_RECONNECT_ATTEMPTS) {
		// 	console.log('达到最大重连次数，重置所有状态');
		// 	reconnectAttempts = 0;
		// 	return;
		// }

		// 清理心跳定时器
		if (headerTimer) {
			clearInterval(headerTimer);
			headerTimer = null;
		}

		console.log(`准备第${reconnectAttempts + 1}次重连`);
		reconnectTimer = setTimeout(() => {
			reconnectAttempts++;
			this.initWebSocket();
		}, RECONNECT_INTERVAL);
	},
	// 清理方法（保留音频队列和正在播放的音频）
	cleanup() {
		if (headerTimer) {
			clearInterval(headerTimer);
			headerTimer = null;
		}

		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		if ($store.state.isOhCardSocketOpen) {
			socketAi.closeSocket();
		}

		// WebSocket重连时不干扰音频播放，只重置连接状态
		console.log(`WebSocket清理时保持音频播放，队列长度: ${this.audioQueue.length}, 正在播放: ${this.isPlaying}`);

		$store.state.isOhCardSocketOpen = false;
		isReconnecting = false;
		isInitiating = false;
	},

	// 新增：只在需要时才强制清理音频（比如用户主动退出）
	forceCleanupAudio() {
		console.log('强制清理所有音频资源');
		this.cleanupAudioQueue();
	},

	// 修改：只在特殊情况下清理当前音频（比如错误恢复）
	cleanupCurrentAudioOnly() {
		console.log('清理当前音频上下文（保留队列和播放状态）');
		
		// 只清理当前音频上下文的事件监听器，不停止播放
		if (this.currentAudioContext) {
			try {
				// 只移除事件监听器，不停止播放
				this.currentAudioContext.offCanplay && this.currentAudioContext.offCanplay();
				this.currentAudioContext.offEnded && this.currentAudioContext.offEnded();
				this.currentAudioContext.offError && this.currentAudioContext.offError();
				this.currentAudioContext.offStop && this.currentAudioContext.offStop();
				this.currentAudioContext.offTimeUpdate && this.currentAudioContext.offTimeUpdate();
				this.currentAudioContext.offPlay && this.currentAudioContext.offPlay();
				
				// 不停止和销毁音频上下文，让它继续播放
				console.log('保持音频播放，不停止当前音频');
			} catch (e) {
				console.warn('清理音频事件监听器时出错:', e);
			}
			// 不设置 currentAudioContext = null，让音频继续播放
		}
		
		// 清理H5的blob url
		if (this._currentObjectUrl) {
			try { 
				URL.revokeObjectURL(this._currentObjectUrl); 
			} catch(e) {
				console.warn('清理blob URL时出错:', e);
			}
			this._currentObjectUrl = null;
		}
		
		// 不重置 isPlaying 状态，让音频继续播放
		console.log(`当前音频保持播放，队列长度: ${this.audioQueue.length}, 播放状态: ${this.isPlaying}`);
	},

	// 优化：WebSocket重连后的音频状态检查
	resumeAudioPlaybackAfterReconnect() {
		console.log(`WebSocket重连成功，检查音频状态 (队列:${this.audioQueue.length}, 播放中:${this.isPlaying})`);
		
		if (this.isPlaying) {
			console.log('音频正在播放中，WebSocket重连不影响播放');
			return;
		}
		
		if (this.audioQueue.length > 0) {
			console.log(`WebSocket重连成功，恢复音频播放，队列长度: ${this.audioQueue.length}`);
			// 延迟一下确保WebSocket完全稳定
			setTimeout(() => {
				if (this.audioQueue.length > 0 && !this.isPlaying) {
					this.playAudioQueue();
				}
			}, 300); // 减少延迟到300ms
		} else {
			console.log('WebSocket重连成功，无音频队列需要处理');
		}
	},
	// 回复消息
	doAnswer(msg, type, cardType, wordCardUrl, pictureCardUrl, opts = {}) {
		// 设置在回复中
		$store.state.isAnswering = true;
		// $store.state.aiDataList.unshift({
		// 	time: '',
		// 	icon: aiInfo.img,
		// 	name: aiInfo.name,
		// 	content: '',
		// 	isMe: false
		// })
		// 发送信息
		let message = {
			"parameters": {
				"history": $store.state.aiHistory,
				"question": msg
			},
			"workflow_id": workflow[mode],
			"sessionId": sessionId,
			"type": type || "characters",
			"mode": mode,
			"IPName": $store.state.currentAiInfo.name || "" // 添加用户角色IP名称
		};

		// 当mode为OH时，添加图卡和字卡URL
		if (mode === 'OH' && wordCardUrl && pictureCardUrl) {
			message.word_card_url = wordCardUrl;
			message.flashcards_url = pictureCardUrl;
		}
		
		// 当mode为OH时，更新workflow_id
		if (mode === 'OH') {
			if (cardType === 'normal') {
				message.workflow_id = '7580619507565363254';
			} else if(cardType === 'child') {
				message.workflow_id = '7584058417787158566';
			} else if(cardType === 'emotion') {
				message.workflow_id = '7584058645383839750';
			}
		}

		socketAi.send({
			data: JSON.stringify(message),
			success: (res) => {
				console.log("发送消息成功", JSON.parse(JSON.stringify(message)), res);
				console.log("发送消息时间", Date.now());
				// 去重：若最后一条与当前用户话术相同，则不重复追加
				try {
					const hist = $store.state.aiHistory || [];
					const last = hist.length > 0 ? hist[hist.length - 1] : null;
					if (!last || last.user !== msg) {
						$store.state.aiHistory.push({ user: msg });
					} else {
						console.log('跳过重复的用户话术入栈');
					}
				} catch (e) {
					console.warn('写入aiHistory时发生异常，已忽略去重', e);
				}
			},
			fail: () => {
				console.log("发送消息失败");
				clearInterval(headerTimer);
				headerTimer = null;
				if (opts && typeof opts.onFail === 'function') {
					opts.onFail();
				}
				this.reconnect();
			}
		});
	},
	handleMessage(data) {
		console.log("接收到信息", data,$store.state.aiDataList[0]?.content);
		console.log("接收到信息时间", Date.now());
		
		// 检查是否有AI数据列表
		if (!$store.state.aiDataList || $store.state.aiDataList.length === 0) {
			console.log("AI数据列表为空，忽略响应");
			return;
		}
		
		// 找到对应的pending消息，支持多种匹配方式
		let targetMessage = null;
		let targetIndex = -1;
		
		// 方式1：精确匹配question字段
		for (let i = 0; i < $store.state.aiDataList.length; i++) {
			const item = $store.state.aiDataList[i];
			if (!item.isMe && item.status === 'pending' && item.question === data.question) {
				targetMessage = item;
				targetIndex = i;
				console.log(`通过question字段找到匹配消息: ID=${item.id}`);
				break;
			}
		}
		
		// 方式2：如果没找到，查找最新的pending消息（兜底逻辑，主要用于初始化）
		if (!targetMessage) {
			for (let i = 0; i < $store.state.aiDataList.length; i++) {
				const item = $store.state.aiDataList[i];
				if (!item.isMe && item.status === 'pending') {
					targetMessage = item;
					targetIndex = i;
					console.log(`通过pending状态找到匹配消息: ID=${item.id}, question="${item.question}", 接收到的question="${data.question}"`);
					break;
				}
			}
		}
		
		if (!targetMessage) {
			console.log("未找到匹配的pending消息，当前pending消息列表:", 
				$store.state.aiDataList.filter(item => !item.isMe && item.status === 'pending').map(item => ({
					id: item.id,
					question: item.question,
					status: item.status
				}))
			);
			console.log("忽略响应，接收到的question:", data.question);
			return;
		}
		
		console.log(`找到匹配消息: ID=${targetMessage.id}, 状态=${targetMessage.status}`);
		
		// 双重检查消息状态
		if (targetMessage.status !== 'pending') {
			console.log(`消息状态已变为 ${targetMessage.status}，忽略响应`);
			return;
		}
		
		let currentAnswerStr = data.content;
		// 完整的回复字符串，这里直接重复用户提问的内容
		if (data.content_type == 'text') {
			// 再次检查目标索引是否仍然有效（防止消息被删除）
			if (targetIndex >= 0 && targetIndex < $store.state.aiDataList.length && $store.state.aiDataList[targetIndex]) {
				$store.state.aiDataList[targetIndex].content = ($store.state.aiDataList[targetIndex].content || '') + currentAnswerStr;
				// 更新流式到达时间，供页面侧的超时逻辑续期
				$store.state.aiDataList[targetIndex].lastUpdateTime = Date.now();
				try {
					if ($store.state.refreshMessageTimeout && targetMessage && targetMessage.id) {
						$store.state.refreshMessageTimeout(targetMessage.id);
					}
				} catch(e) {}
			} else {
				console.log(`消息 ${targetMessage.id} 已被删除，忽略内容更新`);
				return;
			}
		}
		
		if (data.node_is_finish) {
			// 再次检查目标索引和消息状态（防止消息被删除）
			if (targetIndex >= 0 && targetIndex < $store.state.aiDataList.length && 
				$store.state.aiDataList[targetIndex] && 
				$store.state.aiDataList[targetIndex].status === 'pending') {
				console.log(`消息 ${targetMessage.id} 在aiWebsocket中标记为成功`);
				$store.state.aiDataList[targetIndex].status = 'success';
				// 根据音频播放状态决定是否结束思考中
				const hasAudio = this.isPlaying || this.audioQueue.length > 0 || !!this.currentAudioContext;
				if (!hasAudio) {
					$store.state.isAnswering = false;
				} else {
					$store.state.isAnswering = true;
				}
				try {
					const hist = $store.state.aiHistory || [];
					const answer = $store.state.aiDataList[targetIndex].content;
					const last = hist.length > 0 ? hist[hist.length - 1] : null;
					if (!last || last.agent !== answer) {
						$store.state.aiHistory.push({ agent: answer });
					} else {
						console.log('跳过重复的AI答案入栈');
					}
				} catch (e) {
					console.warn('写入aiHistory(agent)时发生异常，已忽略去重', e);
				}
				
				// 重置超时倍数（成功收到回复）
				if ($store.state.resetTimeoutMultiplier) {
					$store.state.resetTimeoutMultiplier();
				}
			} else {
				console.log(`消息 ${targetMessage.id} 已被删除或状态已变化，忽略完成响应`);
			}
		}
		
		// 如果包含base64字段，则为语音
		if (data.base64) {
			// 语音也视为有效的流式到达，刷新lastUpdateTime与定时器
			try {
				if (targetIndex >= 0 && targetIndex < $store.state.aiDataList.length && $store.state.aiDataList[targetIndex]) {
					$store.state.aiDataList[targetIndex].lastUpdateTime = Date.now();
					if ($store.state.refreshMessageTimeout && targetMessage && targetMessage.id) {
						$store.state.refreshMessageTimeout(targetMessage.id);
					}
				}
			} catch(e) {}
			this.addToAudioQueue(data.base64);
		}
	},
    // 播放音频队列（优化版，解决微信小程序播放不完整问题）
    async playAudioQueue() {
        if (this.isPlaying || this.audioQueue.length === 0) {
            console.log(`播放队列检查: isPlaying=${this.isPlaying}, queueLength=${this.audioQueue.length}`);
            return;
        }

        this.isPlaying = true;
        // 播放开始，保持思考中状态直到全部播放完成
        $store.state.isAnswering = true;
        const base64Audio = this.audioQueue.shift();
        console.log(`开始播放音频，剩余队列长度: ${this.audioQueue.length}`);

        // 声明定时器变量在更大作用域
        let loadTimeout = null;
        let stuckCheckInterval = null;
        
        try {
            // 确保清理旧的上下文
            await this._cleanupCurrentAudio();

            const src = await this._createPlayableSrc(base64Audio);
            console.log(`音频源准备完成: ${src ? src.substring(0, 50) + '...' : 'null'}`);

            // 创建新的音频上下文
            const audioCtx = uni.createInnerAudioContext();
            audioCtx.autoplay = false;
            audioCtx.obeyMuteSwitch = true;
            this.currentAudioContext = audioCtx;

            // 设置音频源
            audioCtx.src = src;

            // 优化的事件处理机制
            let hasStartedPlaying = false;
            let playbackCompleted = false;
            let errorOccurred = false;
            let lastProgressTime = Date.now();
            let audioDuration = 0;
            let currentTime = 0;
            let isStuck = false;

            // 清理函数，避免重复代码
            const cleanup = () => {
                if (loadTimeout) {
                    clearTimeout(loadTimeout);
                    loadTimeout = null;
                }
                if (stuckCheckInterval) {
                    clearInterval(stuckCheckInterval);
                    stuckCheckInterval = null;
                }
            };

            // 加载超时保护（只针对加载阶段）
            loadTimeout = setTimeout(() => {
                if (!hasStartedPlaying && !errorOccurred) {
                    console.warn('音频加载超时，跳过当前音频');
                    cleanup();
                    this._handlePlaybackEnd(true);
                }
            }, 8000); // 8秒加载超时

            // 播放卡顿检测（独立于WebSocket状态）
            stuckCheckInterval = setInterval(() => {
                if (hasStartedPlaying && !playbackCompleted && !errorOccurred) {
                    const now = Date.now();
                    const timeSinceLastProgress = now - lastProgressTime;
                    
                    // WebSocket重连期间，给予更宽松的超时时间
                    const isWebSocketConnected = $store.state.isOhCardSocketOpen;
                    const timeoutThreshold = isWebSocketConnected ? 30000 : 45000; // WebSocket断开时给45秒
                    
                    if (!isWebSocketConnected) {
                        console.log('WebSocket重连中，延长音频超时检测时间');
                    }
                    
                    // 如果超过阈值时间没有进度更新，且不是因为音频很短
                    if (timeSinceLastProgress > timeoutThreshold && audioDuration > 15) {
                        console.warn(`音频播放卡住，无进度更新已${timeSinceLastProgress/1000}秒，跳过`);
                        console.log(`当前播放进度: ${currentTime}/${audioDuration}秒`);
                        cleanup();
                        this._handlePlaybackEnd(true);
                        return;
                    }
                    
                    // 如果音频总时长已知且播放时间远超预期（可能卡住了）
                    const durationThreshold = (audioDuration * 1000) + (isWebSocketConnected ? 15000 : 25000);
                    if (audioDuration > 0 && timeSinceLastProgress > durationThreshold) {
                        console.warn(`音频播放时间异常，预期${audioDuration}秒，已无响应${timeSinceLastProgress/1000}秒`);
                        cleanup();
                        this._handlePlaybackEnd(true);
                        return;
                    }
                }
            }, 5000); // 每5秒检查一次

            audioCtx.onCanplay(() => {
                console.log('音频准备就绪');
                if (loadTimeout) {
                    clearTimeout(loadTimeout);
                    loadTimeout = null;
                }
                // 尝试获取音频时长
                if (audioCtx.duration && audioCtx.duration > 0) {
                    audioDuration = audioCtx.duration;
                    console.log(`音频时长: ${audioDuration}秒`);
                }
            });

            audioCtx.onPlay(() => {
                console.log('音频开始播放');
                hasStartedPlaying = true;
                // 确保播放过程中为思考中
                $store.state.isAnswering = true;
                lastProgressTime = Date.now();
                if (loadTimeout) {
                    clearTimeout(loadTimeout);
                    loadTimeout = null;
                }
                // 再次尝试获取音频时长
                if (audioCtx.duration && audioCtx.duration > 0) {
                    audioDuration = audioCtx.duration;
                    console.log(`确认音频时长: ${audioDuration}秒`);
                }
            });

            audioCtx.onTimeUpdate(() => {
                // 更新播放进度和最后活动时间
                if (audioCtx.currentTime !== undefined) {
                    currentTime = audioCtx.currentTime;
                    lastProgressTime = Date.now();
                    
                    // 获取音频时长（如果之前没获取到）
                    if (audioDuration === 0 && audioCtx.duration && audioCtx.duration > 0) {
                        audioDuration = audioCtx.duration;
                        console.log(`通过TimeUpdate获取音频时长: ${audioDuration}秒`);
                    }
                    
                    // 每10秒输出一次进度日志
                    if (Math.floor(currentTime) % 10 === 0 && Math.floor(currentTime) !== Math.floor(currentTime - 1)) {
                        console.log(`播放进度: ${currentTime.toFixed(1)}/${audioDuration || '未知'}秒`);
                    }
                }
            });

            audioCtx.onEnded(() => {
                console.log('音频播放正常结束');
                if (!playbackCompleted) {
                    playbackCompleted = true;
                    cleanup();
                    this._handlePlaybackEnd(false);
                }
            });

            audioCtx.onError((err) => {
                console.error('音频播放错误:', err);
                
                // 特殊处理iOS微信小程序的常见错误
                if (err && err.errMsg && err.errMsg.includes('INNERERRCODE:-1100')) {
                    console.error('iOS微信小程序音频URL错误，可能是base64格式不支持');
                }
                
                if (!errorOccurred) {
                    errorOccurred = true;
                    cleanup();
                    // 错误时不重新加入队列，直接跳过
                    this._handlePlaybackEnd(true);
                }
            });

            audioCtx.onStop(() => {
                console.log('音频播放被停止');
                if (!playbackCompleted && !errorOccurred) {
                    cleanup();
                    this._handlePlaybackEnd(true);
                }
            });

            // 开始播放
            console.log('调用播放方法');
            audioCtx.play();

        } catch (error) {
            console.error('音频处理失败:', error);
            // 清理定时器
            if (loadTimeout) {
                clearTimeout(loadTimeout);
                loadTimeout = null;
            }
            if (stuckCheckInterval) {
                clearInterval(stuckCheckInterval);
                stuckCheckInterval = null;
            }
            this._handlePlaybackEnd(true);
        }
    },

    // 新增：清理当前音频的方法
    async _cleanupCurrentAudio() {
        if (this.currentAudioContext) {
            try {
                console.log('清理旧的音频上下文');
                // 移除所有事件监听器
                this.currentAudioContext.offCanplay && this.currentAudioContext.offCanplay();
                this.currentAudioContext.offPlay && this.currentAudioContext.offPlay();
                this.currentAudioContext.offEnded && this.currentAudioContext.offEnded();
                this.currentAudioContext.offError && this.currentAudioContext.offError();
                this.currentAudioContext.offStop && this.currentAudioContext.offStop();
                this.currentAudioContext.offTimeUpdate && this.currentAudioContext.offTimeUpdate();
                
                // 清理微信小程序的临时文件
                // #ifdef MP-WEIXIN
                if (this._currentTempFilePath) {
                    try {
                        const fileSystemManager = uni.getFileSystemManager();
                        fileSystemManager.unlinkSync(this._currentTempFilePath);
                        console.log('清理微信小程序临时音频文件:', this._currentTempFilePath);
                    } catch (e) {
                        console.warn('清理临时音频文件时出错:', e);
                    }
                    this._currentTempFilePath = null;
                }
                // #endif
                
                // 停止并销毁
                if (this.currentAudioContext.stop) {
                    this.currentAudioContext.stop();
                }
                if (this.currentAudioContext.destroy) {
                    this.currentAudioContext.destroy();
                }
            } catch (e) {
                console.warn('清理音频上下文时出错:', e);
            }
            this.currentAudioContext = null;
        }
    },

    // 新增：统一的播放结束处理
    _handlePlaybackEnd(isError = false) {
        console.log(`播放结束处理: isError=${isError}, 剩余队列=${this.audioQueue.length}`);
        
        this.isPlaying = false;
        
        // 清理当前音频上下文
        this._cleanupCurrentAudio();
        
        // 回收H5的blob url
        if (this._currentObjectUrl) {
            try { 
                URL.revokeObjectURL(this._currentObjectUrl); 
            } catch(e) {}
            this._currentObjectUrl = null;
        }
        
        // 继续播放队列中的下一个音频
        if (this.audioQueue.length > 0) {
            console.log(`继续播放下一个音频，队列剩余: ${this.audioQueue.length}`);
            // 检查WebSocket状态，如果重连中则等待
            const continuePlayback = () => {
                if (this.audioQueue.length > 0 && !this.isPlaying) {
                    this.playAudioQueue();
                }
            };
            
            // 如果WebSocket正在重连，等待一下再继续
            if (!$store.state.isOhCardSocketOpen && isReconnecting) {
                console.log('WebSocket重连中，延迟继续播放');
                setTimeout(continuePlayback, 1000);
            } else {
                setTimeout(continuePlayback, 200);
            }
        } else {
            console.log('音频队列播放完成');
            $store.state.isAnswering = false;
        }
    },

    async _createPlayableSrc(base64Audio) {
        // 分平台编译，避免在H5调用到小程序API
        // #ifdef APP-PLUS
        const base64WithPrefix = `data:audio/mp3;base64,${base64Audio}`;
        return await new Promise((resolve, reject) => {
            const fileName = `audio_${Date.now()}.mp3`;
            base64ToFile(base64WithPrefix, fileName, (path) => {
                if (path) resolve(path); else reject(new Error('App音频文件写入失败'));
            });
        });
        // #endif

        // #ifdef MP-WEIXIN
        // 微信小程序需要将base64转换为本地临时文件
        console.log('微信小程序转换base64为临时文件');
        return new Promise((resolve, reject) => {
            try {
                // 检查base64数据有效性
                if (!base64Audio || base64Audio.length === 0) {
                    throw new Error('base64音频数据为空');
                }
                
                // 获取文件系统管理器
                const fileSystemManager = uni.getFileSystemManager();
                const tempFilePath = `${wx.env.USER_DATA_PATH}/temp_audio_${Date.now()}.mp3`;
                
                // 将base64数据写入临时文件（使用异步方法更稳定）
                fileSystemManager.writeFile({
                    filePath: tempFilePath,
                    data: base64Audio,
                    encoding: 'base64',
                    success: (res) => {
                        console.log('微信小程序临时音频文件创建成功:', tempFilePath);
                        // 保存临时文件路径，用于后续清理
                        this._currentTempFilePath = tempFilePath;
                        resolve(tempFilePath);
                    },
                    fail: (error) => {
                        console.error('微信小程序写入音频文件失败:', error);
                        // 尝试同步方法作为备用
                        try {
                            fileSystemManager.writeFileSync(tempFilePath, base64Audio, 'base64');
                            console.log('微信小程序同步写入音频文件成功:', tempFilePath);
                            // 保存临时文件路径，用于后续清理
                            this._currentTempFilePath = tempFilePath;
                            resolve(tempFilePath);
                        } catch (syncError) {
                            console.error('微信小程序同步写入也失败:', syncError);
                            reject(new Error('微信小程序音频文件创建失败: ' + error.errMsg || error.message));
                        }
                    }
                });
            } catch (error) {
                console.error('微信小程序创建临时音频文件失败:', error);
                reject(new Error('微信小程序音频文件创建失败: ' + error.message));
            }
        });
        // #endif

        // #ifdef H5
        try {
            const byteString = atob(base64Audio);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], { type: 'audio/mpeg' });
            const objectUrl = URL.createObjectURL(blob);
            this._currentObjectUrl = objectUrl;
            return objectUrl;
        } catch (e) {
            return 'data:audio/mp3;base64,' + base64Audio;
        }
        // #endif
    },



    // 保留旧方法以兼容，但内部调用新的处理方法
    _teardownAfterPlayback() {
        this._handlePlaybackEnd(false);
    },

	// 添加音频到队列
	addToAudioQueue(base64Audio) {
		console.log('添加音频到队列，当前队列长度:', this.audioQueue.length);
		this.audioQueue.push(base64Audio);
		// 队列中有音频时，保持思考中
		$store.state.isAnswering = true;
		// 如果当前没有在播放，开始播放
		if (!this.isPlaying) {
			console.log('开始播放音频队列');
			this.playAudioQueue();
		}
	},

	// 防止音频播放被意外中断的方法
	preventAudioInterruption() {
		// 如果正在播放音频，不要设置isAnswering为false
		if (this.isPlaying || this.audioQueue.length > 0) {
			console.log('检测到音频正在播放，防止中断');
			return true;
		}
		return false;
	},

	// 获取音频播放状态
	getAudioStatus() {
		return {
			isPlaying: this.isPlaying,
			queueLength: this.audioQueue.length,
			hasAudioContext: !!this.currentAudioContext
		};
	},

	// 清理音频队列
    cleanupAudioQueue() {
        console.log('清理音频队列');
        
        // 清理当前音频上下文
        if (this.currentAudioContext) {
            try {
                // 移除所有事件监听器
                this.currentAudioContext.offCanplay && this.currentAudioContext.offCanplay();
                this.currentAudioContext.offEnded && this.currentAudioContext.offEnded();
                this.currentAudioContext.offError && this.currentAudioContext.offError();
                this.currentAudioContext.offStop && this.currentAudioContext.offStop();
                this.currentAudioContext.offTimeUpdate && this.currentAudioContext.offTimeUpdate();
                this.currentAudioContext.offPlay && this.currentAudioContext.offPlay();
                
                // 停止并销毁音频上下文
                if (this.currentAudioContext.stop) {
                    try { this.currentAudioContext.stop(); } catch(e) {}
                }
                if (this.currentAudioContext.destroy) {
                    try { this.currentAudioContext.destroy(); } catch(e) {}
                }
            } catch (e) {
                console.warn('清理音频上下文时出错:', e);
            }
            this.currentAudioContext = null;
        }
        
        // 清理H5的blob url
        if (this._currentObjectUrl) {
            try { 
                URL.revokeObjectURL(this._currentObjectUrl); 
            } catch(e) {
                console.warn('清理blob URL时出错:', e);
            }
            this._currentObjectUrl = null;
        }
        
        // 清空音频队列
        this.audioQueue = [];
        this.isPlaying = false;
        
        console.log('音频队列清理完成');
    },
}