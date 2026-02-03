<template>
	<view>
		<view class="waterfall">
			<!-- 瀑布流左侧 -->
			<view class="post-list">
				<block v-for="(item, index) in leftList" :key="index">
					<view @click="jump(item)" v-if="(item.media && item.media.length > 0 && item.cut != 1) || item.type == 4">
						<view class="post-item">
							<view class="image-container" :style="{ paddingBottom: getAspectRatio(item) }">
								<image v-if="item.type == 1 || item.type == 3" :src="item.media[0]" mode="widthFix"
									class="basic-img" @load="(e) => onImageLoad(e, item)">
								</image>
								<image v-if="item.type == 4" src="/static/images/vote-cover.jpeg" mode="widthFix"
									class="basic-img"></image>
							</view>
							<view v-if="item.type == 2">
								<view class="video-wrap">
									<image class="cover-img" mode="aspectFill" v-if="item.cut == 1"
										:src="item.media[0]">
										<!-- 如果使用阿里云存储打开如下一行代码注释 -->
										<!-- <image class="cover-img" mode="aspectFill" v-else :src="item.media[0] + '?x-oss-process=video/snapshot,t_0,f_jpg'"> -->
										<!-- 如果使用七牛云存储打开如下一行代码注释 -->
										<image class="cover-img" mode="aspectFill" v-else
											:src="item.media[0] + '?vframe/jpg/offset/1'"></image>
										<!-- 如果使用本地存储打开如下一行代码注释 -->
										<!-- <image class="cover-img" mode="aspectFill" v-else  src="/static/play.png"></image> -->
								</view>
							</view>
							<view style="padding: 10rpx;">
								<view class="title" v-if="item.type != 4">
									<text>{{ item.title}}</text>
								</view>
								<view class="title" v-else>
									<text>{{ item.content}}</text>
								</view>
								<view style="display: flex;justify-content: space-between;">
									<view @click.stop="toUcenter(item.userInfo.uid)" class="userBox">
										<image style="width: 42rpx;height: 42rpx;border-radius: 21rpx;"
											:src="item.userInfo.avatar" mode=""></image>
										<text class="username">
											{{ item.userInfo.username.substring(0, 9) }}
										</text>
										<image style="height: 22rpx;margin-left:10rpx ;" mode="heightFix"
											v-if="item.userInfo.level"
											:src="$IMG+'/vip/level_'+item.userInfo.level+'.png'" class="level-img-2" />
									</view>
									<view style="display: flex;align-items: center;" v-if="item.isCollection"
										@click.stop="cancelCollectionLeft(item.id,index)">
										<u-icon name="heart-fill" color="#cc0000"></u-icon>
										<view style="font-size: 20rpx;margin-left: 10rpx;">
											{{ item.collectionCount }}
										</view>
									</view>
									<view style="display: flex;align-items: center;" v-if="!item.isCollection"
										@click.stop="addCollectionLeft(item.id,index)">
										<u-icon name="heart"></u-icon>
										<view style="font-size: 20rpx;margin-left: 10rpx;">
											{{ item.collectionCount }}
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
			<!-- 瀑布流右侧 -->
			<view class="post-list">
				<block v-for="(item, index) in rightList" :key="index">
					<view @click="jump(item)" v-if="(item.media && item.media.length > 0 && item.cut != 1) || item.type == 4">
						<view class="post-item">
							<view class="image-container" :style="{ paddingBottom: getAspectRatio(item) }">
								<image v-if="item.type == 1 || item.type == 3" :src="item.media[0]" mode="widthFix"
									class="basic-img" @load="(e) => onImageLoad(e, item)">
								</image>
								<image v-if="item.type == 4" src="/static/images/vote-cover.jpeg" mode="widthFix"
									class="basic-img">
								</image>
							</view>
							<view v-if="item.type == 2">
								<view class="video-wrap">
									<image class="cover-img" mode="aspectFill" v-if="item.cut == 1"
										:src="item.media[0]">
										<!-- 如果使用阿里云存储打开如下一行代码注释 -->
										<!-- <image class="cover-img" mode="aspectFill" v-else :src="item.media[0] + '?x-oss-process=video/snapshot,t_0,f_jpg'"> -->
										<!-- 如果使用七牛云存储打开如下一行代码注释 -->
										<image class="cover-img" mode="aspectFill" v-else
											:src="item.media[0] + '?vframe/jpg/offset/1'"></image>
										<!-- 如果使用本地存储打开如下一行代码注释 -->
										<!-- <image class="cover-img" mode="aspectFill" v-else  src="/static/play.png"></image> -->
								</view>
							</view>
							<view style="padding: 10rpx;">
								<view class="title" v-if="item.type != 4">
									<text>{{ item.title}}</text>
								</view>
								<view class="title" v-else>
									<text>{{ item.content}}</text>
								</view>
								<view style="display: flex;justify-content: space-between;">
									<view @click.stop="toUcenter(item.userInfo.uid)" class="userBox">
										<image style="width: 42rpx;height: 42rpx;border-radius: 21rpx;"
											:src="item.userInfo.avatar" mode=""></image>
										<text class="username">
											{{ item.userInfo.username.substring(0, 9) }}
										</text>
										<image style="height: 22rpx;margin-left:10rpx ;" mode="heightFix"
											v-if="item.userInfo.level"
											:src="$IMG+'/vip/level_'+item.userInfo.level+'.png'" class="level-img-2" />
									</view>
									<view style="display: flex;align-items: center;" v-if="item.isCollection"
										@click.stop="cancelCollectionRight(item.id,index)">
										<u-icon name="heart-fill" color="#cc0000"></u-icon>
										<view style="font-size: 20rpx;margin-left: 10rpx;">
											{{ item.collectionCount }}
										</view>
									</view>
									<view style="display: flex;align-items: center;" v-if="!item.isCollection"
										@click.stop="addCollectionRight(item.id,index)">
										<u-icon name="heart"></u-icon>
										<view style="font-size: 20rpx;margin-left: 10rpx;">
											{{ item.collectionCount }}
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
		</view>
		<!-- 加载状态 -->
		<view>
			<block v-if="dataList.length === 0 && loadStatus == 'nomore'">
				<u-empty margin-top="100" text="暂无内容" mode="favor"></u-empty>
			</block>
			<block v-else>
				<u-loadmore margin-bottom="50" margin-top="50" bg-color="#f5f5f5" :status="loadStatus" />
			</block>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'post-list-twice',
		props: {
			dataList: Array,
			loadStatus: {
				type: String,
				default: 'loading'
			},

		},
		computed: {
			info: function() {
				return this.dataList.filter((v, index) => 
					(v.media && v.media.length > 0 && v.cut != 1) || v.type == 4
				);
			},

			leftList: function() {
				return this.distributeItems(this.info)[0];
			},
			rightList: function() {
				return this.distributeItems(this.info)[1];
			}
		},
		data() {
			return {
				$IMG: this.$IMG,
				// 添加图片比例缓存
				imageRatios: {}
			}
		},
		methods: {
			// 获取图片宽高比
			getAspectRatio(item) {
				// 如果已经加载过这张图片，使用存储的实际比例
				if (this.imageRatios[item.id]) {
					return this.imageRatios[item.id];
				}

				// 未加载时的默认比例
				if (item.type === 2) { // 视频类型
					return '50%'; // 
				} else if (item.type === 4) { // 投票类型
					return '100%';
				} else { // 普通图片类型
					return '75%'; // 默认比例，可以根据实际情况调整
				}
			},

			// 图片加载完成后更新比例
			onImageLoad(e, item) {
				const {
					width,
					height
				} = e.detail;
				const ratio = (height / width * 100).toFixed(2) + '%';

				// 更新这个帖子的实际图片比例
				this.$set(this.imageRatios, item.id, ratio);

				// 触发重新渲染
				this.$forceUpdate();
			},

			distributeItems(items) {
				if (!items || items.length === 0) return [
					[],
					[]
				];

				const leftColumn = [];
				const rightColumn = [];

				items.forEach((item) => {
					if (this.getColumnHeight(leftColumn) <= this.getColumnHeight(rightColumn)) {
						leftColumn.push(item);
					} else {
						rightColumn.push(item);
					}
				});

				return [leftColumn, rightColumn];
			},

			getColumnHeight(column) {
				let totalHeight = 0;
				column.forEach(item => {
					// 基础高度（标题、用户信息等）
					let height = 150;

					if (item.media && item.media.length > 0) {
						// 获取图片容器的高度
						const width = 355; // 列宽
						const aspectRatio = parseFloat(this.getAspectRatio(item).replace('%', '')) / 100;
						height += width * aspectRatio;
					}

					totalHeight += height;
				});
				return totalHeight;
			},
			toUcenter(uid) {
				uni.navigateTo({
					url: '/pages/user/home?uid=' + uid
				})
			},
			jump(e) {
				let url;

				// 图文
				if (e.type == 1 || e.type == 4) {
					if (e.cut == 0) {
						url = '/pages/post/detail?id=' + e.id;
					} else {
						this.$H.post('post/getVipPostInfo', {
							postId: e.id
						}).then(res => {
							if (res.result.isBuy) {
								url = '/pages/post/detail?id=' + e.id;
							} else {
								url = '/pages/post/confirm?id=' + e.id + '&type=' + e.type;
							}
							uni.navigateTo({
								url: url
							})
						});
					}

				}
				//长文
				if (e.type == 3) {
					url = '/subpages/content/article/article?id=' + e.id;
				}

				//视频
				if (e.type == 2) {
					// #ifdef APP-PLUS
					if (e.cut == 0) {
						url = '/pages/post/detail?id=' + e.id;
					} else {
						this.$H.post('post/getVipPostInfo', {
							postId: e.id
						}).then(res => {
							if (res.result.isBuy) {
								url = '/pages/post/detail?id=' + e.id;
							} else {
								url = '/pages/post/confirm?id=' + e.id + '&type=' + e.type;
							}
							uni.navigateTo({
								url: url
							})
						});

					}
					// #endif
					// #ifndef APP-PLUS
					if (e.cut == 0) {
						url = '/pages/post/video-detail?id=' + e.id;
					} else {
						this.$H.post('post/getVipPostInfo', {
							postId: e.id
						}).then(res => {
							if (res.result.isBuy) {
								url = '/pages/post/video-detail?id=' + e.id;
							} else {
								url = '/pages/post/confirm?id=' + e.id + '&type=' + e.type;
							}
							uni.navigateTo({
								url: url
							})
						});

					}
					// #endif

				}

				uni.navigateTo({
					url: url
				})
			},
			cancelCollectionRight(id, index) {
				this.$H
					.post('post/cancelCollection', {
						id: id
					})
					.then(res => {
						if (res.code === 0) {
							this.rightList[index].isCollection = false;
							this.rightList[index].collectionCount--;
						}
					});
			},
			addCollectionRight(id, index) {
				this.$H
					.post('post/addCollection', {
						id: id,
						uid: this.rightList[index].uid
					})
					.then(res => {
						if (res.code === 0) {
							this.rightList[index].isCollection = true;
							this.rightList[index].collectionCount++;
						}
					});
			},
			cancelCollectionLeft(id, index) {
				this.$H
					.post('post/cancelCollection', {
						id: id
					})
					.then(res => {
						if (res.code === 0) {
							this.leftList[index].isCollection = false;
							this.leftList[index].collectionCount--;
						}
					});
			},
			addCollectionLeft(id, index) {
				this.$H
					.post('post/addCollection', {
						id: id,
						uid: this.rightList[index].uid
					})
					.then(res => {
						if (res.code === 0) {
							this.leftList[index].isCollection = true;
							this.leftList[index].collectionCount++;
						}
					});
			}

		}
	}
