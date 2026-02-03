<template>
	<view>
		<view id="record" class="record" :listeningRecordingBegins="recordFlag"
			:change:listeningRecordingBegins="record.listeningRecordingBeginsHandler" :options="options"
			:change:options="record.optionsHandler">
		</view>
	</view>
</template>

<script>
import CryptoJS from 'crypto-js'
export default {
	data() {
		return {
			msg: '',
			recordFlag: null,
			scriptPath: '',
			stopEmitted: false,
			// #ifdef MP-WEIXIN
			mp: {
				recorder: null,
				socketTask: null,
				timer: null,
				secondsLeft: 0,
				status: 'CLOSED',
				resultText: '',
				resultTextTemp: '',
				// 基于sn的分片累积，避免重复
				resultSegments: {}, // { [sn: number]: string }
				resultOrder: [], // number[] 升序
				// 重连相关
				reconnectAttempts: 0,
				maxReconnectAttempts: 3,
				reconnectInterval: 2000, // 重连间隔（毫秒）
				connectionTimeout: 10000, // 连接超时时间（毫秒）
				connectionTimer: null, // 连接超时定时器
				isManualClose: false // 是否手动关闭
			}
			// #endif
		};
	},
	props: {
		options: {
			type: Object,
			default: () => {
				return {
					receordingDuration: 120,
					APPID: 'a53f7e7d',
					API_SECRET: 'NjFjZTNjZTAwNzkyYWMxMTZhNDFiYjcx',
					API_KEY: '009746aded79367ab274a1a767a191a3',
					// 重连配置
					maxReconnectAttempts: 3, // 最大重连次数
					reconnectInterval: 2000, // 重连间隔（毫秒）
					connectionTimeout: 10000 // 连接超时时间（毫秒）
				}
			}
		}
	},
	mounted() {
		// #ifdef MP-WEIXIN
		// 初始化录音器
		// @ts-ignore
		const wxRecorder = wx.getRecorderManager()
		this.mp.recorder = wxRecorder
		this._bindMpRecorderEvents()
		// 从options读取重连配置
		if (this.options.maxReconnectAttempts !== undefined) {
			this.mp.maxReconnectAttempts = this.options.maxReconnectAttempts
		}
		if (this.options.reconnectInterval !== undefined) {
			this.mp.reconnectInterval = this.options.reconnectInterval
		}
		if (this.options.connectionTimeout !== undefined) {
			this.mp.connectionTimeout = this.options.connectionTimeout
		}
		// #endif
	},

	methods: {
		start() {
			console.log(this.recordFlag);
			if (this.recordFlag == 'START') return
			this.recordFlag = 'START';
			this.stopEmitted = false;
			// #ifdef MP-WEIXIN
			this._mpStart();
			// #endif
		},
		end() {
			if (this.recordFlag == 'END') return
			this.recordFlag = 'END';
			this.stopEmitted = false;
			// #ifdef MP-WEIXIN
			this._mpEnd();
			// #endif
		},
		resultMsg(e) {
			// 避免重复回调：同样的文本不再次触发
			if (e === this.msg) return
			this.msg = e
			this.$emit('result', e)

		},
		endCallback(e) {
			//结束
			this.recordFlag = 'END';
			if (this.stopEmitted) return
			this.stopEmitted = true
			console.log("endCallback")
			this.$emit('onStop', e)
		},
		startCallback(e) {
			this.$emit('onOpen', e)
			console.log("startCallback")
		},
		seconds(e) {
			this.$emit('countDown', e)
			console.log("seconds")
		},
		change(e) {
			this.$emit('change', e)
			console.log("change webview")
		},

		// 以下为MP-WEIXIN专用实现
		// #ifdef MP-WEIXIN
		_bindMpRecorderEvents() {
			const rec = this.mp.recorder
			if (!rec) return
			rec.onStart(() => {
				if (this.mp.status !== 'CONNECTING') return
				this._changeMpStatus('OPEN')
				// 开始倒计时
				this._mpCountdown(this.options.receordingDuration || 60)
			})
			rec.onFrameRecorded(({ frameBuffer, isLastFrame }) => {
				// iOS可能会缓存上一轮的帧，这里当我们刚开始一次新会话时清空片段缓存，避免第二句话拼接第一句话
				if (this.mp.status === 'OPEN' && this.mp.resultOrder.length === 0 && this.mp.resultText) {
					this.mp.resultText = ''
					this.mp.resultTextTemp = ''
					this.mp.resultSegments = {}
				}
				const st = this.mp.socketTask
				if (!st) return
				const data = {
					data: {
						status: isLastFrame ? 2 : 1,
						format: 'audio/L16;rate=16000',
						encoding: 'raw',
						audio: this._mpToBase64(frameBuffer)
					}
				}
				try {
					st.send({ data: JSON.stringify(data) })
					if (isLastFrame) {
						this._changeMpStatus('CLOSING')
					}
				} catch (e) {
					console.error('send frame error', e)
				}
			})
			rec.onStop(() => {
				// 仅停止本地录音，不立即发出 CLOSED，等待服务端最终结果(status=2)后再关闭
				if (this.mp.timer) clearInterval(this.mp.timer)
			})
			rec.onError((err) => {
				console.error('recorder error', err)
				this._changeMpStatus('CLOSED')
				if (this.mp.socketTask) {
					try { this.mp.socketTask.close({ code: 1000 }) } catch (e) { }
				}
			})
		},
		_mpStart() {
			// 清除之前的连接超时定时器
			if (this.mp.connectionTimer) {
				clearTimeout(this.mp.connectionTimer)
				this.mp.connectionTimer = null
			}
			
			const url = this._mpGetWebSocketUrl()
			try {
				// 优先使用微信原生接口，避免某些版本uni返回的对象缺少实例事件方法
				// @ts-ignore
				const st = (typeof wx !== 'undefined' && typeof wx.connectSocket === 'function')
					// @ts-ignore
					? wx.connectSocket({ url })
					: uni.connectSocket({ url })
				this.mp.socketTask = st
			} catch (e) {
				console.error('connectSocket failed', e)
				this._mpHandleReconnect()
				return
			}
			
			// 设置连接超时检测
			this.mp.connectionTimer = setTimeout(() => {
				if (this.mp.status === 'CONNECTING') {
					console.warn('[ASR] 连接超时')
					if (this.mp.socketTask) {
						try { this.mp.socketTask.close({ code: 1000 }) } catch (e) { }
					}
					this._mpHandleReconnect()
				}
			}, this.mp.connectionTimeout)
			
			// 重置累计文本（仅首次连接时重置）
			if (this.mp.reconnectAttempts === 0) {
				this.mp.resultText = ''
				this.mp.resultTextTemp = ''
				this.mp.resultSegments = {}
				this.mp.resultOrder = []
				this.mp.isManualClose = false
			}
			
			this._changeMpStatus('CONNECTING')
			const st = this.mp.socketTask
			if (st && typeof st.onOpen === 'function') {
				st.onOpen(() => {
					console.log('[ASR] socket open')
					// 清除连接超时定时器
					if (this.mp.connectionTimer) {
						clearTimeout(this.mp.connectionTimer)
						this.mp.connectionTimer = null
					}
					// 重置重连次数
					this.mp.reconnectAttempts = 0
					
					const params = {
						common: { app_id: this.options.APPID },
						business: {
							language: 'zh_cn',
							domain: 'iat',
							accent: 'mandarin',
							vad_eos: 10000,
							dwa: 'wpgs'
						},
						data: { status: 0, format: 'audio/L16;rate=16000', encoding: 'raw' }
					}
					st.send({ data: JSON.stringify(params) })
					// 稍等片刻确保服务端就绪
					setTimeout(() => this._startMpRecording(), 50)
				})
				st.onMessage((res) => {
					console.log('[ASR] socket message', res && res.data)
					this._mpRenderResult(res.data)
				})
				st.onError((err) => {
					console.error('[ASR] socket error', err)
					if (!this.mp.isManualClose) {
						this._mpHandleReconnect()
					} else {
						this._mpCloseAll()
					}
				})
				st.onClose(() => {
					console.log('[ASR] socket close')
					if (!this.mp.isManualClose && this.mp.status !== 'CLOSED') {
						this._mpHandleReconnect()
					} else {
						this._mpCloseAll()
					}
				})
			} else {
				console.warn('SocketTask缺少实例事件方法，请确认使用的是微信基础库的connectSocket并在真机/预览环境测试')
			}
		},
		_startMpRecording() {
			const duration = (this.options.receordingDuration || 60) * 1000
			const recOptions = {
				duration,
				sampleRate: 16000,
				numberOfChannels: 1,
				// 讯飞IAT需要原始PCM 16k 单通道
				format: 'PCM',
				// 按KB计算，尽量接近H5端推荐的1280字节/帧（这里取2KB）
				frameSize: 2
			}
			try {
				this.mp.recorder.start(recOptions)
			} catch (e) {
				console.error('recorder start failed', e)
			}
			this._mpCountdown(this.options.receordingDuration || 60)
		},
		_mpEnd() {
			this.mp.isManualClose = true
			try { this.mp.recorder.stop() } catch (e) { }
			// 最后一帧已由onFrameRecorded的isLastFrame发送；若未触发则补发空帧通知结束
			try {
				if (this.mp.socketTask && typeof this.mp.socketTask.send === 'function') {
					const endData = {
						data: {
							status: 2,
							format: 'audio/L16;rate=16000',
							encoding: 'raw',
							audio: ''
						}
					}
					this.mp.socketTask.send({ data: JSON.stringify(endData) })
				}
			} catch (e) { }
			// 等待服务端最终返回后由onMessage->status=2触发关闭
		},
		_mpCloseAll() {
			try { this.mp.recorder.stop() } catch (e) { }
			// 若已是CLOSED状态则不重复
			if (this.mp.status !== 'CLOSED') this._changeMpStatus('CLOSED')
			if (this.mp.timer) clearInterval(this.mp.timer)
			if (this.mp.connectionTimer) {
				clearTimeout(this.mp.connectionTimer)
				this.mp.connectionTimer = null
			}
			// 重置重连次数
			this.mp.reconnectAttempts = 0
		},
		_mpHandleReconnect() {
			// 如果是手动关闭，不进行重连
			if (this.mp.isManualClose) {
				this._mpCloseAll()
				return
			}
			
			// 检查重连次数
			if (this.mp.reconnectAttempts >= this.mp.maxReconnectAttempts) {
				console.error('[ASR] 达到最大重连次数，停止重连')
				this.$emit('onError', { 
					msg: '连接失败，已达到最大重连次数', 
					attempts: this.mp.reconnectAttempts 
				})
				this._mpCloseAll()
				return
			}
			
			this.mp.reconnectAttempts++
			console.log(`[ASR] 正在尝试第 ${this.mp.reconnectAttempts} 次重连...`)
			
			this.$emit('onReconnect', { 
				msg: `正在尝试重连 (${this.mp.reconnectAttempts}/${this.mp.maxReconnectAttempts})`,
				attempts: this.mp.reconnectAttempts,
				maxAttempts: this.mp.maxReconnectAttempts
			})
			
			// 延迟后重新连接
			setTimeout(() => {
				if (!this.mp.isManualClose) {
					this._mpStart()
				}
			}, this.mp.reconnectInterval)
		},
		_mpGetWebSocketUrl() {
			let url = 'wss://iat-api.xfyun.cn/v2/iat'
			const host = 'iat-api.xfyun.cn'
			const apiKey = this.options.API_KEY
			const apiSecret = this.options.API_SECRET
			const date = new Date().toGMTString()
			const algorithm = 'hmac-sha256'
			const headers = 'host date request-line'
			const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
			const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
			const signature = CryptoJS.enc.Base64.stringify(signatureSha)
			const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
			// 小程序无 btoa，这里用CryptoJS编码
			const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
			url = `${url}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`
			return url
		},
		_mpToBase64(buffer) {
			// @ts-ignore
			if (typeof wx !== 'undefined' && wx.arrayBufferToBase64) {
				// @ts-ignore
				return wx.arrayBufferToBase64(buffer)
			}
			try {
				return uni.arrayBufferToBase64(buffer)
			} catch (e) {
				// 使用CryptoJS进行Base64编码
				try {
					const u8 = new Uint8Array(buffer)
					const words = []
					for (let i = 0; i < u8.length; i += 4) {
						words.push(((u8[i] << 24) | (u8[i + 1] << 16) | (u8[i + 2] << 8) | (u8[i + 3] || 0)) >>> 0)
					}
					const wa = CryptoJS.lib.WordArray.create(words, u8.length)
					return CryptoJS.enc.Base64.stringify(wa)
				} catch (e2) {
					console.error('arrayBuffer base64 failed', e2)
					return ''
				}
			}
		},
		_mpRenderResult(messageData) {
			let jsonData
			try {
				jsonData = typeof messageData === 'string' ? JSON.parse(messageData) : JSON.parse(messageData.data)
			} catch (e) {
				return
			}
			if (jsonData.data) {
				// 解析讯飞听写增量/覆盖策略，基于sn顺序去重累积
				const { result, status } = jsonData.data
				let hasResultUpdate = false
				if (result) {
					const ws = result.ws || []
					let frag = ''
					for (let i = 0; i < ws.length; i++) {
						const cw = ws[i].cw && ws[i].cw[0] ? ws[i].cw[0].w : ''
						frag += cw
					}

					const sn = typeof result.sn === 'number' ? result.sn : null
					const pgs = result.pgs // 'apd' | 'rpl' | undefined
					const rg = result.rg // [start, end] for rpl

					if (sn !== null) {
						if (pgs === 'rpl' && Array.isArray(rg) && rg.length === 2) {
							// 替换区间：删除区间内已有片段
							const [start, end] = rg
							this.mp.resultOrder = this.mp.resultOrder.filter(s => s < start || s > end)
							Object.keys(this.mp.resultSegments).forEach(k => {
								const num = Number(k)
								if (num >= start && num <= end) delete this.mp.resultSegments[k]
							})
						}
						// 写入/覆盖当前sn片段
						this.mp.resultSegments[sn] = frag
						if (!this.mp.resultOrder.includes(sn)) {
							this.mp.resultOrder.push(sn)
							this.mp.resultOrder.sort((a, b) => a - b)
						}
						
						// 重建完整文本
						let rebuilt = ''
						for (const s of this.mp.resultOrder) {
							rebuilt += (this.mp.resultSegments[s] || '')
						}
						this.mp.resultText = rebuilt
						hasResultUpdate = true
					} else {
						// 无sn兜底：直接累加（很少见）
						this.mp.resultText += frag
						hasResultUpdate = true
					}
				}
				// 若为最终结果，仅触发一次回调。
				if (jsonData.code === 0 && status === 2) {
					const finalText = this.mp.resultText || ''
					this.$emit('result', finalText)
					try { this.mp.socketTask && this.mp.socketTask.close({ code: 1000 }) } catch (e) { }
					this._changeMpStatus('CLOSED')
				} else if (hasResultUpdate) {
					// 非最终包的增量结果
					this.$emit('result', this.mp.resultText)
				}
			}
			if (jsonData.code !== 0) {
				try { this.mp.socketTask && this.mp.socketTask.close({ code: 1000 }) } catch (e) { }
			}
		},
		_changeMpStatus(status) {
			// 避免重复触发相同状态，尤其是 CLOSED 导致的 onStop 重复
			if (this.mp.status === status) return
			this.mp.status = status
			let msg = ''
			if (status === 'CONNECTING') {
				msg = '建立连接中'
				this.mp.resultText = ''
				this.mp.resultTextTemp = ''
			} else if (status === 'OPEN') {
				msg = '开始录音'
				this.$emit('onOpen', { status, msg })
			} else if (status === 'CLOSING') {
				msg = '关闭连接中'
			} else if (status === 'CLOSED') {
				msg = '录音已关闭'
				this.$emit('onStop', { status, msg })
			}
			this.$emit('change', { status, msg })
		},
		_mpCountdown(seconds) {
			if (this.mp.timer) clearInterval(this.mp.timer)
			this.$emit('countDown', seconds)
			this.mp.secondsLeft = seconds
			this.mp.timer = setInterval(() => {
				this.mp.secondsLeft -= 1
				if (this.mp.secondsLeft <= 0) {
					clearInterval(this.mp.timer)
					try { this.mp.recorder.stop() } catch (e) { }
					try { this.mp.socketTask && this.mp.socketTask.close({ code: 1000 }) } catch (e) { }
				} else {
					this.$emit('countDown', this.mp.secondsLeft)
				}
			}, 1000)
		}
		// #endif
	}
};
</script>

