export default {
	list: [{
			"pagePath": "/main/index/index",
			"iconPath": "/static/tabbar/home-1.png",
			"selectedIconPath": "/static/tabbar/home.png",
			"text": "主页"
		},
		{
			"pagePath": "/main/community/community",
			"iconPath": "/static/tabbar/dynamics-1.png",
			"selectedIconPath": "/static/tabbar/dynamics.png",
			"text": "社区"
		},
		{
			iconPath: '/static/tabbar/add.png',
			selectedIconPath: '/static/tabbar/add.png',
			pagePath: '/pages/post/add?type=1',
			midButton: true,
			isCustom: true
		},
		{
			"pagePath": "/main/message/message",
			"iconPath": "/static/tabbar/msg-1.png",
			"selectedIconPath": "/static/tabbar/msg.png",
			"text": "消息"
		},
		{
			"pagePath": "/main/my/my",
			"iconPath": "/static/tabbar/my-1.png",
			"selectedIconPath": "/static/tabbar/my.png",
			"text": "我的"
		}
	],
	popup: [{
			icon: '/static/h_2.png',
			text: '动态',
			url: '/pages/post/add?type=1'
		},
		// {
		// 	icon: '/static/h_3.png',
		// 	text: '视频',
		// 	url: '/pages/post/add?type=2'
		// }
		// ,
		// {
		// 	icon: '/static/h_1.png',
		// 	text: '投票',
		// 	url: '/pages/vote/vote'
		// },
		// {
		// 	icon: '/static/article.png',
		// 	text: '长文',
		// 	url: '/subpages/content/article/add'
		// }
	]
}
