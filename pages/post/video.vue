<template>
	<view class="shortvideo">
		<view style="position: absolute;">
		<u-navbar :is-back="false" :border-bottom="false" :background="background">
			<u-icon name="search" :size="40" class="search-wrap" color="#fff" @click="toSearch"></u-icon>
			<u-tabs :list="pageTab" :current="pageCurrent" @change="pageTabChange" bg-color="" active-color="#fff" inactive-color="#afafaf"></u-tabs>
		</u-navbar>
		</view>
		<!-- #ifdef MP -->
		<swiper :style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000;'"
			:vertical="true" @animationfinish="animationfinish" @change="change" :current="current"
			:indicator-dots="false" @touchstart="mpTouchstart" @touchend="mpTouchend">
			<swiper-item v-for="(list,index) in dataList" :key="index">
				<view v-if="Math.abs(k-index)<=1">
					<view>
						<!-- 
						1.v-if：用于控制视频在节点的渲染数
						2.muted的默认值是 false，代表默认是禁音视频的
						3.http-cache默认开启视频缓存
						4.poster（封面（方案一））：这里的封面默认处理存储在阿里云的视频
						5.show-loading：这里默认去掉播放转圈的标志
						v-if="Math.abs(k-index)<=1"
						 -->
						 <!-- 七牛云存储 -->
						<video v-if="isShow" :id="list._id+''+index" :loop="true" :muted="list.isplay" :controls="false"
							:http-cache="true" :page-gesture="false" :show-fullscreen-btn="false" :show-loading="false"
							:show-center-play-btn="false" :enable-progress-gesture="false" :src="list.src"
							@ended="ended" @click="tapVideoHover(list.state,$event)"
							@timeupdate="timeupdate($event,index)"
							:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000; z-index: -1;'"
							:poster="list.src+'?vframe/jpg/offset/1'"></video>
						
						<!-- 阿里云存储 -->
						<!-- <video v-if="isShow" :id="list._id+''+index" :loop="true" :muted="list.isplay" :controls="false"
							:http-cache="true" :page-gesture="false" :show-fullscreen-btn="false" :show-loading="false"
							:show-center-play-btn="false" :enable-progress-gesture="false" :src="list.src"
							@ended="ended" @click="tapVideoHover(list.state,$event)"
							@timeupdate="timeupdate($event,index)"
							:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000; z-index: -1;'"
							:poster="list.src+'?x-oss-process=video/snapshot,t_100,f_jpg'"></video> -->
							
						<!-- 本地存储 -->
						<!-- <video v-if="isShow" :id="list._id+''+index" :loop="true" :muted="list.isplay" :controls="false"
							:http-cache="true" :page-gesture="false" :show-fullscreen-btn="false" :show-loading="false"
							:show-center-play-btn="false" :enable-progress-gesture="false" :src="list.src"
							@ended="ended" @click="tapVideoHover(list.state,$event)"
							@timeupdate="timeupdate($event,index)"
							:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000; z-index: -1;'"
							poster="../static/videoBg.jpg"></video> -->
						
					</view>
					<!-- 播放状态：pause 的时候就会暂停 -->
					<view class="videoHover" @click="tapVideoHover(list.state,$event)"
						:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'">
						<image v-if="list.state=='pause'" class="playState" src="../static/stop.png"></image>
					</view>

					<!-- 右侧栏目 -->
					<view class="tool-box">
						<navigator hover-class="none" :url="'/pages/user/home?uid=' + list.uid" class="item">
							<u-avatar :src="list.userInfo.avatar"></u-avatar>
						</navigator>
						<view class="item">
							<image v-show="list.isCollection" @click="cancelCollection" src="../static/fav-1.png">
							</image>
							<image v-show="!list.isCollection" @click="addCollection" src="../static/fav.png">
							</image>
							<text>{{ list.collectionCount }}</text>
						</view>
						<view class="item" @click="openCommentPop">
							<image src="../static/comment.png"></image>
							<text>{{ list.commentCount }}</text>
						</view>
						<!-- #ifdef MP -->
						<button open-type="share" class="u-reset-button item">
							<image src="../static/share.png"></image>
						</button>
						<!-- #endif -->
						<!-- #ifdef H5 -->
						<button class="u-reset-button item" @click="copyPageUrl">
							<image src="../static/share.png"></image>
						</button>
						<!-- #endif -->
					</view>

					<!-- 底部内容 -->
					<view class="footer">
						<navigator :url="'/pages/user/home?uid=' + list.uid" hover-class="none" class="username">
							@{{ list.userInfo.username }}</navigator>
						<view @click="openCommentPop">
							<text class="discuss-title" :data-id="list.discussId" v-if="list.discussId > 0"
								@tap.stop="toDiscuss">#{{ list.discussTitle }}</text>
							<text class="c-txt" @longpress="onCopy">{{ list.content | replace }}</text>
						</view>
					</view>
					<!-- 评论弹窗 -->
					<view>
						<view @click="onMask" v-show="commentPopup" class="mask"></view>
						<view v-show="commentPopup"  class="popup-wrap">
							<scroll-view scroll-y style="height: 45vh;" @scrolltolower="reachBottom">
								<view class="comment-box">
									<view class="title">评论（{{ list.commentCount }}）<text class="com">来自：</text><text class="topicName" @tap.stop="toTopic(list.topicId)">{{list.topicName}}</text></view>
									<u-line color="#eaeaea"></u-line>
									<!-- 帖子内容 -->
									<view class="comment-item" @longpress="onCopy">
										<image @click="jumpUser(list.userInfo.uid)" class="avatar"
											:src="list.userInfo.avatar"></image>
										<view class="c-content">
											<view class="user">
												<text>{{ list.userInfo.username }}</text>
												<text class="official">作者</text>
											</view>
											<view class="c-txt">
												<text class="discuss-title-comment" :data-id="list.discussId" v-if="list.discussId > 0"
													@tap.stop="toDiscuss">#{{ list.discussTitle }}</text>
												<text>{{ list.content }}</text>
											</view>
											<text class="time">{{ list.createTime | timeFormat }}</text>
										</view>
									</view>
									<u-line color="#f3f3f3"></u-line>
									<view style="margin-bottom: 40rpx;" v-for="(item, indexs) in commentList" :key="indexs">
										<!-- 评论列表 -->
										<view class="comment-item" @longpress="delComment(item, indexs)">
											<image @click="jumpUser(item.userInfo.uid)" class="avatar"
												:src="item.userInfo.avatar">
											</image>
											<view class="c-content" @click="onReply(item)">
												<view class="user">
													<text style="color: #999;">{{ item.userInfo.username }}</text>
													<block v-if="item.isThumbs">
														<view @click.stop="cancelThumbs(item.id, indexs)" class="thumbs">
															<text class="num">{{ item.thumbs }}</text>
															<u-icon class="icon" size="40" name="heart-fill"
																color="#e62e00"></u-icon>
														</view>
													</block>
													<block v-else>
														<view @click.stop="onThumbs(item.id, indexs)" class="thumbs">
															<text class="num">{{ item.thumbs }}</text>
															<u-icon class="icon" size="40" name="heart-fill"
																color="#bfbfbf"></u-icon>
														</view>
													</block>
												</view>
												<text class="c-txt">{{ item.content }}</text>
												<image style="width: 200rpx; margin-top: 20rpx; border-radius: 16rpx" mode="widthFix"
													v-if="item.img&&item.img !== ''" :src="item.img" @click.stop="commentPreviewImage(item.img)" />
												<text class="time">{{ item.createTime | timeFormat }}</text>
											</view>
										</view>
										<view @click="onReply(item2, indexs, index2)" v-if="item.children.length > 0"
											v-for="(item2, index2) in item.children" :key="item2.id"
											@longpress="delComment(item2, indexs, index2)" class="sub-comment-item">
											<view class="user">
												<u-avatar class="avatar" :size="40" :src="item2.userInfo.avatar"></u-avatar>
												<view class="u-head">
													<text style="color: #999;">{{ item2.userInfo.username }}</text>
													<block v-if="item2.isThumbs">
														<view class="thumbs"
															@click.stop="cancelThumbs(item2.id, indexs, index2)">
															<text class="num">{{ item2.thumbs }}</text>
															<u-icon class="icon" size="40" name="heart-fill"
																color="#e62e00"></u-icon>
														</view>
													</block>
													<block v-else>
														<view class="thumbs"
															@click.stop="onThumbs(item2.id, indexs, index2)">
															<text class="num">{{ item2.thumbs }}</text>
															<u-icon class="icon" size="40" name="heart-fill"
																color="#bfbfbf"></u-icon>
														</view>
													</block>
												</view>
											</view>
											<view class="reply">
												<view>
													<text>@</text>
													<navigator :url="'/pages/user/home?uid=' + item2.toUser.uid" hover-class="none"
														class="name">
														{{ item2.toUser.username }}
													</navigator>
													<text>：{{ item2.content }}</text>
												</view>
												<image style="width: 200rpx; margin-top: 20rpx; border-radius: 16rpx" mode="widthFix"
													v-if="item2.img&&item2.img !== ''" :src="item2.img" @click.stop="commentPreviewImage(item2.img)" />
												<view class="time">{{ item2.createTime | timeFormat }}</view>
											</view>
										</view>
										<view class="more-comment-btn" v-if="item.childrenCount>2 && item.showBtn"
											@click.stop="remainComment(item,index)">展开剩余回复</view>
										<u-line margin="40rpx 0 0 110rpx" length="85%"></u-line>
									</view>
									<!-- 加载状态 -->
									<block v-if="commentList.length > 0">
										<view style="margin: 30rpx;">
											<u-loadmore :status="loadStatus" />
										</view>
									</block>
									<block v-else>
										<u-empty text="暂无评论" mode="message"></u-empty>
									</block>
									<view style="height: 100rpx;"></view>
								</view>
							</scroll-view>
							<!-- 评论输入框 -->
							<view class="comment-tool">
								<view class="wrap">
									<view style="height: 60rpx; display: flex; align-items: center">
										<input ref="lfinput" type="text" :placeholder="placeholder" class="comment-input" @blur="onBlur" @focus="focusEvent" v-model="form.content" confirm-type="send" @confirm="addComment" />
										<image src="../static/images/img-icon.svg" style="width: 50rpx; height: 50rpx"
											@click="commentImgUpload"></image>
									</view>
									<u-button @click="addComment" :disabled="isSubmitD">
										发送
									</u-button>
								</view>
								<view v-if="commentTempImgUrl" class="img-wrap">
									<image :src="commentTempImgUrl" class="comment-img" />
									<view class="mask" @click="commentPreviewImage(commentTempImgUrl)">
										预览
									</view>
									<view class="del" @click="deleteTempImage">×</view>
								</view>
							</view>
						</view>
					</view>
					
					
					<!-- 进度条 -->
					<view v-if="k === index" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"
						:style="'width: '+ (windowWidth - (windowWidth*0.10)) +'px; margin-left: '+ (windowWidth * 0.05) +'px; height: 40px; position: absolute; bottom: 36px;'">
						<!-- 不拖动情况下 -->
						<view>
							<!-- 播放的进度条 -->
							<view v-if="!isTouch"
								:style="'width: '+ ((windowWidth - (windowWidth*0.10)) * progressBarPercent) +'px; position: absolute; margin-top: 18px; height: 5px; border-radius: 10px; background-color: #e6e4e7; '">
							</view>
							<!--  -->
							<view v-if="isTouch"
								:style="'width: '+ (videoStartPositon + addPositon) +'px; position: absolute; margin-top: 18px; height: 5px; border-radius: 10px; background-color: #e6e4e7; '">
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<swiper :style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000;'"
			:vertical="true" @animationfinish="animationfinish" @change="change" :current="current"
			:indicator-dots="false" :duration="duration">
			<swiper-item v-for="(list,index) in dataList" :key="index">
				<view v-if="Math.abs(k-index)<=1">
					<view>
						<!-- 
						1.v-if：用于控制视频在节点的渲染数
						2.muted的默认值是 false，代表默认是禁音视频的
						3.http-cache默认开启视频缓存
						4.poster（封面（方案一））：这里的封面默认处理存储在阿里云的视频
						5.show-loading：这里默认去掉播放转圈的标志
						v-if="Math.abs(k-index)<=1"
						 -->
						 <!-- 七牛云存储 -->
						<video v-if="isShow" :id="list._id+''+index" :loop="true" :muted="list.isplay" :controls="false"
							:http-cache="true" :page-gesture="false" :show-fullscreen-btn="false" :show-loading="false"
							:show-center-play-btn="false" :enable-progress-gesture="false" :src="list.src"
							@ended="ended" @click="tapVideoHover(list.state,$event)"
							@timeupdate="timeupdate($event,index)"
							:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000; z-index: -1;'"
							:poster="list.src+'?vframe/jpg/offset/1'"></video>
						<!-- 阿里云存储 -->
						<!-- <video v-if="isShow" :id="list._id+''+index" :loop="true" :muted="list.isplay" :controls="false"
							:http-cache="true" :page-gesture="false" :show-fullscreen-btn="false" :show-loading="false"
							:show-center-play-btn="false" :enable-progress-gesture="false" :src="list.src"
							@ended="ended" @click="tapVideoHover(list.state,$event)"
							@timeupdate="timeupdate($event,index)"
							:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000; z-index: -1;'"
							:poster="list.src+'?x-oss-process=video/snapshot,t_100,f_jpg'"></video> -->
							
						<!-- 本地存储 -->
						<!-- <video v-if="isShow" :id="list._id+''+index" :loop="true" :muted="list.isplay" :controls="false"
							:http-cache="true" :page-gesture="false" :show-fullscreen-btn="false" :show-loading="false"
							:show-center-play-btn="false" :enable-progress-gesture="false" :src="list.src"
							@ended="ended" @click="tapVideoHover(list.state,$event)"
							@timeupdate="timeupdate($event,index)"
							:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px; background-color: #000000; z-index: -1;'"
							poster="../static/videoBg.jpg"></video> -->
						
					</view>
					<!-- 播放状态：pause 的时候就会暂停 -->
					<view class="videoHover" @click="tapVideoHover(list.state,$event)"
						:style="'width: '+ windowWidth +'px; height: '+ windowHeight +'px;'">
						<image v-if="list.state=='pause'" class="playState" src="../static/stop.png"></image>
					</view>

					<!-- 右侧栏目 -->
					<view class="tool-box">
						<navigator hover-class="none" :url="'/pages/user/home?uid=' + list.uid" class="item">
							<u-avatar :src="list.userInfo.avatar"></u-avatar>
						</navigator>
						<view class="item">
							<image v-show="list.isCollection" @click="cancelCollection" src="../static/fav-1.png"></image>
							<image v-show="!list.isCollection" @click="addCollection" src="../static/fav.png"></image>
							<text>{{ list.collectionCount }}</text>
						</view>
						<view class="item" @click="openCommentPop">
							<image src="../static/comment.png"></image>
							<text>{{ list.commentCount }}</text>
						</view>
						<!-- #ifdef MP -->
						<button open-type="share" class="u-reset-button item">
							<image src="../static/share.png"></image>
						</button>
						<!-- #endif -->
						<!-- #ifdef H5 -->
						<button class="u-reset-button item" @click="copyPageUrl">
							<image src="../static/share.png"></image>
						</button>
						<!-- #endif -->
					</view>
					<!-- 底部内容 -->
					<view class="footer">
						<navigator :url="'/pages/user/home?uid=' + list.uid" hover-class="none" class="username">
							@{{ list.userInfo.username }}</navigator>
						<view @click="openCommentPop">
							<text class="discuss-title" :data-id="list.discussId" v-if="list.discussId > 0"
								@tap.stop="toDiscuss">#{{ list.discussTitle }}</text>
							<text class="c-txt" @longpress="onCopy">{{ list.content | replace }}</text>
						</view>
					</view>
					<!-- 评论弹窗 -->
					<lf-popup v-model="commentPopup" height="50vh">
						<scroll-view scroll-y style="height: 45vh;" @scrolltolower="reachBottom">
							<view class="comment-box">
								<view class="title">评论（{{ list.commentCount }}）<text class="com">来自：</text><text class="topicName" @tap.stop="toTopic(list.topicId)">{{list.topicName}}</text></view>
								<u-line color="#eaeaea"></u-line>
								<!-- 帖子内容 -->
								<view class="comment-item" @longpress="onCopy">
									<image @click="jumpUser(list.userInfo.uid)" class="avatar"
										:src="list.userInfo.avatar"></image>
									<view class="c-content">
										<view class="user">
											<text>{{ list.userInfo.username }}</text>
											<text class="official">作者</text>
										</view>
										<view class="c-txt">
											<text class="discuss-title-comment" :data-id="list.discussId" v-if="list.discussId > 0"
												@tap.stop="toDiscuss">#{{ list.discussTitle }}</text>
											<text>{{ list.content }}</text>
										</view>
										<text class="time">{{ list.createTime | timeFormat }}</text>
									</view>
								</view>
								<u-line color="#f3f3f3"></u-line>
								<view style="margin-bottom: 40rpx;" v-for="(item, index) in commentList" :key="index">
									<!-- 评论列表 -->
									<view class="comment-item" @longpress="delComment(item, index)">
										<image @click="jumpUser(item.userInfo.uid)" class="avatar" :src="item.userInfo.avatar">
										</image>
										<view class="c-content" @click="onReply(item)">
											<view class="user">
												<text style="color: #999;">{{ item.userInfo.username }}</text>
												<block v-if="item.isThumbs">
													<view @click.stop="cancelThumbs(item.id, index)" class="thumbs">
														<text class="num">{{ item.thumbs }}</text>
														<u-icon class="icon" size="40" name="heart-fill" color="#e62e00">
														</u-icon>
													</view>
												</block>
												<block v-else>
													<view @click.stop="onThumbs(item.id, index)" class="thumbs">
														<text class="num">{{ item.thumbs }}</text>
														<u-icon class="icon" size="40" name="heart-fill" color="#bfbfbf">
														</u-icon>
													</view>
												</block>
											</view>
											<text class="c-txt">{{ item.content }}</text>
											<image style="width: 200rpx; margin-top: 20rpx; border-radius: 16rpx" mode="widthFix"
												v-if="item.img&&item.img !== ''" :src="item.img" @click.stop="commentPreviewImage(item.img)" />
											<text class="time">{{ item.createTime | timeFormat }}</text>
										</view>
									</view>
									<view @click="onReply(item2, index, index2)" v-if="item.children.length > 0"
										v-for="(item2, index2) in item.children" :key="item2.id"
										@longpress="delComment(item2, index, index2)" class="sub-comment-item">
										<view class="user">
											<u-avatar class="avatar" :size="40" :src="item2.userInfo.avatar"></u-avatar>
											<view class="u-head">
												<text style="color: #999;">{{ item2.userInfo.username }}</text>
												<block v-if="item2.isThumbs">
													<view class="thumbs" @click.stop="cancelThumbs(item2.id, index, index2)">
														<text class="num">{{ item2.thumbs }}</text>
														<u-icon class="icon" size="40" name="heart-fill" color="#e62e00">
														</u-icon>
													</view>
												</block>
												<block v-else>
													<view class="thumbs" @click.stop="onThumbs(item2.id, index, index2)">
														<text class="num">{{ item2.thumbs }}</text>
														<u-icon class="icon" size="40" name="heart-fill" color="#bfbfbf">
														</u-icon>
													</view>
												</block>
											</view>
										</view>
										<view class="reply">
											<view>
												<text>@</text>
												<navigator :url="'/pages/user/home?uid=' + item2.toUser.uid" hover-class="none"
													class="name">
													{{ item2.toUser.username }}
												</navigator>
												<text>：{{ item2.content }}</text>
											</view>
											<image style="width: 200rpx; margin-top: 20rpx; border-radius: 16rpx" mode="widthFix"
												v-if="item2.img&&item2.img !== ''" :src="item2.img" @click.stop="commentPreviewImage(item2.img)" />
											<view class="time">{{ item2.createTime | timeFormat }}</view>
										</view>
									</view>
									<view class="more-comment-btn" v-if="item.childrenCount>2 && item.showBtn"
										@click.stop="remainComment(item,index)">展开剩余回复</view>
									<u-line margin="40rpx 0 0 110rpx" length="85%"></u-line>
								</view>
								<!-- 加载状态 -->
								<block v-if="commentList.length > 0">
									<view style="margin: 30rpx 30rpx 46rpx 30rpx;">
										<u-loadmore :status="loadStatus" />
									</view>
								</block>
								<block v-else>
									<u-empty text="暂无评论" mode="message"></u-empty>
								</block>
								<view style="height: 100rpx;"></view>
							</view>
						</scroll-view>
						<!-- 评论输入框 -->
						<view class="comment-tool">
							<view class="wrap">
								<view style="height: 60rpx; display: flex; align-items: center">
									<input ref="lfinput" type="text" :placeholder="placeholder" class="comment-input" @blur="onBlur" @focus="focusEvent" v-model="form.content" confirm-type="send" @confirm="addComment" />
									<image src="../static/images/img-icon.svg" style="width: 50rpx; height: 50rpx"
										@click="commentImgUpload"></image>
								</view>
								<u-button @click="addComment" :disabled="isSubmitD">
									发送
								</u-button>
							</view>
							<view v-if="commentTempImgUrl" class="img-wrap">
								<image :src="commentTempImgUrl" class="comment-img" />
								<view class="mask" @click="commentPreviewImage(commentTempImgUrl)">
									预览
								</view>
								<view class="del" @click="deleteTempImage">×</view>
							</view>
						</view>
					</lf-popup>
					<!-- 进度条 -->
					<view v-if="k === index" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"
						:style="'width: '+ (windowWidth - (windowWidth*0.10)) +'px; margin-left: '+ (windowWidth * 0.05) +'px; height: 40px; position: absolute; bottom: 36px;'">
						<!-- 不拖动情况下 -->
						<view>
							<!-- 播放的进度条 -->
							<view v-if="!isTouch"
								:style="'width: '+ ((windowWidth - (windowWidth*0.10)) * progressBarPercent) +'px; position: absolute; margin-top: 18px; height: 5px; border-radius: 10px; background-color: #e6e4e7; '">
							</view>
							<!--  -->
							<view v-if="isTouch"
								:style="'width: '+ (videoStartPositon + addPositon) +'px; position: absolute; margin-top: 18px; height: 5px; border-radius: 10px; background-color: #e6e4e7; '">
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
		<!-- #endif -->
		<!-- 底部导航栏 -->
		<view class="v-footer v-info s-around a-center">
			<text class="items" @click="goIndex">首页</text>
			<text class="items on">视频</text>
			<text class="items" @click="goMessage">消息</text>
			<text class="items" @click="goMine">我的</text>
		</view>
	</view>
