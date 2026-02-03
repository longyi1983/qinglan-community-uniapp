//铃声通知
export default{
	//播放系统提示音乐
	playSystemAudio(){
	    let music = null;
	    music = uni.createInnerAudioContext();
		//自己挑个好听的，这里我们为了减少前端压缩包大小共用一个声音资源
	    music.src = '/static/audio/message-notice.mp3';
	    music.play();
	    music.onEnded(()=>{music = null;})
	},
	//播放提示音
	playMessageAudio(){
	    let music = null;
	    music = uni.createInnerAudioContext();
	    music.src = '/static/audio/message-notice.mp3';
	    music.play();
	    music.onEnded(()=>{music = null;})
	}
}