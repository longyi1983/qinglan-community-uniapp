<template>
	<view class="grade">
		<view class="top">
			<image class="line" :src="$IMG+'/level/arc.png'">
				<view class="num">
					<view v-if="userInfo.level>1">
						<image :src="$IMG+'/level/grade.png'">
							<text>{{userInfo.level-1}}</text>
					</view>
					<view v-else>
						
					</view>
					<view>
						<image :src="$IMG+'/level/grade.png'">
							<text>{{userInfo.level}}</text>
					</view>
					<view v-if="userInfo.level<lastLevelId">
						<image :src="$IMG+'/level/grade.png'">
							<text>{{userInfo.level+1}}</text>
					</view>
					<view v-else>
						
					</view>
				</view>
				<view class="numerical">
					<view class="experience">
						<text class="pre">当前经验值</text>
						<image :src="$IMG+'/level/ring.png'">
							<text class="expNum">{{userInfo.integral}}</text>
					</view>
					<view class="differ" v-if="needCount>0">
						<text style="color: #fff;">距离下一等级还差{{needCount}}经验</text>
					</view>
					<view class="differ" v-else>
						<text style="color: #fff;">您已到达最高等级啦！</text>
					</view>
				</view>
		</view>
		<view class="cont">
			<view class="people">
				<view class="image">
					<image :src="userInfo.avatar">
						<view></view>
				</view>
				<view class="text">
					<text>{{userInfo.username}}</text>
					<text>Lv.{{userInfo.level}}</text>
				</view>
				<view class="money">
					<text>{{userInfo.integral}}</text>
					<text>积分数量</text>
				</view>
			</view>
			<view class="experience">
				<text class="title">经验值</text>
				<u-line-progress :percent="percentage" :round="true" active-color="#A47EFF"
					:striped-active="true"></u-line-progress>
				<view class="number">
					<text>Lv.{{userInfo.level}}</text>
					<text>经验值:{{userInfo.integral}}/{{needCount+userInfo.integral}}</text>
					<text v-if="needCount>0">Lv.{{userInfo.level+1}}</text>
				</view>
			</view>
			<view class="task">
				<text class="title">成长任务</text>
				<text class="text">快速提升经验等级的方法</text>
				<view class="invitation">
					<view class="item">
						<view class="icon">
							<image :src="$IMG+'/level/grade1.png'">
						</view>
						<view class="cent">
							<text>发布贴子</text>
							<text>发布帖子领取积分奖励</text>
						</view>
						<view class="complete" @click="jump('/pages/post/add?type=1')">
							<text>去发帖</text>
						</view>
					</view>
					<view class="item">
						<view class="icon">
							<image :src="$IMG+'/img/yel-sign.png'">
						</view>
						<view class="cent">
							<text>积分签到</text>
							<text>连续签到奖励更多</text>
						</view>
						<view class="complete" @click="jump('/pages/sign/sign')">
							<text>去签到</text>
						</view>
					</view>
					<view class="item" v-if="isOpen">
						<view class="icon">
							<image :src="$IMG+'/level/list1.png'">
						</view>
						<view class="cent">
							<text>成为会员</text>
							<text>积分奖励翻倍</text>
						</view>
						<view class="complete" @click="jump('/pages/user/vip/vip')">
							<text>去充值</text>
						</view>
					</view>
					<view class="item">
						<view class="icon">
							<image :src="$IMG+'/level/choujiang.png'">
						</view>
						<view class="cent">
							<text>积分抽奖</text>
							<text>有机会获得积分奖励</text>
						</view>
						<view class="complete" @click="jump('/pages/luck-draw/luck-draw')">
							<text>去抽奖</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				$IMG: this.$IMG,
				percentage: 0,
				userInfo: {},
				needCount: 0,
				lastLevelId: 5,
				isOpen:false,
				isIphone: getApp().globalData.iphone
			}
		},
		onLoad() {
			this.getUserInfo();
			this.getLevelInfo();
			this.getSysInfo();
		},
		methods: {
			getUserInfo() {
				this.$H.get('user/userInfo').then(res => {
					this.userInfo = res.result;
				});
			},
			getLevelInfo() {
				uni.showLoading({
					title: "加载中"
				})
				this.$H.get('user/getUserLevelInfo').then(res => {
					if (res.code == 0) {
						this.needCount = res.result.needCount;
						this.lastLevelId = res.result.lastLevelId;
						this.percentage = res.result.rate;
					}
					uni.hideLoading()
				});
			},
			jump(url) {
				this.$f.jump(url)
			},
			getSysInfo() {
				this.$H.get('system/basic').then(res => {
					if(res.vipShow=='1'){
						this.isOpen=false
					}else{
						if(this.isIphone&&res.iosClose=='0'){
							this.isOpen=false
						}else{
							this.isOpen=true
						}
					}
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.grade {
		& text {
			font-family: PingFangSC-Semibold, PingFang SC;
		}

		.top {
			width: 750rpx;
			height: 450rpx;
			padding: 0 50rpx;
			border-radius: 0 0 50% 50%/0 0 15% 15%;
			background: linear-gradient(360deg, #a47eff 0%, #a12aa5 100%);

			.line {
				width: 100%;
				height: 142rpx;
				margin-top: 88rpx;
			}

			.num {
				display: flex;
				justify-content: center;
				margin-top: -84rpx;

				>view {
					width: 144rpx;
					height: 136rpx;
					justify-content: center;
					align-items: center;
					display: flex;

					& image {
						width: 144rpx;
						height: 136rpx;
					}

					& text {
						font-size: 64rpx;
						font-weight: 600;
						color: #999999;
						line-height: 90rpx;
						text-shadow: 0rpx 2rpx 1rpx rgba(0, 0, 0, 0.0200);
						background: linear-gradient(180deg, #FCC181 0%, #CC6833 100%);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						position: absolute;
					}

					&:nth-child(2) {
						margin: 0 52rpx;
					}

					&:nth-child(1),
					&:nth-child(3) {
						margin-top: -40rpx;

						>image {
							width: 84rpx;
							height: 80rpx;
						}

						>text {
							font-size: 40rpx;
						}
					}
				}
			}

			.numerical {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-top: 24rpx;

				.experience {
					display: flex;
					align-items: center;

					.pre {
						font-size: 28rpx;
						color: #FFFFFF;
						line-height: 40rpx;
					}

					>image {
						width: 36rpx;
						height: 30rpx;
						margin: 0 6rpx;
					}

					.expNum {
						font-size: 36rpx;
						font-weight: 600;
						color: #FFFFFF;
					}
				}

				.differ {
					>text {
						font-size: 20rpx;
						color: #999999;
						line-height: 42rpx;
					}
				}
			}
		}

		.cont {
			padding: 0 40rpx;

			.people {
				width: 100%;
				height: 116rpx;
				background: linear-gradient(90deg, #A47EFF 0%, #9267FB 51%, #8F64FB 100%);
				border-radius: 58rpx;
				margin-top: 12rpx;
				padding: 0 36rpx 0 18rpx;
				display: flex;
				align-items: center;

				.image {
					width: 84rpx;
					height: 84rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					margin-right: 20rpx;

					>image {
						width: 84rpx;
						height: 84rpx;
						border-radius: 50%;
					}

					>view {
						width: 92rpx;
						height: 92rpx;
						border-radius: 50%;
						border: 2rpx solid #FFFFFF;
						filter: blur(2rpx);
						position: absolute;
					}
				}

				.text {
					flex: 1;
					display: flex;
					align-items: center;

					>text:first-child {
						font-size: 36rpx;
						font-weight: 600;
						color: #FFFFFF;
						line-height: 50rpx;
						margin-right: 14rpx;
					}

					>text:last-child {
						height: 34rpx;
						background: #BDA3FF;
						border-radius: 17rpx;
						padding: 0 14rpx;
						font-size: 24rpx;
						color: #FFFFFF;
						line-height: 34rpx;
					}
				}

				.money {
					display: flex;
					flex-direction: column;

					>text:first-child {
						font-size: 36rpx;
						font-weight: 600;
						color: #FFFFFF;
						line-height: 50rpx;
					}

					>text:last-child {
						font-size: 24rpx;
						color: #DBCDFF;
						line-height: 34rpx;
					}
				}
			}

			.experience {
				width: 100%;
				// height: 640rpx;
				background: #FFFFFF;
				border-radius: 20rpx;
				padding: 40rpx 18rpx;
				margin-top: 24rpx;

				.title {
					display: block;
					font-size: 32rpx;
					font-weight: 600;
					color: #333333;
					line-height: 44rpx;
					margin-bottom: 22rpx;
				}

				.number {
					display: flex;
					margin: 22rpx 0 56rpx 0;
					justify-content: space-between;

					>text {
						font-size: 28rpx;
						font-weight: 600;
						color: #000000;
						line-height: 40rpx;

						&:nth-child(2) {
							font-size: 28rpx;
							font-weight: 400;
							color: #999999;
							line-height: 40rpx;
						}
					}
				}

				.gift {
					margin-top: 30rpx;
					display: flex;

					.item {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-right: 22rpx;

						>view {
							width: 70rpx;
							height: 70rpx;
							background: #FFF0F0;
							border-radius: 20rpx;
							display: flex;
							justify-content: center;
							align-items: center;

							>image {
								width: 36rpx;
								height: 40rpx;
							}
						}

						.special {
							background: #FFFAF0;
						}

						>text {
							font-size: 20rpx;
							color: #999999;
							line-height: 28rpx;
							margin-top: 4rpx;
						}
					}
				}

				.button {
					width: 368rpx;
					height: 100rpx;
					margin: auto;
					margin-top: 60rpx;
					background: linear-gradient(90deg, #A47EFF 0%, #8F64FB 100%);
					border-radius: 58rpx;
					text-align: center;

					>text {
						font-size: 32rpx;
						font-weight: 600;
						color: #FFFFFF;
						line-height: 100rpx;
					}
				}
			}

			.task {
				width: 100%;
				height: 630rpx;
				background: #FFFFFF;
				border-radius: 20rpx;
				margin-top: 24rpx;
				padding: 40rpx 30rpx 0 20rpx;
				display: flex;
				flex-direction: column;

				.title {
					font-size: 32rpx;
					font-family: PingFangSC-Semibold, PingFang SC;
					font-weight: 600;
					color: #333333;
					line-height: 44rpx;
				}

				.text {
					font-size: 24rpx;
					color: #999999;
					line-height: 34rpx;
					margin: 6rpx 0 22rpx 0;
				}

				.list {
					display: flex;
					justify-content: space-between;
					margin-bottom: 74rpx;

					>view {
						width: 92rpx;
						height: 116rpx;
						background: linear-gradient(90deg, #A47EFF 0%, #8F64FB 100%);
						border-radius: 6rpx;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;

						>image {
							width: 58rpx;
							height: 56rpx;
						}

						>text {
							font-size: 20rpx;
							color: #FFFFFF;
							line-height: 28rpx;
							margin-top: 6rpx;
						}
					}
				}

				.invitation {
					.item {
						display: flex;
						align-items: center;
						margin-bottom: 36rpx;

						.icon {
							width: 84rpx;
							height: 84rpx;
							border-radius: 50%;
							background: #F5F1FF;
							display: flex;
							justify-content: center;
							align-items: center;
							margin-right: 14rpx;

							>image {
								width: 60rpx;
								height: 60rpx;
							}
						}

						.cent {
							flex: 1;
							display: flex;
							flex-direction: column;

							>text:first-child {
								font-size: 28rpx;
								color: #333333;
								line-height: 40rpx;
							}

							>text:last-child {
								font-size: 24rpx;
								color: #999999;
								line-height: 34rpx;
							}
						}

						.complete {
							width: 122rpx;
							height: 52rpx;
							background: linear-gradient(90deg, #bfb1e2 0%, #a47eff 100%);
							border-radius: 58rpx;
							text-align: center;

							>text {
								font-size: 24rpx;
								font-weight: 600;
								color: #FFFFFF;
								line-height: 52rpx;
							}
						}
					}
				}
			}
		}
	}
</style>