<template>
	<view>
		<view class="m-field">
			<view class="label">
				<text>{{ label }}</text>
				<text class="required" v-if="required">*</text>
				<view @click="onClick" class="field-body">
					<block v-if="type == 'textarea'">
						<textarea
							style="min-height: 150rpx;"
							:auto-height="true"
							@input="onInput"
							@focus="onFocus"
							@confirm="onConfirm"
							:value="value"
							:placeholder="placeholder"
							:disabled="disabled2"
						></textarea>
					</block>
					<block v-else>
						<input
							:disabled="type == 'select' || disabled"
							class="input"
							@input="onInput"
							@focus="onFocus"
							@confirm="onConfirm"
							:value="value"
							:placeholder="placeholder"
						/>
						<view v-if="type == 'select'" class="right" @tap="onRightIcon"><u-icon name="grid"></u-icon></view>
						<view v-if="rightIcon" class="right" @tap="onRightIcon"><u-icon :name="rightIcon"></u-icon></view>
					</block>
				</view>
			</view>
		</view>
		<!-- Select选择弹窗 -->
		<lf-select v-model="showPopup" :mode="mode" @confirm="onSelectConfirm" :list="list"></lf-select>
	</view>
</template>

<script>

export default {
	name: 'lf-field',
	props: {
		list: {
			type: Array,
			default(){
				return []
			}
		},
		//输入类型
		type: {
			type: String,
			default: 'text'
		},
		// input的label提示语
		label: {
			type: String,
			default: ''
		},
		// 是否显示必填*号
		required: {
			type: Boolean,
			default: false
		},
		// placeholder
		placeholder: {
			type: String,
			default: '请填写内容'
		},
		value: {
			type: String,
			default: ''
		},
		mode: {
			type: String,
			default: 'selector'
		},
		disabled: {
			type: Boolean,
			default: false
		},
		disabled2: {
			type: Boolean,
			default: false
		},
		isClick: {
			type: Boolean,
			default: false
		},
		rightIcon: {
			type: String,
			default: null
		}
	},
	data() {
		return {
			showPopup: false
		};
	},
	methods: {
		//Select时点击事件
		onClick() {
			if (this.type == 'select' && this.isClick === false) {
				if (this.showPopup) {
					this.showPopup = false;
				} else {
					this.showPopup = true;
				}
			} else {
				this.$emit('click', '');
			}
		},
		onInput(event) {
			let value = event.detail.value;
			this.$emit('input', value);
		},
		onFocus(event) {
			this.focused = true;
			this.$emit('focus', event);
		},
		onBlur(event) {
			this.$emit('blur', event);
		},
		onConfirm(e) {
			this.$emit('confirm', e.detail.value);
		},
		onSelectConfirm(event) {
			this.showPopup = false;
			this.$emit('selectConfirm', this.list[event]);

			if (this.mode == 'date') {
				this.$emit('input', event);
			} else {
				this.$emit('input', this.list[event].value);
			}
		},
		onRightIcon() {
			this.$emit('onRightIcon');
		}
	}
};
</script>

<style lang="scss" scoped>
.m-field {
	padding: 30rpx 30rpx 0 30rpx;
	background-color: #ffffff;

	.label {
		.required {
			color: red;
			margin-left: 8rpx;
		}

		.field-body {
			display: flex;
			align-items: center;
			background-color: #f5f5f5;
			padding: 30rpx;
			border-radius: 10rpx;
			font-size: 24rpx;
			margin-top: 10rpx;
			.right {
				margin-left: auto;
			}
			.input {
				flex: 1;
				margin-right: 20rpx;
			}
		}
	}
}
</style>