</script>

<style>
	page {
		background-color: #fafafa;
	}
</style>

<style lang="scss" scoped>
	.waterfall {
		display: flex;
	}

	.image-container {
		position: relative;
		width: 100%;
		background-color: #f5f5f5;
		overflow: hidden;
		transition: padding-bottom 0.3s ease; // 添加过渡效果

		.basic-img {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.post-list {
		width: 50%;
		display: flex;
		flex-direction: column;
		padding: 0 15rpx;

		.post-item {
			background: #fff;
			box-shadow: 0px 1px 10px rgba(189, 189, 189, 0.2);
			border-radius: c(9);
			width: 355rpx;
			margin: 4rpx 0;
			box-sizing: border-box;
			height: auto;
			transition: all 0.3s ease;

			.basic-img {
				width: 100%;
				display: block;
				height: auto;
				border-radius: 13rpx 13rpx 0 0;
				max-height: 700rpx;
			}

			border-radius: 13rpx 13rpx 13rpx 13rpx;

			.title {
				font-size: 32rpx;
				height: 70rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.avatar {
				width: 28rpx;
				height: 28rpx;
				flex: 0 0 28rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}

			.username {
				font-size: 20rpx;
				font-weight: 600;
				margin-left: 10rpx;
				max-width: 140rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	.userBox {
		display: flex;
		align-items: center;

		.username {
			height: 27rpx;
			line-height: 27rpx;
		}
	}

	.video-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		width: 100%;
		height: auto;
		border-radius: 13rpx 13rpx 0 0;
		
		.cover-img {
			width: 100%;
			height: 100%;
			position: relative;
			border-radius: 13rpx 13rpx 0 0;
			aspect-ratio: 4/3;
		}

		.icon {
			position: absolute;
			width: 100rpx;
			height: 100rpx;
			z-index: 999;
		}
	}
</style>