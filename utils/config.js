const miniappName = "栖心港"; //站点标题用于分享时的标题
const shareH5Url = "https://h5.qinglan.com/#/"; //H5分享路径
const imgUrl = "https://ceping.qinglan.cn"; //你本地测试的接口地址
// const imgUrl = "https://ceping.qinglanxinqing.com"; //你本地测试的接口地址
//本地环境配置
// const baseUrl = "192.168.0.135:8080"; //你本地测试的接口地址
// const domain = 'http://' + baseUrl + "/app/"; //接口服务地址
// const websocketUrl = 'ws://'+baseUrl+'/app/socket/';//IM通信地址
// const websocketOhCard = 'ws://'+baseUrl+'/app/chatAI/';//Oh卡聊天地址
// const imfile = 'https://' + baseUrl + "/"; //IM文件资源地址
// const emojiUrl = 'https://demo.linfeng.tech/big/';//私聊表情包资源地址
// const imgResource = 'https://demo.linfeng.tech/resource';//用户端的图标等静态资源 换成自己的
// const wxMpAppId = "wx26e11861c4bd060a"; //微信公众号的AppID 不用公众号就不用填
// const wxh5Login = true; //是否使用微信公众号  不使用填false   使用填写true

// //线上环境配置 测试环境
// const baseUrl = "api.qinglanxinqing.com"; //你本地测试的接口地址
//线上环境配置 正式环境
const baseUrl = "api.qinglan.cn"; //你本地测试的接口地址

const domain = 'https://' + baseUrl + "/app/"; //接口服务
const websocketUrl = 'wss://' + baseUrl + '/app/socket/'; //IM通信地址
const websocketOhCard = 'wss://' + baseUrl + '/app/chatAI/'; //Oh卡聊天地址
const imfile = 'https://' + baseUrl + "/"; //IM文件资源地址
const emojiUrl = 'https://demo.linfeng.tech/big/'; //私聊表情包资源地址
const imgResource = 'https://demo.linfeng.tech/resource'; //用户端的图标等静态资源 换成自己的
const wxMpAppId = "wx26e11861c4bd060a"; //微信公众号的AppID 不用公众号就不用填
const wxh5Login = true; //是否使用微信公众号  不使用填false   使用填写true


export default {
	baseUrl: baseUrl,
	domain: domain,
	miniappName: miniappName,
	shareH5Url: shareH5Url,
	websocketUrl: websocketUrl,
	imfile: imfile,
	emojiUrl: emojiUrl,
	imgResource: imgResource,
	wxMpAppId: wxMpAppId,
	wxh5Login: wxh5Login,
	websocketOhCard: websocketOhCard,
	imgUrl:imgUrl
}