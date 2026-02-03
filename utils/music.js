/**
 * 背景音乐播放控制工具
 * 支持循环播放音乐列表
 */

class MusicManager {
  constructor() {
    // 音乐URL数组
    this.musicList = [
      "https://ceping.qinglan.cn/uniapp/new/music/1.mp3",
      "https://ceping.qinglan.cn/uniapp/new/music/2.mp3",
      "https://ceping.qinglan.cn/uniapp/new/music/3.mp3"
    ];
    
    // 当前播放索引
    this.currentIndex = 0;
    
    // 音频实例
    this.audioContext = null;
    
    // 播放状态
    this.isPlaying = false;
    this.isPaused = false;
    
    // 音量（0-1）
    this.volume = 0.5;
    
    // 是否循环播放
    this.isLoop = true;
    
    // 是否已经有过用户交互
    this.hasUserInteracted = false;
    
    // 是否自动播放（在用户交互后）
    this.autoPlay = false;
    
    // 当前运行环境
    this.platform = this.getPlatform();
    
    // 强制控制是否允许播放
    this.forceEnable = false;
    
    this.init();
  }
  
  /**
   * 获取当前平台
   */
  getPlatform() {
    // #ifdef H5
    return 'h5';
    // #endif
    // #ifdef MP-WEIXIN
    return 'mp-weixin';
    // #endif
    // #ifdef MP
    return 'mp';
    // #endif
    // #ifdef APP-PLUS
    return 'app';
    // #endif
    return 'other';
  }
  
  /**
   * 初始化音频上下文
   */
  init() {
    this.audioContext = uni.createInnerAudioContext();
    this.audioContext.volume = this.volume;
    this.audioContext.loop = false; // 单曲不循环，由我们控制列表循环
    
    // 监听播放结束事件，自动播放下一首
    this.audioContext.onEnded(() => {
      if (this.isLoop) {
        this.next();
      }
    });
    
    // 监听播放错误
    this.audioContext.onError((err) => {
      console.error('音乐播放错误:', err);
      // 如果当前音乐播放失败，尝试播放下一首
      if (this.isLoop) {
        this.next();
      }
    });
    
    // 监听音乐加载完成
    this.audioContext.onCanplay(() => {
      console.log('音乐加载完成，可以播放');
    });
    
    // 设置初始音乐
    this.loadCurrentMusic();
  }
  
  /**
   * 加载当前音乐
   */
  loadCurrentMusic() {
    if (this.musicList.length > 0) {
      this.audioContext.src = this.musicList[this.currentIndex];
    }
  }
  
  /**
   * 播放音乐
   */
  play() {
    if (!this.forceEnable) {
      console.warn('当前被强制禁止播放音乐');
      return;
    }
    if (!this.audioContext) {
      this.init();
    }
    
    // 检查是否需要等待用户交互
    if (!this.hasUserInteracted) {
      this.autoPlay = true;
      console.log(`${this.platform}端等待用户交互后自动播放音乐`);
      return;
    }
    
    this.forcePlay();
  }
  
  /**
   * 强制播放音乐（绕过用户交互检查）
   */
  forcePlay() {
    if (!this.forceEnable) {
      console.warn('当前被强制禁止播放音乐');
      return;
    }
    if (!this.audioContext) {
      this.init();
    }
    
    console.log(`尝试强制播放音乐 [${this.platform}]: ${this.musicList[this.currentIndex]}`);
    
    try {
      this.audioContext.play();
      this.isPlaying = true;
      this.isPaused = false;
      console.log(`${this.platform}端音乐播放成功:`, this.musicList[this.currentIndex]);
    } catch (error) {
      console.error(`${this.platform}端音乐播放失败:`, error);
      // H5端如果还是失败，可能需要等待更明确的用户交互
      if (this.platform === 'h5') {
        console.warn('H5端播放失败，可能仍需要用户交互');
        this.hasUserInteracted = false; // 重置状态，等待下次用户交互
        this.autoPlay = true;
      }
    }
  }
  
  /**
   * 暂停音乐
   */
  pause() {
    if (this.audioContext && this.isPlaying) {
      this.audioContext.pause();
      this.isPlaying = false;
      this.isPaused = true;
      console.log('音乐已暂停');
    }
  }
  
