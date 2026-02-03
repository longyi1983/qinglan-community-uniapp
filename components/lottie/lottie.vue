<template>
	<view class="lottie" @click="$emit('click')">
		<!-- #ifdef MP-WEIXIN || MP-TOUTIAO -->
		<canvas type="2d" :class="['wrapper', lottieId]" :style="style"></canvas>
		<!-- #endif -->
		<!-- #ifdef APP-PLUS -->
		<view class="wrapper" ref="lottieContainer" :style="style"></view>
		<view :prop="lottieOption" :callMethod="callMethod" :change:callMethod="Lottie.changeMethod"
			:change:prop="Lottie.update"></view>
		<!-- #endif -->
		<!-- #ifndef MP-WEIXIN || MP-TOUTIAO || APP-PLUS -->
		<view ref="lottieContainer" class="wrapper" :style="style"></view>
		<!-- #endif -->
	</view>
</template>

<script>
	// #ifdef MP-WEIXIN || MP-TOUTIAO
	import Lottie from "lottie-miniprogram";
	// #endif
	// #ifndef MP-WEIXIN || MP-TOUTIAO
	import Lottie from "lottie-web";
	// #endif

	/**
	 * Lottie动画组件
	 * 支持平台：H5、APP、微信小程序、抖音小程序
	 * 
	 * 在小程序平台（微信、抖音）使用canvas渲染
	 * 在H5和APP平台使用svg渲染
	 */
	export default {
		name: "lottie",

		props: {
			width: {
				type: [Number, String],
				default: 48,
			},

			height: {
				type: [Number, String],
				default: 48,
			},

			frames: {
				type: Object,
				required: true,
				default: undefined,
			},

			loop: {
				type: Boolean,
				default: true,
			},

			autoplay: {
				type: Boolean,
				default: true,
			},

			speed: {
				type: Number,
				default: 1,
			},

			isOnChange: {
				type: Boolean,
				default: false,
			},
		},

		emits: ['click', 'dataReady', 'dataFailed', 'complete', 'loopComplete', 'enterFrame', 'segmentStart'],

		data() {
			return {
				lottieId: `lottie-${Math.floor(Math.random() * 99999999)}`,
				// #ifdef APP-PLUS
				callMethod: {
					name: "play",
					args: []
				},
				lottieOption: null,
				// #endif
			};
		},

		computed: {
			style() {
				const style = {
					"--width": typeof this.width === "number" ? `${this.width}px` : this.width,
					"--height": typeof this.height === "number" ? `${this.height}px` : this.height,
				};

				return Object.keys(style)
					.map((key) => `${key}:${style[key]}`)
					.join("; ");
			},
		},

		watch: {
			frames: {
				handler(newVal) {
					// #ifdef APP-PLUS
					this.lottieOption = {
						path: newVal,
						loop: this.loop,
						autoplay: this.autoplay,
						speed: this.speed
					};
					// #endif
					// #ifndef APP-PLUS
					this.initialAni();
					// #endif
				},
				immediate: true
			},

			speed() {
				// #ifndef APP-PLUS
				this.setSpeed(this.speed);
				// #endif
			},
		},

		mounted() {
			// #ifndef APP-PLUS
			this.initialAni();
			// #endif
		},

		unmounted() {
			// #ifndef APP-PLUS
			if (!this.lottie) return;
			this.lottie.stop();
			this.lottie.destroy();
			// #endif
		},

		methods: {
			// #ifndef APP-PLUS
			async initialAni() {
				if (this.lottie) {
					this.lottie.destroy();
				}

				if (!this.frames) return;

				// #ifdef MP-WEIXIN || MP-TOUTIAO
				this.createSelectorQuery()
					.select("." + this.lottieId)
					.node((res) => {
						if (!res.node) {
							console.error('Canvas node not found for Lottie animation');
							return;
						}
						
						const canvas = res.node;
						canvas.width = parseInt(this.width)
						canvas.height = parseInt(this.height)

						try {
							Lottie.setup(canvas);
							
							this.launchLottie({
								renderer: "canvas",
								rendererSettings: {
									context: canvas.getContext('2d'),
								}
							})
						} catch (error) {
							console.error('Failed to setup Lottie animation:', error);
						}
					})
					.exec();
				// #endif
				// #ifndef MP-WEIXIN || MP-TOUTIAO
				this.launchLottie({
					renderer: "svg",
					container: this.$refs.lottieContainer.$el
				})
				// #endif
			},

			launchLottie(opts) {
				try {
					this.lottie = Lottie.loadAnimation({
						...opts,
						loop: this.loop,
						autoplay: this.autoplay,
						animationData: this.frames,
					});
					
					if (this.lottie) {
						this.lottie.setSpeed(this.speed);

						this.lottie.addEventListener('data_ready', (val) => {
							this.$emit('dataReady', val);
						});

						this.lottie.addEventListener('data_failed', (val) => {
							this.$emit('dataFailed', val);
						});

						this.lottie.addEventListener('complete', (val) => {
							this.$emit('complete', val);
						});

						this.lottie.addEventListener('loopComplete', (val) => {
							this.$emit('loopComplete', val);
						});

						if (this.isOnChange) {
							this.lottie.addEventListener('enterFrame', (val) => {
								this.$emit('enterFrame', val);
							});
						}

						this.lottie.addEventListener('segmentStart', (val) => {
							this.$emit('segmentStart', val);
						});
					}
				} catch (error) {
					console.error('Failed to launch Lottie animation:', error);
					this.$emit('dataFailed', error);
				}
			},
			// #endif

			// Common methods for both platforms
			play() {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'play')
				this.$set(this.callMethod, 'args', [])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.play();
				// #endif
			},

			stop() {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'stop')
				this.$set(this.callMethod, 'args', [])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.stop();
				// #endif
			},

			pause() {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'pause')
				this.$set(this.callMethod, 'args', [])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.pause();
				// #endif
			},

			setSpeed(speed) {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'setSpeed')
				this.$set(this.callMethod, 'args', [speed || 1])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.setSpeed(speed);
				// #endif
			},

			gotoAndStop(value, isFrame) {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'goToAndStop')
				this.$set(this.callMethod, 'args', [value, isFrame || false])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.goToAndStop(value, isFrame);
				// #endif
			},

			gotoAndPlay(value, isFrame) {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'goToAndPlay')
				this.$set(this.callMethod, 'args', [value, isFrame || false])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.goToAndPlay(value, isFrame);
				// #endif
			},

			setDirection(direction) {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'setDirection')
				this.$set(this.callMethod, 'args', [direction || 1])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.setDirection(direction);
				// #endif
			},

			playSegments(segments, forceFlag) {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'playSegments')
				this.$set(this.callMethod, 'args', [segments, forceFlag])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.playSegments(segments, forceFlag);
				// #endif
			},

			setSubframe(flag) {
				// #ifdef APP-PLUS
				this.$set(this.callMethod, 'name', 'setSubframe')
				this.$set(this.callMethod, 'args', [flag])
				// #endif
				// #ifndef APP-PLUS
				if (!this.lottie) return;
				this.lottie.setSubframe(flag);
				// #endif
			},

			// #ifdef APP-PLUS
			emitMsg(msg) {
				console.log('Emitting event:', msg.name, msg.params);
				this.$emit(msg.name, msg.params);
			},
			// #endif
		},
	};
