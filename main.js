import Vue from 'vue'
import App from './App'

import request from './utils/request.js'
Vue.prototype.$H = request;

// 挂载Vuex
import store from './store';
Vue.prototype.$store = store;

// config配置文件
import config from './utils/config.js';
Vue.prototype.$c = config;
Vue.prototype.$IMG = config.imgResource;
// 公共方法
import fun from './utils/function.js';
Vue.prototype.$f = fun;



import uView from "uview-ui";
Vue.use(uView);

import share from "@/utils/share.js"
// Vue.mixin(share)

let mpShare = require('uview-ui/libs/mixin/mpShare.js');
Vue.mixin(mpShare)

import toast from "./components/diy-loading/loading"
Vue.component('toast',toast)

function loading(tf){
	if(tf){
		store.commit("switch_loading",tf)
	}else{
		store.commit("switch_loading")
	}
}
Vue.prototype.$loading = loading;

Vue.config.productionTip = false

App.mpType = 'app'


//时间格式化

Vue.filter('timeFormat', function(data) { //data是接受的item.time

	if (typeof data === 'string') {
		// 处理后端传来的时间格式 "2025-07-08 10:01:54.0"
		// 去掉末尾的 .0，然后将 - 替换为 /
		data = data.replace(/\.\d+$/, ''); // 去掉末尾的 .0
		data = new Date(data.replace(/-/g, '/')).getTime();
	} else {
		if(!data){
			return
		}
		if (data.toString().length === 10) {
			data = new Date(data * 1000).getTime()
		} else {
			data = new Date(data).getTime()
		}
	}
	
	// 如果解析失败，返回错误提示
	if (isNaN(data)) {
		return "时间格式错误";
	}

	let result;
	let timePublish = new Date(data);
	let timeNow = new Date();
	let minute = 1000 * 60;
	let hour = minute * 60;
	let day = hour * 24;
	let month = day * 30;
	let year = month * 12;
	let diffValue = timeNow - timePublish;
	let diffMonth = diffValue / month;
	let diffWeek = diffValue / (7 * day);
	let diffDay = diffValue / day;
	let diffHour = diffValue / hour;
	let diffMinute = diffValue / minute;
	let diffYear = diffValue / year;
	if (diffValue < minute) {
		result = "刚刚";
	} else if (diffYear > 1) {
		result = parseInt(diffYear) + "年前";
	} else if (diffMonth > 1) {
		result = parseInt(diffMonth) + "月前";
	} else if (diffWeek > 1) {
		result = parseInt(diffWeek) + "周前";
	} else if (diffDay > 1) {
		result = parseInt(diffDay) + "天前";
	} else if (diffHour > 1) {
		result = parseInt(diffHour) + "小时前";
	} else if (diffMinute > 1) {
		result = parseInt(diffMinute) + "分钟前";
	} else {
		result = "刚刚";
	}
	return result;
})
//数字格式化
Vue.filter('numberFormat', function(number) {
	if (number > 9999 && number <= 99999) {
		return (number / 10000).toFixed(1) + 'w';
	} else if (number > 99999 && number <= 999999) {
		return (number / 10000).toFixed(1) + '0w';
	} else if (number >= 999999) {
		return "100w+";
	}
	return number;
})

const app = new Vue({
	store,
	...App
})
app.$mount()