  /**
   * 停止音乐
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.stop();
      this.isPlaying = false;
      this.isPaused = false;
      console.log('音乐已停止');
    }
  }
  
  /**
   * 播放下一首
   */
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.musicList.length;
    this.loadCurrentMusic();
    if (this.isPlaying || this.isPaused) {
      this.forcePlay();
    }
    console.log('切换到下一首:', this.musicList[this.currentIndex]);
  }
  
  /**
   * 播放上一首
   */
  prev() {
    this.currentIndex = this.currentIndex === 0 ? this.musicList.length - 1 : this.currentIndex - 1;
    this.loadCurrentMusic();
    if (this.isPlaying || this.isPaused) {
      this.forcePlay();
    }
    console.log('切换到上一首:', this.musicList[this.currentIndex]);
  }
  
  /**
   * 设置音量
   * @param {number} volume 音量值（0-1）
   */
  setVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.volume = volume;
      if (this.audioContext) {
        this.audioContext.volume = volume;
      }
      console.log('音量设置为:', volume);
    }
  }
  
  /**
   * 获取音量
   */
  getVolume() {
    return this.volume;
  }
  
  /**
   * 设置是否循环播放
   * @param {boolean} loop 是否循环
   */
  setLoop(loop) {
    this.isLoop = loop;
    console.log('循环播放设置为:', loop);
  }
  
  /**
   * 获取当前播放状态
   */
  getPlayState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentIndex: this.currentIndex,
      currentMusic: this.musicList[this.currentIndex],
      volume: this.volume,
      isLoop: this.isLoop,
      totalCount: this.musicList.length,
      hasUserInteracted: this.hasUserInteracted,
      autoPlay: this.autoPlay,
      platform: this.platform
    };
  }
  
  /**
   * 添加音乐到播放列表
   * @param {string} url 音乐URL
   */
  addMusic(url) {
    this.musicList.push(url);
    console.log('添加音乐:', url);
  }
  
  /**
   * 移除音乐
   * @param {number} index 音乐索引
   */
  removeMusic(index) {
    if (index >= 0 && index < this.musicList.length) {
      // 如果移除的是当前播放的音乐
      if (index === this.currentIndex) {
        this.stop();
        // 调整当前索引
        if (this.currentIndex >= this.musicList.length - 1) {
          this.currentIndex = 0;
        }
      } else if (index < this.currentIndex) {
        this.currentIndex--;
      }
      
      this.musicList.splice(index, 1);
      this.loadCurrentMusic();
      console.log('移除音乐，索引:', index);
    }
  }
  
  /**
   * 设置播放列表
   * @param {Array} musicList 音乐URL数组
   */
  setMusicList(musicList) {
    this.stop();
    this.musicList = musicList;
    this.currentIndex = 0;
    this.loadCurrentMusic();
    console.log('设置新的播放列表:', musicList);
  }
  
  /**
   * 获取播放列表
   */
  getMusicList() {
    return this.musicList;
  }
  
  /**
   * 播放指定索引的音乐
   * @param {number} index 音乐索引
   */
  playByIndex(index) {
    if (index >= 0 && index < this.musicList.length) {
      this.currentIndex = index;
      this.loadCurrentMusic();
      // 主动调用说明有用户交互，可以强制播放
      this.hasUserInteracted = true;
      this.forcePlay();
      console.log('播放指定音乐:', this.musicList[index]);
    }
  }
  
  /**
   * 处理用户交互事件
   * 在用户首次交互后可以播放音乐
   */
  handleUserInteraction() {
    console.log(`处理用户交互: platform=${this.platform}, hasUserInteracted=${this.hasUserInteracted}, autoPlay=${this.autoPlay}`);
    
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      console.log(`${this.platform}端检测到用户交互，音乐播放已启用`);
      
      // 如果之前设置了自动播放，现在可以播放了
      if (this.autoPlay) {
        this.autoPlay = false;
        console.log('开始自动播放音乐');
        this.forcePlay();
      }
    }
  }
  
  /**
   * 销毁音频实例
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.destroy();
      this.audioContext = null;
      this.isPlaying = false;
      this.isPaused = false;
      console.log('音频实例已销毁');
    }
  }

  /**
   * 设置强制允许播放
   * @param {boolean} enable
   */
  setForceEnable(enable) {
    this.forceEnable = !!enable;
    console.log('强制允许播放设置为:', this.forceEnable);
  }
}

// 创建全局音乐管理器实例
const musicManager = new MusicManager();

// 导出控制函数
export default {
  // 播放控制
  play: () => musicManager.play(),
  pause: () => musicManager.pause(),
  stop: () => musicManager.stop(),
  
  // 切换音乐
  next: () => musicManager.next(),
  prev: () => musicManager.prev(),
  playByIndex: (index) => musicManager.playByIndex(index),
  
  // 音量控制
  setVolume: (volume) => musicManager.setVolume(volume),
  getVolume: () => musicManager.getVolume(),
  
  // 循环设置
  setLoop: (loop) => musicManager.setLoop(loop),
  
  // 播放列表管理
  addMusic: (url) => musicManager.addMusic(url),
  removeMusic: (index) => musicManager.removeMusic(index),
  setMusicList: (musicList) => musicManager.setMusicList(musicList),
  getMusicList: () => musicManager.getMusicList(),
  
  // 状态获取
  getPlayState: () => musicManager.getPlayState(),
  
  // 销毁
  destroy: () => musicManager.destroy(),
  
  // 用户交互处理
  handleUserInteraction: () => musicManager.handleUserInteraction(),
  
  // 获取管理器实例（用于高级操作）
  getInstance: () => musicManager,

  // 强制允许播放
  setForceEnable: (enable) => musicManager.setForceEnable(enable)
}; 