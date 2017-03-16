<template>
  <div class="container" :style="{opacity: opacity}">
    <div class="titlebar" :class="{minimum: fullScreen}">
      <div class="buttons left">
        <div class="button back-button" :class="{active: canGoBack}" @click="goBack">
          <Octicon name="chevron-left" scale="1.2"/>
        </div>
        <div class="button forward-button" :class="{active: canGoForward}" @click="goForward">
          <Octicon name="chevron-right" scale="1.2"/>
        </div>
      </div>
      <div class="buttons">
        <div class="button pin-button" :class="{active: alwaysOnTop}" @click="toggleAlwaysOnTop">
          <Octicon name="pin" scale="1"/>
        </div>
        <div class="button opacity-range-button"
             :class="{active: this.showRange}"
             @click="toggleRange">
          <Octicon name="eye" scale="1"/>
          <transition name="range">
            <div v-show="showRange" class="range">
              <div class="range-wall"
                :class="{active: onRange}"
                @mousemove="moveRange($event)"
                @mouseup="endRange">
              ></div>
              <div ref="rangeBar" class="range-bar">
                <div ref="rangeButton" class="range-button"
                     @mousedown="startRange"></div>
              </div>
            </div>
          </transition>
        </div>
        <div class="button mylist-button" :class="{active: this.showMylist}" @click="toggleMylist">
          <Octicon name="grabber" scale="1.5"/>
        </div>
      </div>
    </div>
    <div class="views" :class="{'is-fullscreen': fullScreen}">
      <webview plugins ref="browse" class="browse" src="https://netflix.com/browse"></webview>
      <div class="mylist-wall" v-if="this.showMylist" @click="toggleMylist" />
      <webview plugins ref="mylist" class="mylist" :class="{active: this.showMylist, fullscreen: fullScreen}" src="https://www.netflix.com/browse/my-list"></webview>
    </div>
  </div>
</template>

<script>
  import Octicon from 'vue-octicon/components/Octicon';
  import 'vue-octicon/icons/pin';
  import 'vue-octicon/icons/grabber';
  import 'vue-octicon/icons/eye';
  import 'vue-octicon/icons/chevron-left';
  import 'vue-octicon/icons/chevron-right';

  export default {
    components: {
      Octicon
    },
    name: 'landing-page',
    data() {
      return {
        opacity: 1,
        canGoBack: false,
        canGoForward: false,
        alwaysOnTop: false,
        showRange: false,
        onRange: false,
        showMylist: false,
        fullScreen: false,
      };
    },
    methods: {
      goBack() {
        this.$refs.browse.goBack();
      },
      goForward() {
        this.$refs.browse.goForward();
      },
      startRange() {
        this.onRange = true;
      },
      endRange() {
        this.onRange = false;
      },
      moveRange(ev) {
        if (!this.onRange) {
          return;
        }

        const barHeight = this.$refs.rangeBar.clientHeight;
        const movement = ev.movementY;
        const nextPos = this.$refs.rangeButton.offsetTop + movement;

        if (nextPos < 0) {
          this.$refs.rangeButton.style.top = '0px';
        } else if (nextPos > this.$refs.rangeButton.offsetParent.clientHeight) {
          this.$refs.rangeButton.style.top =
            this.$refs.rangeButton.offsetParent.clientHeight + 'px';
        } else {
          this.$refs.rangeButton.style.top = nextPos + 'px';
        }

        const opacity = this.$refs.rangeButton.offsetTop / barHeight;
        if (opacity < 0.1) {
          this.opacity = 0.1;
        } else {
          this.opacity = opacity;
        }
      },
      toggleAlwaysOnTop() {
        if (this.alwaysOnTop) {
          this.$electron.ipcRenderer.send('off-always-on-top:req');
        } else {
          this.$electron.ipcRenderer.send('on-always-on-top:req');
        }
      },
      toggleRange() {
        if (this.showRange && !this.onRange) {
          this.showRange = false;
        } else {
          this.showRange = true;
        }
      },
      toggleMylist() {
        if (this.showMylist) {
          this.showMylist = false;
        } else {
          this.showMylist = true;
        }
      },
      handleBrowseClick() {
        console.log(999);
        this.showMylist = false;
      }
    },
    mounted() {
      const self = this;
      this.$electron.ipcRenderer.on('on-always-on-top:res', () => {
        self.alwaysOnTop = true;
      });
      this.$electron.ipcRenderer.on('off-always-on-top:res', () => {
        self.alwaysOnTop = false;
      });
      this.$electron.ipcRenderer.on('load-video-url', (ev, data) => {
        self.showMylist = false;
        self.$refs.browse.loadURL(`https://netflix.com/watch/${data.videoId}`);
      });
      this.$electron.ipcRenderer.on('enter-full-screen', () => {
        self.fullScreen = true;
      });
      this.$electron.ipcRenderer.on('leave-full-screen', () => {
        self.fullScreen = false;
      });
      this.$refs.browse.addEventListener('load-commit', (() => {
        let init = false;
        return () => {
          const browse = this.$refs.browse;
          self.canGoBack = browse.canGoBack();
          self.canGoForward = browse.canGoForward();
          if (!init && browse.getURL() === 'https://www.netflix.com/browse') {
            this.$refs.mylist.reload();
          }
        };
      })());
      this.$refs.mylist.addEventListener('dom-ready', () => {
        this.$refs.mylist.insertCSS(`
[role=header],
.galleryHeader,
[role=contentinfo] {
  display: none;
}
.slider-item:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 100000;
}
        `);
        this.$refs.mylist.executeJavaScript(`
Array.prototype.slice.call(
  document.getElementsByClassName('slider-item')
).forEach(el => {
  el.addEventListener('click', e => {
    const currentTarget = e.currentTarget;
    const emEl = currentTarget.querySelector('[data-ui-tracking-context]');
    if (emEl === null) {
      return;
    }

    const data = JSON.parse(
      decodeURIComponent(emEl.getAttribute('data-ui-tracking-context'))
    );

    console.log(data['video_id']);

    const a = document.createElement('a');
    a.href = 'netfri://' + data['video_id'];
    a.click();
  });
});
        `, false, () => {});
        // this.$refs.mylist.openDevTools();
      });
    }
  }
