<template>
     <view class="lf-contact">
        <view class="header"></view>
        <view class="content column-center">
            <view class="content-view column-center bg-white">
                <img class="content-img" :src="server.image" />
                <view class="primary wechat-num lg">客服微信</view>
				<!-- #ifdef H5 || APP-PLUS -->
                <view class="row-center copy-btn xxl white" @click="onCopy(server.wechat)">
                    <image class="mr5" style="width: 32px;height: 25px;" src="../static/images/wechat-btn-icon.png" />
                    微信号添加
                </view>
				<!-- #endif -->
                <view class="mt20 normal xs" style="line-height: 35px">{{server.time}}</view>
                <!-- #ifdef MP-WEIXIN -->
                <button open-type="contact" class="sm row-center br60 copy-btn xxl white">
                    <text style="line-height: 50px;">小程序在线客服</text>
                </button>
                <!-- #endif -->
            </view>
            <view class="xs white" style="margin-top: 40px;line-height: 49px;">
                无法添加或其他事项可以联系平台电话
            </view>
            <view class="row white">
                <view class="xs" style="line-height: 49px;">{{server.phone}}</view>
                <!-- #ifdef H5 -->
                <a class="ml10 phone-btn xs row-center white" :href="'tel:' + server.phone">拨打</a>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <a class="ml10 phone-btn xs row-center white" @click="showTelTips">拨打</a>
                <!-- #endif -->
                <view class="ml5 copy-phone-btn xs row-center" @click="onCopy2(server.phone)">复制</view>
            </view>
        </view>
        <u-modal 
        :content="content"
        v-model="showPhoneCall"
        show-cancel-button
        confirm-text='呼叫'
        @confirm="onCall"
        >
        </u-modal>
    </view>
</template>

<script>
    export default {
        name: 'contact',
        data() {
            return {
                server: {},
                showPhoneCall: false,
                content: '即将打电话给'
            }
        },
        
        onLoad() {
            this.getContact()
        },
        
        methods: {
			getContact(){
				this.$H.get('user/getContact').then(res => {
					if(res.code==0){
						this.server=res.result;
					}
					
				});
			},

            onCopy(str) {
                let that = this;
                uni.setClipboardData({
                	data: str,
                	success: function() {
                		uni.hideToast();
                		that.$f.toast('微信号复制成功', 'success');
                	}
                });
            },
			onCopy2(str) {
			    let that = this;
			    uni.setClipboardData({
			    	data: str,
			    	success: function() {
			    		uni.hideToast();
			    		that.$f.toast('手机号复制成功', 'success');
			    	}
			    });
			},
            showTelTips() {
                this.showPhoneCall = true;
                this.content = '即将打电话给' + this.server.phone
            },
            onCall() {
                wx.makePhoneCall({
                    phoneNumber: this.server.phone.toString(),
                    success(e) {
                        console.log('成功', e)
                    },
                    fail(err) {
                        console.log('失败', err)
                    }
                })
            }
        }
    }
</script>

<style lang="scss">
	.row {
	    display: flex;
	    align-items: center;
	}
    .column-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
	.bg-white {
	    background-color: #F4F4F5;
	}
	.white {
	    color: #F4F4F5;
	}
	.normal {
	    color: #333333;
	}
	.lg {
	    font-size: 32rpx;
	}
	.sm {
	    font-size: 26rpx;
	}
	.xs {
	    font-size: 24rpx;
	}
	.mr5 {
	    margin-right: 5rpx;
	}
	.xxl {
	    font-size: 36rpx;
	}
	.row-center {
	    display: flex;
	    align-items: center;
	    justify-content: center;
	}
	.br60 {
	    border-radius: 60rpx;
	}
	.ml10 {
	    margin-left: 10rpx;
	}
	.ml5 {
	    margin-left: 5rpx;
	}
	
    .lf-contact {
        min-height: 100vh;
        background: linear-gradient(180deg, #afb0e2 0%, #39a0d6 100%);  
        .header {
            height: 383px;
            width: 100%;
        }
        .content {
            
            
            .content-view {
                border: 5px solid #bdb7c2;
                width: 310px;
                border-radius: 10px;
                margin-top: -350px;
                .content-img {
                    margin-top: 20px;
                    height: 192px;
                    width: 192px;
                }
                .wechat-num {
                    line-height: 45px;
                }
                .copy-btn {
                    background: linear-gradient(180deg, #b8b6b2 0%, #0a0a0a 100%);
                    width: 230px;
                    height: 50px;
                    border-radius: 50px;
                    line-height: 49px;
                    margin-top: 30px;
                }
                .contact-btn {
                    width: 300rpx;
                    height: 60rpx;
                    margin-bottom: 20rpx;
                }
            }
            .phone-btn {
                background: linear-gradient(180deg, #b8b6b2 0%, #0a0a0a 100%);
                height: 24px;
                width: 60px;
                line-height: 33px;
                border-radius: 50px;
            }
            .copy-phone-btn {
                background-color: rgba($color: #fff, $alpha: 0.5);
                height: 24px;
                width: 60px;
                line-height: 33px;
                border-radius: 50px;
            }
        }
    }
</style>