</template>

<script>
	let audo = uni.createInnerAudioContext()
	audo.loop = true
	export default {
		data() {
			return {
				postDetail: {
					content: '',
					userInfo: {
						username: ''
					},
					createTime: '',
					commentCount: '',
					uid: ''
				},
				isSubmitD: false,
				commentPopup: false,
				commentList: [],
				focus: false,
				placeholder: '说点什么...',
				page: 1, //评论分页
				videoPage: 1, //视频分页
				form: {
					pid: 0,
					type: 1,
					toUid: '',
					postId: '',
					content: '',
					commentImg: ''
				},
				loadStatus: 'loadmore',
				background: {
					backgroundColor: '#070707',
				},
				postId: '',
				pageTab: [{
						name: '热门'
					},
					{
						name: '最新'
					}
				],
				pageCurrent: 0,
				commentTempImgUrl: '', // 评论图片
				tmpId:0,
				//插件部分=================
				windowWidth: 0,
				windowHeight: 0,
				platform: "",
				model: "",
				deleteHeight: 0,
				dataList: [],
				k: 0,
				oldVideo: "",
				voice: "",
				timeout: "",
				current: 0,
				boxStyle: { //视频，图片封面样式🌟💗
					'height': 0,
					'width': 0,
				},

				videoID: "",
				isShow: false,

				showPlay: false, //转轮显示控制
				rotates: 0, //转轮旋转角度
				rotateTime: "", //转轮递归事件控制
				xrotats: "",

				mpcleartime: "",

				isClick: false,

				changeTimeout: "",
				mptime: 0,
				mpstartTime: 0,

				duration: 500,
				// -- 进度条相关 -- start
				videoStartPositon: 0,
				progressBarPercent: 0,
				touchStartPosition: 0,
				addPositon: 0,
				timeduration: 0,
				isTouch: false,
				// -- 进度条相关 -- end
			}
		},
		filters: {
			replace(str) {
				str = str.replace(/\n/g, '');
				if (str.length > 17) {
					str = str.substring(0, 17) + '...';
				}

				return str;
			}
		},
		watch: {
			
			async k(k, old_k) {
				
				this.progressBarPercent = 0;
				// #ifndef MP
				this.clearToTime();
				// #endif
				this.isShow = false
				this.dataList[old_k].playIng = false //如果视频暂停，就加载封面
				this.dataList[old_k].isplay = true
				this.dataList[old_k].state = 'pause'
				// console.log('预留第' + (old_k + 1) + '个视频：' + this.dataList[old_k]._id + '' + old_k)
				// 2.0版本已经去掉了下面这一句，视频不用暂停，只需要把声音禁止就行
				uni.createVideoContext(this.dataList[old_k]._id + '' + old_k, this)
					.stop() //如果视频暂停，那么旧视频停止，这里的this.dataList[old_k]._id + '' + old_k，后面加 old_k 是为了每一个视频的 id 值不同，这样就可以大程度的避免串音问题
				// console.log('已经暂停 --> 第' + (old_k + 1) + '个视频～') //提示
				this.dataList[k].state = 'play'
				this.isShow = true
				this.xrotats = setTimeout(() => {
					this.showPlay = true;
					// #ifndef MP
					this.rotateX();
					// #endif
				}, 200)
				// #ifdef MP
				// 如果是小程序端
				clearTimeout(this.changeTimeout);
				this.dataList[k].isplay = false
				setTimeout(() => {
					this.dataList[k].playIng = true
				}, 250)
				if (this.mptime < 0.2) {
					this.changeTimeout = setTimeout(() => {
						uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play()
					}, 1400)
				} else {
					uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play()
				}
				// #endif
				// #ifdef H5
				this.dataList[k].isplay = true
				audo.src = this.dataList[k].src
				if (this.isClick) {
					setTimeout(() => {
						if (typeof WeixinJSBridge == "undefined") {
							setTimeout(() => {
								audo.play()
								uni.createVideoContext(this.dataList[k]._id + '' + k, this).seek(0)
								uni.createVideoContext(this.dataList[k]._id + '' + k, this).play()
								setTimeout(() => {
									this.dataList[k].playIng = true
								}, 650)
							}, 500)
						} else {
							WeixinJSBridge.invoke('getNetworkType', {}, e => {
								setTimeout(() => {
									audo.play()
									uni.createVideoContext(this.dataList[k]._id + '' + k, this)
										.seek(0)
									uni.createVideoContext(this.dataList[k]._id + '' + k, this)
										.play()
									setTimeout(() => {
										this.dataList[k].playIng = true
									}, 850)
								}, 200)
							})
						}
					}, 200)
				} else {
					audo.pause()
					this.dataList[k].state = 'pause'
					uni.createVideoContext(this.dataList[k]._id + '' + k, this).seek(0)
					uni.createVideoContext(this.dataList[k]._id + '' + k, this).pause()
				}
				// #endif
				var p = k + 1;
				// console.log('预加载第' + (p + 1) + '个视频：' + this.dataList[p]._id + '' + p)
			}
		},
		onLoad(options) {
			if(options.type){
				this.pageCurrent=options.type
			}
			if(options.id){
				this.tmpId=options.id
			}
			this.platform = uni.getSystemInfoSync().platform
			this.model = uni.getSystemInfoSync().model
			var model = this.model
			if (this.platform == 'ios' && (model !== 'iPhone6' || model !== 'iPhone6s' || model !== 'iPhone7' || model !==
					'iPhone8')) {
				this.deleteHeight = 0 //有 tabbar的 修改这里可以改变视频高度
			}
			this.windowWidth = uni.getSystemInfoSync().windowWidth
			this.windowHeight = uni.getSystemInfoSync().windowHeight
			this.boxStyle.width = this.windowWidth + 'px' //给宽度加px
			this.boxStyle.height = this.windowHeight - this.deleteHeight; //有 tabbar的 修改这里可以改变视频高度
			this.getShortVideoList()
			this.checkVideoOpen()
			// #ifndef MP
			this.rotateX();
			// #endif

		},
		onShow() {
			if (this.dataList.length !== 0) {
				// #ifdef MP
				this.dataList[this.k].state = 'play';
				uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play()
				// #endif
				// #ifdef H5
				if (this.isClick) {
					this.dataList[this.k].state = 'play';
					uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play()
					audo.play()
				}
				// #endif
			}
		},
		
		beforeDestroy() {
			
		    // #ifdef H5
		    if (this.isClick) {
		    	this.dataList[this.k].state = 'pause';
		    	uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).pause()
		    	audo.pause()
		    }
		    // #endif
		},
		onHide() {
			// #ifdef MP
			this.dataList[this.k].state = 'pause';
			uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).pause()
			// #endif
			// #ifdef H5
			if (this.isClick) {
				this.dataList[this.k].state = 'pause';
				uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).pause()
				audo.pause()
			}
			// #endif
		},
		methods: {
			toDiscuss(e) {
				uni.navigateTo({
					url: '/pages/discuss/detail?id=' + e.currentTarget.dataset.id
				});
			},
			toSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				});
			},
			goIndex() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			goMessage() {
				uni.switchTab({
					url: '/pages/message/message'
				})
			},
			goMine(){
				uni.switchTab({
					url: '/pages/my/my'
				})
			},
			toTopic(id){
				uni.navigateTo({
					url: '/pages/topic/detail?id='+id
				});
			},
			focusEvent(){},
			checkVideoOpen() {
				// #ifdef MP || H5
				this.$H.get('user/isOpen').then(res => {
					if (res.result == 0) {
						this.$f.toast("视频模块未开启")
						setTimeout(function() {
							uni.switchTab({
								url: '/pages/index/index'
							});
						}, 1500);
					}
				});
				// #endif
				// #ifdef APP-PLUS
				this.$f.toast("APP不存在短视频模块")
				setTimeout(function() {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}, 1000);
				// #endif
			},
			pageTabChange(index) {
				this.pageCurrent = index
				this.page = 1;
				this.dataList = []
				uni.redirectTo({
				    url: '/pages/post/video?type='+index
				});

			},
			mpTouchend() {
				this.mptime = (new Date() / 1000) - this.mpstartTime;
			},
			mpTouchstart() {
				this.mpstartTime = (new Date() / 1000);
			},

			clearToTime() {
				//清理定时器
				for (let i = 0; i < 20; i++) {
					clearTimeout(this.rotateTime);
					clearTimeout(this.xrotats);
					this.showPlay = false;
					this.rotates = 0;
				}
			},
			clearTime() {
				//清理定时器
				for (let i = 0; i < 20; i++) {
					clearTimeout(this.rotateTime);
					clearTimeout(this.xrotats);
				}
			},
			rotateX() {
				this.rotateTime = setTimeout(() => {
					this.rotateX();
					this.showPlay = true;
					this.rotates += 1;
				}, 30)
			},

			ended() {
				// 播放当前视频结束时触发，自动切换下一个视频
				// this.current = this.k+1
			},

			// ---- 进度条相关 --- start
			touchstart(e) {
				// console.log(e);
				this.isTouch = true;
				// #ifdef H5
				if (this.isClick) {
					this.addPositon = 0;
					this.videoStartPositon = (this.windowWidth - (this.windowWidth * 0.10)) * this.progressBarPercent;
					this.touchStartPosition = e.changedTouches[0].clientX;
				}
				// #endif
				// #ifdef MP
				this.addPositon = 0;
				this.videoStartPositon = (this.windowWidth - (this.windowWidth * 0.10)) * this.progressBarPercent;
				this.touchStartPosition = e.changedTouches[0].clientX;
				// #endif
			},
			touchmove(e) {
				// console.log(e);
				// #ifdef H5
				if (this.isClick) {
					let num = e.changedTouches[0].clientX - this.touchStartPosition;
					if ((this.videoStartPositon + num) <= (this.windowWidth - (this.windowWidth * 0.10))) {
						this.addPositon = e.changedTouches[0].clientX - this.touchStartPosition;
					} else {
						this.addPositon = 0;
						this.videoStartPositon = (this.windowWidth - (this.windowWidth * 0.10));
					}
				}
				// #endif
				// #ifdef MP
				let num = e.changedTouches[0].clientX - this.touchStartPosition;
				if ((this.videoStartPositon + num) <= (this.windowWidth - (this.windowWidth * 0.10))) {
					this.addPositon = e.changedTouches[0].clientX - this.touchStartPosition;
				} else {
					this.addPositon = 0;
					this.videoStartPositon = (this.windowWidth - (this.windowWidth * 0.10));
				}
				// #endif
			},
			touchend(e) {
				// #ifdef H5
				if (this.isClick) {
					let per = Number((this.videoStartPositon + this.addPositon) / (this.windowWidth - (this.windowWidth *
						0.10)));
					let timeSubmit = parseInt(this.timeduration * per)
					audo.seek(timeSubmit)
					audo.play()
					uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).seek(timeSubmit)
					uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play()
					this.dataList[this.k].state = 'play'
					setTimeout(() => {
						this.isTouch = false;
					}, 500)
				}
				// #endif
				// #ifdef MP
				let per = Number((this.videoStartPositon + this.addPositon) / (this.windowWidth - (this.windowWidth *
					0.10)));
				let timeSubmit = parseInt(this.timeduration * per)
				audo.seek(timeSubmit)
				audo.play()
				uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).seek(timeSubmit)
				uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play()
				setTimeout(() => {
					this.isTouch = false;
				}, 500)
				// #endif
			},
			timeupdate(event, index) {
				// 触发进度条更新
				// console.log(event,index);
				if (index === this.k) {
					this.timeduration = event.detail.duration;
					this.progressBarPercent = parseFloat(Number(event.detail.currentTime / event.detail.duration));
				}
			},
			// ---- 进度条相关 --- ending
			
			//点击播放&&暂停
			tapVideoHover(state, event) {
				// console.log('state--', state);
				if (state == 'play' || state == 'continue') {
					this.dataList[this.k].state = 'pause';
				} else {
					this.dataList[this.k].state = 'continue';
				}
				if (this.dataList[this.k].state == 'continue') {
					this.isClick = true;
					this.dataList[this.k].playIng = true
					uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).play(); //暂停以后继续播放
					// #ifdef MP
					this.dataList[this.k].isplay = false
					// #endif
					// #ifdef H5
					audo.play()
					// #endif
				}
				if (this.dataList[this.k].state == 'pause') {
					uni.createVideoContext(this.dataList[this.k]._id + '' + this.k, this).pause(); //暂停以后继续播放
					// #ifdef MP
					this.dataList[this.k].isplay = true
					// #endif
					// #ifdef H5
					audo.pause()
					// #endif
				}
			},
			change(event) {
				this.k = event.detail.current
				this.postId = this.dataList[this.k].id
				//切换视频后评论框全部关闭重置
				this.commentPopup = false
				this.commentList = []
				this.page=1
				this.addReadCount(this.postId)
			},
			addReadCount(id){
				this.$H
					.post('post/addReadCount', {
						postId: id
					}).then(res => {});
			},
			animationfinish(event) {
				// 1.这里进行判断，如果是最后一个视频就加载视频列表
				if (this.k == this.dataList.length - 1) {
					this.videoPage++;
					this.getVideo()
				}
			},
			//每一组结束时新的请求
			getVideo() {
				var that =this
				this.$H
					.post('post/videoList', {
						page: this.videoPage,
						order: this.pageCurrent
					})
					.then(res => {
						if (res.code == 0) {
							var videoDataList = res.result.data
							//url解密
							videoDataList.forEach(function(obj) {
							  obj.src = that.$f.decryptUrl(obj.src);
							});
							for (let i = 0; i < videoDataList.length; i++) {
								this.dataList.push(videoDataList[i])
							}
						}
					});
			},
			//初始化加载视频列表
			getShortVideoList() {
				var that =this
				this.$H
					.post('post/videoList', {
						page: this.videoPage,
						order: this.pageCurrent,
						postId: this.tmpId
					})
					.then(res => {
						if (res.code == 0) {
							this.tmpId=0;
							this.isShow = false;
							var videoDataList = res.result.data
							//url解密
							videoDataList.forEach(function(obj) {
							  obj.src = that.$f.decryptUrl(obj.src);
							});
							if(this.videoPage==1 && videoDataList.length === 0){
								this.$u.toast("视频不存在");
								setTimeout(function() {
									uni.switchTab({
										url: '/pages/index/index'
									});
								}, 1500);
							}
							// 2.这里把视频添加到视频列表
							for (let i = 0; i < videoDataList.length; i++) {
								this.dataList.push(videoDataList[i])
							}
							
							// 3.播放当前视频
							setTimeout(() => {
								this.isShow = true;
								// #ifdef H5
								this.dataList[this.k].isplay = true
								// #endif
								// #ifdef MP
								// 如果是小程序端
								this.dataList[this.k].isplay = false
								this.dataList[this.k].state = 'play'
								// #endif
								this.dataList[this.k].playIng = true
								setTimeout(() => {
									// #ifdef H5
									uni.createVideoContext(this.dataList[this.k]._id + '' +
										this.k, this).seek(0)
									uni.createVideoContext(this.dataList[this.k]._id + '' +
										this.k, this).pause()
									this.dataList[this.k].state = 'pause';
									audo.src = this.dataList[this.k].src;
									// #endif
									// #ifdef MP
									uni.createVideoContext(this.dataList[this.k]._id + '' +
										this.k, this).play()
									// #endif
								}, 500)
							}, 200)
							this.videoID = this.dataList[this.k]._id
						}
					});
			},
			openCommentPop() {
				this.commentPopup = true
				this.commentList = []
				this.page=1
				this.postId = this.dataList[this.k].id
				this.getCommentList()
			},
			onBack() {
				let pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack();
				} else {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}
			},
			// 删除评论
			delComment(e, index, index2) {
				let that = this;
				let user = uni.getStorageSync("userInfo");

				if (e.uid != user.uid) {
					return;
				}
				uni.showModal({
					title: '提示',
					content: '确定删除该评论？',
					success: function(res) {
						if (res.confirm) {
							that.$H
								.post('comment/del', {
									id: e.id
								})
								.then(res2 => {
									if (res2.code == 0) {
										if (index2 || index2 === 0) {
											that.commentList[index].children.splice(index2, 1);
										} else {
											that.commentList.splice(index, 1);
										}
									}
								});
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			onCopy() {
				let that = this;
				uni.setClipboardData({
					data: this.dataList[this.k].content,
					success: function() {
						uni.hideToast();
						that.$f.toast('复制成功', 'success');
					}
				});
			},
			copyPageUrl() {
				if(!this.postId){
					this.postId = this.dataList[this.k].id
				}
				let that = this;
				uni.setClipboardData({
					data: this.$c.shareH5Url + 'pages/post/video-detail?id=' + this.postId,
					success: function() {
						uni.hideToast();
						that.$f.toast('复制成功快分享给好友叭~', 'success');
						that.showShare = false;
					}
				});
			},
			// 评论触底
			reachBottom() {
				this.page++;
				this.getCommentList();
			},
			jumpUser(uid) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + uid
				});
			},
			// 点赞
			onThumbs(id, index, index2) {
				this.$H
					.post('comment/thumbs', {
						id: id
					})
					.then(res => {
						if (res.code == 0) {
							if (index2 || index2 == 0) {
								this.commentList[index].children[index2].isThumbs = true;
								this.commentList[index].children[index2].thumbs++;
							} else {
								this.commentList[index].isThumbs = true;
								this.commentList[index].thumbs++;
							}
						}
					});
			},
			// 取消点赞
			cancelThumbs(id, index, index2) {
				console.log(index + ',' + index2);
				this.$H
					.post('comment/cancelThumbs', {
						id: id
					})
					.then(res => {
						if (res.code == 0) {
							if (index2 || index2 == 0) {
								this.commentList[index].children[index2].isThumbs = false;
								this.commentList[index].children[index2].thumbs--;
							} else {
								this.commentList[index].isThumbs = false;
								this.commentList[index].thumbs--;
							}
						}
					});
			},
			// 回复评论
			onReply(e) {
				this.placeholder = '回复：' + e.userInfo.username;
				// this.focus = true;

				let pid = e.pid;
				if (pid === 0) {
					this.form.pid = e.id;
				} else {
					this.form.pid = e.pid;
				}

				this.form.toUid = e.userInfo.uid;
				this.form.postId = this.postId;
			},
			// 输入框失去焦点时
			onBlur() {
				this.placeholder = '说点什么...';
				this.focus = false;
				this.pid = 0;
			},
			// 获取评论列表
			getCommentList() {
				if(!this.postId){
					this.postId = this.dataList[this.k].id
				}
				this.loadStatus = 'loading';
				this.$H
					.get('comment/list', {
						postId: this.postId,
						page: this.page
					})
					.then(res => {
						if (res.code == 0) {
							this.commentList = this.commentList.concat(res.result.data);

							if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
								this.loadStatus = 'nomore';
							} else {
								this.loadStatus = 'loadmore';
							}
						}
					});
			},
			cancelCollection() {
				this.$H
					.post('post/cancelCollection', {
						id: this.postId
					})
					.then(res => {
						if (res.code === 0) {
							this.dataList[this.k].collectionCount--;
							this.dataList[this.k].isCollection = false;
						}
					});
			},
			addCollection() {
				if(!this.postId){
					this.postId = this.dataList[this.k].id
				}
				this.$H
					.post('post/addCollection', {
						id: this.postId,
						uid: this.dataList[this.k].uid
					})
					.then(res => {
						if (res.code === 0) {
							this.dataList[this.k].collectionCount++;
							this.dataList[this.k].isCollection = true;
						}
					});
			},
			//评论图片上传接口
			commentImgUpload() {
				let that = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album'],
					success: function(res) {
						uni.showLoading({
							mask: true,
							title: "上传中"
						})
						uni.uploadFile({
							url: that.$c.domain + 'common/upload',
							filePath: res.tempFilePaths[0],
							name: 'Image',
							header: {
								token: uni.getStorageSync("token")
							},
							success: (uploadFileRes) => {
								let data = JSON.parse(uploadFileRes.data)
								if (data.code == 0) {
									that.commentTempImgUrl = data.result
									that.form.commentImg = data.result
									uni.hideLoading();
								}
							}
						});
					}
				});
			},
			deleteTempImage() {
				this.commentTempImgUrl = ''
				this.form.commentImg = ''
			},
			commentPreviewImage(url) {
				uni.previewImage({
					urls: [url]
				})
			},
			addComment() {
				if(!this.postId){
					this.postId = this.dataList[this.k].id
				}
				
				this.isSubmitD = true;
				this.form.postId = this.postId;
				if (this.form.content == '') {
					this.$u.toast('评论不能为空');
					this.isSubmitD = false;
					return;
				}

				uni.showLoading({
					mask: true,
					title: '发布中'
				});

				this.$H.post('post/addComment', this.form).then(res => {
					uni.hideLoading();
					if (res.code == 0) {
						if (res.check) {
							uni.showModal({
								title: '提示',
								content: '评论审核通过后发布哦，请耐心等待',
								showCancel: false,
								success: function(res) {
									if (res.confirm) {}
								}
							});
						} else {
							this.$u.toast('评论成功');
						}
						this.form.content = '';
						this.page = 1;
						this.commentList = [];
						this.getCommentList();
					} else if (res.code == 500) {
						this.$u.toast(res.msg);
					}
					this.form.commentImg = '';
					this.commentTempImgUrl = '';
					this.pid = 0
					this.form.pid = 0
					this.isSubmitD = false;
					
				});
			},
			onMask() {
				this.commentPopup=false;
			},
			getPostDetail() {
				this.$H
					.get('post/detail', {
						id: this.postId
					})
					.then(res => {
					});
			},
			remainComment(item, index) {
				this.$H
					.get('comment/remainComment', {
						id: item.id
					})
					.then(res => {
						if (res.code == 0) {
							this.$set(this.commentList[index], 'children', this.commentList[index].children.concat(res
								.result));
							this.commentList[index].showBtn = false
						}
					});
			},
		},

		onShareAppMessage(res) {
			let imgURL;
			if(!this.postId){
				this.postId = this.dataList[this.k].id
			}
			return {
				title: this.dataList[this.k].content,
				path: '/pages/post/video-detail?id=' + this.postId
			};
		},
		onShareTimeline() {
			let imgURL;
			if(!this.postId){
				this.postId = this.dataList[this.k].id
			}
			return {
				title: this.dataList[this.k].content,
				query: 'id=' + this.postId
			};
		}

	}