<script lang="renderjs" module="record">
	import CryptoJS from 'crypto-js';
	let APPID = "";
	let API_SECRET = "";
	let API_KEY = "";
	let receordingDuration = 120
	let ws = null;
	let resultText = "";
	let resultTextTemp = "";
	let timer = null;
	let tapeStatus = {
		CONNECTING: 'CONNECTING',
		OPEN: 'OPEN',
		CLOSING: 'CLOSING',
		CLOSED: 'CLOSED'
	}
	// 重连相关变量
	let reconnectAttempts = 0;
	let maxReconnectAttempts = 3;
	let reconnectInterval = 2000; // 重连间隔（毫秒）
	let connectionTimeout = 10000; // 连接超时时间（毫秒）
	let connectionTimer = null; // 连接超时定时器
	let isManualClose = false; // 是否手动关闭
	
	export default {
		data() {
			return {
				recorder: null,
				recorderPath: '',
			}
		},

		mounted() {
			//加载脚本
			this.loadScript();
		},

		methods: {
			listeningRecordingBeginsHandler(flag) {
				if (flag == null) return
				if (flag == 'START') {
					isManualClose = false
					reconnectAttempts = 0
					this.connectWebSocket()
				} else if (flag == 'END') {
					console.log("结束------");
					isManualClose = true
					// 仅停止录音，不立即关闭socket，等待服务端返回最终结果(status=2)再关闭
					if (this.recorder && typeof this.recorder.stop === 'function') {
						this.recorder.stop();
					}
				}
			},

			loadScript() {
				let path = null;
				// #ifdef APP
				path = 'file://' + plus.io.convertLocalFileSystemURL('/');
				// #endif
				// #ifdef H5
				path = "./"
				// #endif
				
				var recordScript = document.getElementById("recordScript");
				if (recordScript) {
					console.log('录音脚本已加载');
					// 脚本已存在，直接初始化 recorder
					if (typeof RecorderManager !== 'undefined') {
						if (!this.recorder) {
							this.recorder = new RecorderManager(path + 'static/dist')
							this.initListen()
						}
					} else {
						console.warn('RecorderManager 未定义，等待加载完成')
						// 如果 RecorderManager 还未定义，等待一小段时间后重试
						setTimeout(() => {
							if (typeof RecorderManager !== 'undefined' && !this.recorder) {
								this.recorder = new RecorderManager(path + 'static/dist')
								this.initListen()
							}
						}, 100)
					}
				} else {
					var script = document.createElement('script');
					script.id = 'recordScript'
					script.src = `static/dist/index.umd.js`;
					document.body.appendChild(script);

					script.onload = () => {
						this.recorder = new RecorderManager(path + 'static/dist')
						this.initListen()
					}
					script.onerror = (err) => {
						console.error('录音脚本加载失败:', err)
					}
				}

				//消息透传
				var uniewbview = document.getElementById("uniewbview");
				if (uniewbview) {
					console.log('有标签了');
				} else {
					var script = document.createElement('script');
					script.id = 'uniewbview'
					script.src = `static/dist/uni.webview.js`;
					document.body.appendChild(script);
				}


			},
			optionsHandler(options) {
				APPID = options.APPID
				API_SECRET = options.API_SECRET
				API_KEY = options.API_KEY
				receordingDuration = options.receordingDuration
				// 更新重连配置
				if (options.maxReconnectAttempts !== undefined) {
					maxReconnectAttempts = options.maxReconnectAttempts
				}
				if (options.reconnectInterval !== undefined) {
					reconnectInterval = options.reconnectInterval
				}
				if (options.connectionTimeout !== undefined) {
					connectionTimeout = options.connectionTimeout
				}
			},
			initListen() {
				if (!this.recorder) {
					console.error('录音器未初始化，无法绑定事件')
					return
				}
				
				this.recorder.onStart = () => {
					//判断是否已经关闭了，处理权限的异步处理
					if (ws.readyState != WebSocket.OPEN) {
						//代表已经关闭
						return;
					}
					this.changeStatus(tapeStatus.OPEN);
				}
				this.recorder.onFrameRecorded = ({
					isLastFrame,
					frameBuffer
				}) => {
					if (ws.readyState === ws.OPEN) {
						ws.send(
							JSON.stringify({
								data: {
									status: isLastFrame ? 2 : 1,
									format: "audio/L16;rate=16000",
									encoding: "raw",
									audio: this.toBase64(frameBuffer),
								},
							})
						);
						if (isLastFrame) {
							this.changeStatus("CLOSING");
						}
					}

				};
				this.recorder.onStop = () => {
					console.log("录音器关闭回调")
					// 不立即置为CLOSED，等待服务端最终包(status=2)后在onmessage->renderResult里关闭
					clearInterval(this.timer);
				};
			},

			closeAll() {
				console.log("关闭连接");
				if (this.recorder && typeof this.recorder.stop === 'function') {
					this.recorder.stop();
				}
				this.changeStatus(tapeStatus.CLOSED)
				if (connectionTimer) {
					clearTimeout(connectionTimer)
					connectionTimer = null
				}
				reconnectAttempts = 0
			},

			connectWebSocket() {
				// 清除之前的连接超时定时器
				if (connectionTimer) {
					clearTimeout(connectionTimer)
					connectionTimer = null
				}
				
				const websocketUrl = this.getWebSocketUrl();
				if ("WebSocket" in window) {
					ws = new WebSocket(websocketUrl);
				} else if ("MozWebSocket" in window) {
					ws = new MozWebSocket(websocketUrl);
				} else {
					console.log("不支持WebSocket");
					return;
				}
				
				// 设置连接超时检测
				connectionTimer = setTimeout(() => {
					if (ws && ws.readyState === WebSocket.CONNECTING) {
						console.warn('[ASR] 连接超时')
						ws.close()
						this.handleReconnect()
					}
				}, connectionTimeout)
				
				// 重置累计文本（仅首次连接时重置）
				if (reconnectAttempts === 0) {
					resultText = ""
					resultTextTemp = ""
				}
				
				this.changeStatus(tapeStatus.CONNECTING);
				ws.onopen = () => {
					console.log('[ASR] WebSocket连接成功')
					// 清除连接超时定时器
					if (connectionTimer) {
						clearTimeout(connectionTimer)
						connectionTimer = null
					}
					// 重置重连次数
					reconnectAttempts = 0
					
					const params = {
						common: {
							app_id: APPID,
						},
						business: {
							language: "zh_cn",
							domain: "iat",
							accent: "mandarin",
							vad_eos: 10000,
							dwa: "wpgs",
						},
						data: {
							status: 0,
							format: "audio/L16;rate=16000",
							encoding: "raw",
						}
					}
				ws.send(JSON.stringify(params));
				// 确认发送完握手参数后再启动录音，避免首帧丢失
				setTimeout(() => {
					if (this.recorder && typeof this.recorder.start === 'function') {
						this.recorder.start({
							sampleRate: 16000,
							frameSize: 1280,
						})
					} else {
						console.error('录音器未初始化或start方法不存在')
						this.handleReconnect()
					}
				}, 50)
				}
				ws.onmessage = (e) => {
					this.renderResult(e.data);
				};
				ws.onerror = (e) => {
					console.error('[ASR] WebSocket错误', e);
					if (!isManualClose) {
						this.handleReconnect()
					} else {
						this.closeAll()
					}
				};
				ws.onclose = (e) => {
					console.log('[ASR] WebSocket关闭', e);
					if (!isManualClose && e.code !== 1000) {
						this.handleReconnect()
					} else {
						this.closeAll()
					}
				};
			},
			getWebSocketUrl() {
				let url = "wss://iat-api.xfyun.cn/v2/iat";
				const host = "iat-api.xfyun.cn";
				const apiKey = API_KEY;
				const apiSecret = API_SECRET;
				const date = new Date().toGMTString();
				const algorithm = "hmac-sha256";
				const headers = "host date request-line";
				const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
				const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
				const signature = CryptoJS.enc.Base64.stringify(signatureSha);
				const authorizationOrigin =
					`api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
				const authorization = btoa(authorizationOrigin);
				url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
				return url;
			},
			toBase64(buffer) {
				let binary = "";
				const bytes = new Uint8Array(buffer);
				const len = bytes.byteLength;
				for (let i = 0; i < len; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				return window.btoa(binary);
			},
			renderResult(resultData) {
				let jsonData = JSON.parse(resultData);
				if (jsonData.data && jsonData.data.result) {
					let data = jsonData.data.result;
					let str = "";
					let ws = data.ws;
					for (let i = 0; i < ws.length; i++) {
						str = str + ws[i].cw[0].w;
					}
					if (data.pgs) {
						if (data.pgs === "apd") {
							resultText = resultTextTemp;
						}
						resultTextTemp = resultText + str;
					} else {
						resultText = resultText + str;
					}
					this.$ownerInstance.callMethod('resultMsg', resultTextTemp || resultText || '')
					webUni.postMessage({
						data: {
							func: 'result',
							data: resultTextTemp || resultText || ''
						}
					});
				}
				if (jsonData.code === 0 && jsonData.data.status === 2) {
					ws.close();
				}
				if (jsonData.code !== 0) {
					ws.close();
					console.error(jsonData);
				}
			},

			changeStatus(status) {
				let statusText = ''

				if (status === "CONNECTING") {
					statusText = '建立连接中'
					resultText = "";
					resultTextTemp = "";
				} else if (status === "OPEN") {
					statusText = '开始录音'
					this.$ownerInstance.callMethod('startCallback', {
						status,
						msg: statusText
					})
					webUni.postMessage({
						data: {
							func: 'onOpen',
							data: {
								status,
								msg: statusText
							}
						}
					});
					this.countdown();
				} else if (status === "CLOSING") {
					statusText = '关闭连接中'
				} else if (status === "CLOSED") {
					statusText = "录音已关闭";
					this.$ownerInstance.callMethod('endCallback', {
						status,
						msg: statusText
					})
					webUni.postMessage({
						data: {
							func: 'onStop',
							data: {
								status,
								msg: statusText
							}
						}
					});
				}
				this.$ownerInstance.callMethod('change', {
					status,
					msg: statusText
				})
				webUni.postMessage({
					data: {
						func: 'change',
						data: {
							status,
							msg: statusText
						}
					}
				});
			},
			countdown() {
				let seconds = receordingDuration
				let that = this;
				if (that.timer != null) {
					clearInterval(that.timer);
				}
				that.calltime(seconds, timer);
				that.timer = setInterval(() => {
					seconds = seconds - 1;
					that.calltime(seconds, timer);
				}, 1000);
			},

			calltime(seconds, timer) {
				if (seconds <= 0) {
					clearInterval(timer);
					if (this.recorder && typeof this.recorder.stop === 'function') {
						this.recorder.stop();
					}
				} else {
					this.$ownerInstance.callMethod('seconds', seconds)
					webUni.postMessage({
						data: {
							func: 'countDown',
							data: seconds
						}
					});
				}
			},
			
			handleReconnect() {
				// 如果是手动关闭，不进行重连
				if (isManualClose) {
					this.closeAll()
					return
				}
				
				// 检查重连次数
				if (reconnectAttempts >= maxReconnectAttempts) {
					console.error('[ASR] 达到最大重连次数，停止重连')
					this.$ownerInstance.callMethod('endCallback', {
						status: 'ERROR',
						msg: '连接失败，已达到最大重连次数'
					})
					webUni.postMessage({
						data: {
							func: 'onError',
							data: {
								msg: '连接失败，已达到最大重连次数',
								attempts: reconnectAttempts
							}
						}
					});
					this.closeAll()
					return
				}
				
				reconnectAttempts++
				console.log(`[ASR] 正在尝试第 ${reconnectAttempts} 次重连...`)
				
				// 通知组件正在重连
				this.$ownerInstance.callMethod('change', {
					status: 'RECONNECTING',
					msg: `正在尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`
				})
				webUni.postMessage({
					data: {
						func: 'onReconnect',
						data: {
							msg: `正在尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`,
							attempts: reconnectAttempts,
							maxAttempts: maxReconnectAttempts
						}
					}
				});
				
				// 延迟后重新连接
				setTimeout(() => {
					if (!isManualClose) {
						this.connectWebSocket()
					}
				}, reconnectInterval)
			}

		}

	}
</script>
<style></style>