// 转换时间方法
function changeTime(data) { //data是接受的item.time
	if (typeof data === 'string') {
		// 处理后端传来的时间格式 "2025-07-08 10:01:54.0"
		// 去掉末尾的 .0，然后将 - 替换为 /
		data = data.replace(/\.\d+$/, ''); // 去掉末尾的 .0
		data = new Date(data.replace(/-/g, '/')).getTime();
	} else {
		// 修复变量名错误：应该是 data 而不是 time
		if (data.toString().length === 10) {
			data = new Date(data * 1000).getTime();
		} else {
			data = new Date(data).getTime();
		}
	}
	
	// 如果解析失败，返回错误提示
	if (isNaN(data)) {
		return "时间格式错误";
	}
	
	//将字符串转换成时间格式
	let result;
	let timePublish = new Date(data);
	let timeNow = new Date();
	let minute = 1000 * 60;
	let hour = minute * 60;
	let day = hour * 24;
	let month = day * 30;
	let year = month * 12;
	let diffValue = timeNow - timePublish;
	// console.log('diffValue:',diffValue)
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
		// let d = new Date(data).setHours(0, 0, 0, 0);
		// let today = new Date().setHours(0, 0, 0, 0);
		// let obj = {
		// 	'-86400000': '1天前',
		// 	0: '今天',
		// };
		// result = obj[d - today];
	} else if (diffMinute > 1) {
		result = parseInt(diffMinute) + "分钟前";
	} else {
		result = "刚刚";
	}
	return result;
}
module.exports = {
	changeTime: changeTime
}

