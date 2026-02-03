export default {
  data() {
    return {
      navBg: 0,
      scrollTop: 0
    }
  },
  methods: {
    handlePageScroll(e) {
      const top = uni.upx2px(100)
      const { scrollTop } = e
      this.scrollTop = scrollTop
      let percent = scrollTop / top > 1 ? 1 : scrollTop / top
      this.navBg = percent
    }
  },
}