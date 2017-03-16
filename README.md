<h1><img src="https://github.com/nju33/netfri/blob/master/app/icons/icon.iconset/icon_32x32@2x.png?raw=true" width=30>&nbsp;Netfri</h1>

👓 Unofficial Netflix app (A little better?)

![screenshot](https://github.com/nju33/netfri/blob/master/readme/screenshot.png?raw=true)

## Prepare

This application needs to make the configuration file first. The contents are related to [this](https://github.com/electron/electron/blob/master/docs/tutorial/using-widevine-cdm-plugin.md#using-widevine-cdm-plugin).

For example, if you installed Chrome using **Homebrew cask**, it would look something like this.

##### `~/.netfri.json`

```json
{
  "widevineCDMPath": "/opt/homebrew-cask/Caskroom/google-chrome/latest/Google Chrome.app/Contents/Versions/57.0.2987.98/Google Chrome Framework.framework/Libraries/WidevineCdm/_platform_specific/mac_x64/widevinecdmadapter.plugin",
  "widevineCDMVersion": "1.4.8.970"
}
```

It's "chrome: // plugins" in the method of examining Version, but maybe you may be "chrome: // components" 😵

## Usage

The icon in the upper right is like this.

- pin / Do always on top
- eye / Adjust opacity
- hamburger / Show mylist  
  Clicking the poster in the list closes my-list and starts playing that title in the view on the left.
  
## Download

From the [release page](https://github.com/nju33/netfri/releases/latest)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron app for production
npm run build

# run webpack in production
npm run pack
```
More information can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/docs/npm_scripts.html).

---

This project was generated from [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about this project can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

## License

The MIT License (MIT)

Copyright (c) 2017 nju33 <nju33.ki@gmail.com>