</script>

<style scoped>
.container {
  min-width: 100vw;
  min-height: 100vh;
  background: #000;
}
.titlebar {
  height: 37px;
  background: #000;
  -webkit-app-region: drag;
  position: relative;
  z-index: 9;
}
.titlebar.minimum {
  overflow: hidden;
  opacity: 0;
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  background: transparent;
}
.titlebar.minimum:hover {
  opacity: 1;
}
.buttons {
  position: absolute;
  right: 13px;
  top: 10px;
  display: flex;
}
.buttons.left {
  left: 80px;
}
.buttons.left svg {
  fill: transparent;
}
.buttons svg {
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  fill: #fff;
}
.button {
  margin-left: .7em;
  position: relative;
  height: 2em;
}
.back-button.active svg,
.forward-button.active svg {
  fill: #fff;
}
.back-button.active:hover svg,
.forward-button.active:hover svg {
  fill: #d54030;
}
.pin-button {
  margin-top: 2px;
  margin-right: -2px;
}
.opacity-range-button {
  margin-top: 3px;
}
.range {
  position: absolute;
  right: 50%;
  transform: translateX(50%);
  top: 100%;
  background: #000;
  height: 8em;
  width: 2em;
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  opacity: 1;
}
.range-wall {
  position: fixed;
  left: -100vw;
  top: -100vh;
  width: 200vw;
  height: 200vh;
}
.range-wall.active {
  z-index: 9;
}
.range-enter,
.range-leave-to {
  opacity: 0;
}
.range-bar {
  position: absolute;
  right: 50%;
  bottom: 50%;
  transform: translate(50%, 50%);
  width: 2px;
  height: 80%;
  background: #ccc;
  text-align: center;
}
.range-button {
  display: inline-block;
  position: absolute;
  left: calc(-.5em + 1px);
  bottom: 0;
  width: 1em;
  height: 1em;
  background: #d54030;
  border-radius: 50%;
}
.pin-button.active svg,
.opacity-range-button.active svg,
.mylist-button.active svg {
  fill: #d54030;
}
.views {
  position: absolute;
  left: 0;
  bottom: 0;
  height: calc(100vh - 37px);
  width: 100vw;
  overflow: hidden;
}
.views.is-fullscreen {
  height: 100vh;
}
.browse {
  width: 100vw;
  height: 100%;
}
.mylist {
  position: absolute;
  top: 0;
  right: -40vw;
  width: 40vw;
  height: 100%;
  transform: translate3d(0, 0, 0);
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
}
.mylist.active {
  transform: translate3d(-40vw, 0, 0);
}
.mylist-wall {
  position: fixed;
  left: -100vw;
  top: -100vh;
  width: 200vw;
  height: 200vh;
}
.mylist.fullscreen {
  height: calc(100vh - 37px);
  margin-top: 37px;
}
</style>