</script>

<script module="Lottie" lang="renderjs">
	// #ifdef APP-PLUS
	import lottie from "lottie-web"

	export default {
		data() {
			return {
				lottieObj: null,
				isInitialized: false
			}
		},
		methods: {
			update(newVal) {
				if (newVal) {
					this.init(newVal);
				}
			},
			changeMethod(method) {
				try {
					if (!this.lottieObj || !this.isInitialized) {
						console.warn('Lottie not initialized yet');
						return;
					}
					this.lottieObj[method.name](...method.args);
				} catch (e) {
					console.error('Lottie method error:', e);
				}
			},
			isHttp(url) {
				return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(url)
			},
			init(newVal) {
				if (this.lottieObj) {
					this.lottieObj.destroy();
					this.isInitialized = false;
				}

				this.$nextTick(() => {
					try {
						this.lottieObj = lottie.loadAnimation({
							container: this.$refs.lottieContainer,
							renderer: 'svg',
							loop: (newVal.loop === undefined ? true : newVal.loop),
							autoplay: (newVal.autoplay === undefined ? true : newVal.autoplay),
							animationData: !this.isHttp(newVal.path) ? newVal.path : undefined,
							path: this.isHttp(newVal.path) ? newVal.path : undefined
						});

						// 添加事件监听
						this.lottieObj.addEventListener('complete', (evt) => {
							console.log('Animation complete event triggered');
							this.$ownerInstance.callMethod('emitMsg', {
								name: 'complete',
								params: evt
							});
						});

						this.lottieObj.addEventListener('loopComplete', (evt) => {
							this.$ownerInstance.callMethod('emitMsg', {
								name: 'loopComplete',
								params: evt
							});
						});

						this.lottieObj.addEventListener('enterFrame', (evt) => {
							this.$ownerInstance.callMethod('emitMsg', {
								name: 'enterFrame',
								params: evt
							});
						});

						this.lottieObj.addEventListener('segmentStart', (evt) => {
							this.$ownerInstance.callMethod('emitMsg', {
								name: 'segmentStart',
								params: evt
							});
						});

						this.lottieObj.addEventListener('data_ready', (evt) => {
							this.isInitialized = true;
							this.$ownerInstance.callMethod('emitMsg', {
								name: 'dataReady',
								params: evt
							});
						});

						this.lottieObj.addEventListener('data_failed', (evt) => {
							this.isInitialized = false;
							this.$ownerInstance.callMethod('emitMsg', {
								name: 'dataFailed',
								params: evt
							});
						});

						if (newVal.speed) {
							setTimeout(() => {
								if (this.lottieObj && this.isInitialized) {
									this.lottieObj.setSpeed(newVal.speed);
								}
							}, 150);
						}
					} catch (error) {
						console.error('Failed to initialize Lottie:', error);
						this.isInitialized = false;
					}
				});
			}
		},
		destroyed() {
			if (this.lottieObj) {
				this.lottieObj.destroy();
				this.isInitialized = false;
			}
		},
		mounted() {
			if (this.option) {
				this.init(this.option);
			}
		}
	}
	// #endif
</script>

<style scoped lang="scss">
	.lottie {
		display: inline-block;

		>.wrapper {
			width: var(--width);
			height: var(--height);
		}
	}
</style>