</script>

<style lang="scss" scoped>
	.shortvideo {
		.videoHover {
			position: absolute;
			top: 0;
			left: 0;
			flex: 1;
			display: flex;
			background-color: rgba(0, 0, 0, 0.1);
			justify-content: center;
			align-items: center;

		}
		.playState {
			width: 160rpx;
			height: 160rpx;
			opacity: 0.2;
		}
		.video-content {
			width: 620rpx;
			z-index: 99;
			position: absolute;
			bottom: 60px;
			padding: 15rpx;
			flex-direction: column;
			justify-content: flex-start;
			color: #ffffff;
		}

		.video-userName {
			font-size: 30rpx;
			color: #ffffff;
			margin-top: 80upx;
		}

		.words {
			margin-top: 10rpx;
			font-size: 30rpx;
			color: #ffffff;
		}

		.root {
			background-color: #000000;
		}
	}



	.video_ {
		width: 100%;
		height: 100vh;
		display: block;
	}

	.tool-box {
		position: absolute;
		bottom: 164rpx;
		right: 30rpx;
		color: #fff;
		font-size: 24rpx;
		z-index: 99;

		.item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-bottom: 30rpx;

			.iconfont {
				font-size: 60rpx;
			}

			image {
				width: 50rpx;
				height: 50rpx;
			}
		}
	}

	/* 评论tool */
	.comment-tool {
		position: fixed;
		bottom: 100rpx;
		width: 100%;
		background-color: #fff;
		padding: 20rpx;
		display: flex;
		z-index: 999;
		.wrap {
			padding: 3px;
			padding-left: 10px;
			display: flex;
			background-color: #f5f5f5;
			border-radius: 20px;
		
			input {
				width: 480rpx !important;
			}
		}
		
		.img-wrap {
			// position: relative;
			position: absolute;
			bottom: 120rpx;
			width: 80rpx;
			height: 80rpx;
			margin: 20rpx;
			margin-bottom: 0;
			color: #fff;
		
			.comment-img {
				border-radius: 8rpx;
				width: 90rpx;
				height: 90rpx;
			}
		
			.mask {
				border-radius: 8rpx;
				z-index: 10;
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.2);
				font-size: 24rpx;
				display: flex;
				align-items: flex-end;
				justify-content: center;
			}
		
			.del {
				z-index: 10;
				position: absolute;
				right: -10rpx;
				top: -10rpx;
				width: 30rpx;
				height: 30rpx;
				border-radius: 30rpx;
				background-color: rgba(0, 0, 0, 0.5);
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24rpx;
			}
		}
	}

	.comment-tool textarea {
		padding: 20rpx;
		border-radius: 10rpx;
		min-height: 40rpx;
	}

	.comment-tool .u-btn {
		margin-left: 10rpx;
	}


	/*评论列表*/
	.comment-box {
		background-color: #ffffff;
		margin-top: 20rpx;
	}

	.comment-box>.title {
		margin: 20rpx;
	}

	.comment-item {
		display: flex;
		padding: 20rpx;

		&:active {
			background-color: #F5F5F5;
		}

		.c-content {
			display: flex;
			flex-direction: column;
			flex: 1;

			.time {
				color: #999;
				font-size: 10px;
			}

			.user {
				display: flex;

				.thumbs {
					margin-left: auto;
					display: flex;
					align-items: center;
					color: #bfbfbf;

					.num {
						margin-right: 10rpx;
					}
				}
			}
		}

		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}
	}

	.sub-comment-item {
		margin-left: 100rpx;
		padding: 20rpx;

		&:active {
			background-color: #F5F5F5;
		}

		.user {
			display: flex;
			align-items: center;

			.name {
				color: #616161;
			}

			.avatar {
				margin-right: 10rpx;
			}

			.u-head {
				flex: 1;
				display: flex;

				.thumbs {
					margin-left: auto;
					display: flex;
					align-items: center;
					color: #bfbfbf;

					.num {
						margin-right: 10rpx;
					}
				}
			}
		}

		.reply {
			.time {
				margin-left: auto;
				font-size: 20rpx;
				color: #999;
			}

			.name {
				display: inline-block;
				color: #2b85e4;
				font-weight: 600;
			}
		}
	}

	// 底部内容框
	.footer {
		position: absolute;
		bottom: 126rpx;
		width: 100%;
		color: #fff;
		padding: 20rpx;

		.username {
			margin-bottom: 20rpx;
			font-weight: 700;
			font-size: 38rpx;
		}
	}
	.search-wrap {
		margin-left: 20rpx;
		margin-right: 30%;
	}
	.v-footer {
		flex-direction: row;
		background-color: #4c4c4c;
		height: 96rpx;
		position: fixed;
		bottom: 0;
		z-index: 9;
		width: 750rpx;
		line-height: 100rpx;
	
		.items {
			position: relative;
			color: #999999;
			font-size: 30rpx;
	
			.cart {
				color: #999999;
				font-size: 30rpx;
			}
	
			&.on {
				color: #fff;
			}
		}
	}
	.v-info {
		display: -webkit-box;
		display: -moz-box;
		display: -webkit-flex;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-lines: multiple;
		-moz-box-lines: multiple;
		-o-box-lines: multiple;
		-webkit-flex-wrap: wrap;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap
	}
	.v-info.s-around {
		justify-content: space-around;
		-webkit-justify-content: space-around
	}
	.v-info.a-center {
		-webkit-box-align: center;
		-moz-box-align: center;
		-o-box-align: center;
		-ms-flex-align: center;
		-webkit-align-items: center;
		align-items: center
	}
	.discuss-title {
		font-size: 32rpx;
		color: #face15;
		margin-right: 10rpx;
	}
	.discuss-title-comment{
		font-size: 32rpx;
		color: #cd870b;
		margin-right: 10rpx;
	}
	.com {
		margin-left: 30rpx;
		font-size: 28rpx;
		color: #484848;
	}
	.topicName{
		font-weight: 600;
		margin-left: 6rpx;
		color: #676788;
	}
	.official {
		color: #fff;
		font-size: 21rpx;
		text-align: center;
		width: 50rpx;
		min-width: 50rpx;
		height: 30rpx;
		min-height: 30rpx;
		line-height: 30rpx;
		border-radius: 4rpx;
		background-image: linear-gradient(to right, #e69ba3, #e5666f);
		margin-left: 10rpx;
		margin-top: 14rpx;
	}
	.mask {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
		background-color: rgba(0, 0, 0, 0.3);
	}
	.popup-wrap {
		width: 100%;
		position: fixed;
		bottom: 0;
		background-color: #ffffff;
		animation-name: mymove;
		animation-duration: 0.3s;
		border-radius: 20rpx 20rpx 0 0;
		z-index: 998;
		height: 50vh;
	}
	
	@keyframes mymove {
		from {
			bottom: -50vh;
		}
		to {
			bottom: 0;
		}
	}
</style>