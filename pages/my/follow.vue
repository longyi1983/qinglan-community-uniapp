<template>
	<view class="container">
		<user-list :list="userList" :loadStatus="loadStatus"></user-list>
	</view>
</template>

<script>
	import userList from '@/components/user-list/user-list.vue';
	export default {
		components: {
			userList
		},
		data() {
			return {
				userList: [],
				loadStatus: "loadmore",
				page:1,
				uid:0
			};
		},
		onLoad(options) {
			if(options.uid){
				this.uid=options.uid
			}
			this.getUserList(this.uid);
		},
		onReachBottom() {
			this.page++;
			this.getUserList(this.uid);
		},
		methods: {
			getUserList(uid) {
				this.loadStatus = "loading";
				this.$H.get('user/follow', {
					page: this.page,
					uid: this.uid
				}).then(res => {
					if(res.result.data){
						this.userList = this.userList.concat(res.result.data);
						if (res.result.current_page >= res.result.total || res.result.last_page === 0) {
							this.loadStatus = "nomore";
						} else {
							this.loadStatus = "loadmore"
						}
					}else{
						this.loadStatus = "loadmore"
					}
					
				})
			}			
		}
	}
</script>

<style lang="scss">
	
</style>