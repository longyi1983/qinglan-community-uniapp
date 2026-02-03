import config from './config.js';
import f from "@/utils/function.js"
export default {
	request(options = {}) {
		return new Promise((resolve, reject) => {
			let url = options.url;
			if (url.indexOf("http://") == -1 && url.indexOf("https://") == -1) {
				options.url = config.domain + url;
			}
			options.header.token = uni.getStorageSync("token");
			options.complete = (response) => {
				if (response.statusCode == 200 || response.statusCode == 0) {
					if (response.data.code == 401 || response.data.code == 420) {
						f.login();
					} else if (response.data.code == 500) {
						uni.showToast({
							title: response.data.msg,
							icon: "none",
							duration: 2000
						});
					} else if (response.data.code == 701) {
						//封号
						uni.showToast({
							title: response.data.msg,
							icon: "none",
							duration: 2000
						});
						uni.removeStorageSync("hasLogin");
						uni.removeStorageSync("token");
						uni.removeStorageSync("userInfo");
						uni.closeSocket();
						uni.switchTab({
							url: "/main/index/index"
						})
					} else if (response.data.code == 667) { // 先取消掉支付拦截 正确的code应该是666
						// 单项支付：跳转到支付页
						try {
							const amount = response.data.data; // 支付金额
							const pages = getCurrentPages();
							const page = pages && pages.length ? pages[pages.length - 1] : null;
							let route = page && page.route ? ('/' + page.route) : '';
							let productType = '';
							let productId = '';
							if (route.indexOf('/scale/result/result') !== -1 || route === '/scale/result/result') {
								productType = 1;
								productId = page && page.options && page.options.id ? page.options.id : '';
							}
							let url = `/main/pay/pay?price=${amount}`;
							if (productType !== '') url += `&productType=${productType}`;
							if (productId !== '') url += `&productId=${productId}`;
							uni.navigateTo({ url });
						} catch (e) {
							// 回退到最简支付跳转
							const amount = response.data.data;
							uni.navigateTo({ url: `/main/pay/pay?price=${amount}` });
						}
					} else if (response.data.code == 666) {
						// 留给各页面自行处理支付逻辑
					} else if (response.data.code == 410) {
						uni.showModal({
							title: '提示',
							content: '仅会员可用，请充值',
							showCancel: false,
							success: () => {
								uni.navigateTo({
									url: '/main/my/vip/vip'
								});
							}
						});
					} else if (response.data.code == 411) {
						uni.showModal({
							title: '提示',
							content: '该功能需要会员，是否领取三天免费体验会员？',
							success: (res) => {
								if (res.confirm) {
									uni.request({
										url: config.domain + '/qlReward/newUserRewards',
										method: 'GET',
										header: {
											token: uni.getStorageSync("token")
										},
										success: (res) => {
											if (res.data.code === 200) {
												uni.showToast({
													title: '领取成功,请重新操作',
													icon: 'success'
												});
												setTimeout(() => {
													// 获取当前页面的路径，并且刷新当前页面
													const page =
														getCurrentPages()[
														0];
													const vm = page.$vm;
													const options = page
														.options;
													console.log(11111111,
														options)
													// 调用页面方法
													// vm.init(options);
													// 返回上一页
													uni.navigateBack();
												}, 2000);
											} else {
												uni.showToast({
													title: res.data.msg ||
														'领取失败',
													icon: 'none'
												});
											}
										}
									});
								} else {
									uni.navigateBack();
								}
							}
						});
					}
					resolve(response.data)
				} else {
					uni.showToast({
						title: '请求异常',
						icon: "none"
					});
				}
			}

			uni.request(options)
		})
	},

	post(url, data = {}, header = {}) {

		let options = {
			url: url,
			data: data,
			header: header,
			method: "POST"
		}

		return this.request(options);
	},

	get(url, data = {}, header = {}) {
		let options = {
			url: url,
			data: data,
			header: header
		}

		return this.request(options);
	},

	delete(url, data = {}, header = {}) {
		let options = {
			url: url,
			data: data,
			header: header,
			method: "DELETE"
		}

		return this.request(options);
	},

	put(url, data = {}, header = {}) {
		let options = {
			url: url,
			data: data,
			header: header,
			method: "PUT"
		}

		return this.request(options);
	}
};