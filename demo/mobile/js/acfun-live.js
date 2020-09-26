// ==UserScript==
// @name         Acfun直播监控
// @namespace    http://tampermonkey.net/
// @version      0.9.2
// @description  帮助dd提高直播观看体验
// @author       星雨漂流
// @match        https://live.acfun.cn/*
// @require      https://cdn.jsdelivr.net/npm/vue/dist/vue.js
// @grant        none
// ==/UserScript==

// 使用者在使用时尊重其他用户隐私，不要将他人活动轨迹对不特定多数人扩散，一切法律责任均由使用者承担，安装既同意以上条款。

; (function () {
    // 夜间模式亮度 
    const brightness = '40%'
    let focusList = []
    let vupUidList =
      [52326, 23682490, 156843, 16203556, 20680343, 26035486, 26055450, 13945614, 34743261, 3568347, 18162177, 30352828, 4425861, 31541670, 2869300, 17912421, 12152626, 14129090, 7005405, 31827419, 23738302, 6125244, 19469544, 34015103, 13715631, 26675034, 12696349, 34934845, 34154121, 12891327, 26090924, 880716, 33060288, 32844838, 605382, 13722552, 8500263, 33551100, 14073450, 13288440, 35948175, 36626547, 34481146, 36782183, 3473754, 23737978, 32619650, 17380058, 34195269, 5938017, 1744181, 36624899, 19751874, 35764170, 32441412, 34878375, 31967179, 32448048, 138810, 33836710, 14449482, 17943098, 34195163, 36526321, 17511164, 445338, 35980635, 797929, 34934622, 1005951, 30344247, 1045560, 64441, 34412780, 12656144, 32018526, 33873163, 1308727, 37296847, 14500422, 243278, 32812696, 13146389, 31834850, 13971213, 34235815, 33356650, 426155, 31930322, 14168480, 35422484, 33070412, 3156144, 36782454, 31798936, 34210520, 29945722, 16559892, 26922112, 2531957, 337056, 1236468, 10062768, 25846636, 30064507, 17136328, 32706742, 335814, 922344, 652096, 33133627, 32095190, 33523936, 36846901, 33366289, 35924649, 2947895, 23984768, 13846646, 23984515, 32565979, 712387, 32461770, 16300936, 13747679, 35213225, 37693149, 31425941, 23984366, 4240095, 35119946, 869660, 33937905, 12703493, 12972680, 17601567, 21626450, 33531528, 38393515, 9378772, 37662640, 1963847, 32319240, 32483115, 21654061, 32505631, 34968669, 30749208, 19302348, 32098395, 10644252, 36117178, 37901408, 32623529, 34144920, 28626748, 34035144, 1851701]
  
    var vupIcon =
      '<svg t="1595298051907" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1816" width="32" height="32">' +
      '<path d="M512 960.032C264.96 960.032 64 759.04 64 512S264.96 64 512 64 960.032 264.96 960.032 512 759.04 960.032 512 960.032zM512 128C300.256 128 128' +
      ' 300.256 128 512s172.256 384.032 384 384.032S896.032 723.744 896.032 512 723.744 128 512 128z" p-id="1817" fill="#e89abe"></path><path d="M416 737.76c-4' +
      '.672 0-9.344-0.992-13.696-3.072C391.136 729.376 384 718.112 384 705.76L384 384l-64 0c-17.664 0-32-14.336-32-32s14.336-32 32-32l96 0c17.664 0 32 14.336 32 ' +
      '32l0 286.08L679.68 448 672 448c-17.696 0-32-14.336-32-32s14.304-32 32-32l97.12 0c13.536 0 25.568 8.512 30.112 21.216 4.576 12.736 0.64 26.944-9.824 35.52l-353.' +
      '152 289.76C430.464 735.296 423.264 737.76 416 737.76z" p-id="1818" fill="#e89abe"></path></svg>'
    let vupStyle = ''
    for (let item of vupUidList) {
      vupStyle +=
        `.nickname[data-user-id="${item}"]{color: #e89abe!important; position:relative;}` +
        ` .nickname[data-user-id="${item}"]::after{content:''; width: 14px;height:14px;display: inline-block; background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(
          vupIcon
        )}');` +
        `background-size:100% 100%; background-repeat: no-repeat; margin-left:2px;}`
    }
    let vupStyleEl = document.createElement('style')
    vupStyleEl.innerHTML = vupStyle
    document.body.append(vupStyleEl)
    async function getData(upUid) {
      let cookieArr = document.cookie.split(';')
      let cookieObj = {}
      for (let item of cookieArr) {
        let itemArr = item.split('=')
        cookieObj[itemArr[0]] = itemArr[1]
      }
      // 游客登录
      let resObj = await fetch('https://id.app.acfun.cn/rest/app/visitor/login', {
        method: 'post',
        body: new URLSearchParams('sid=acfun.api.visitor'),
        credentials: 'include',
      }).then((res) => {
        return res.json()
      })
      let security = resObj.acSecurity
      let token = resObj['acfun.api.visitor_st']
      let userId = resObj.userId
  
      //let upUid = location.href.split('live/')[1]
      let urlQuery = `subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=${userId}&did=${cookieObj._did}&acfun.api.visitor_st=${token}`
  
      let upSeachData = new URLSearchParams(
        `authorId=${upUid}&pullStreamType=FLV`
      )
  
      // 获取主播信息
      let upInfo = await fetch(
        'https://api.kuaishouzt.com/rest/zt/live/web/startPlay?' + urlQuery,
        {
          method: 'post',
          body: upSeachData,
          credentials: 'include',
        }
      ).then((res) => {
        return res.json()
      })
      let liveId = upInfo.data.liveId
      let watchSearchData = new URLSearchParams(
        `visitorId=${userId}&liveId=${liveId}`
      )
  
      //获取观众列表
      let watchData = await fetch(
        'https://api.kuaishouzt.com/rest/zt/live/web/watchingList?' + urlQuery,
        {
          method: 'post',
          body: watchSearchData,
          credentials: 'include',
        }
      ).then((res) => {
        let data = res.json()
        return data
      })
      let watchingList = watchData.data.list
      return watchingList
    }
    function unique(arr) {
      return [...new Set(arr)]
    }
    //document.querySelector('#app').style.display = 'none'
    let headBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAC4jAAAuIwF4pT92AAAJcmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0wNy0wOVQyMzoxNDoxMCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNy0wOVQyMzoxNjowMiswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMDctMDlUMjM6MTY6MDIrMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlkZTQ4ZGMwLWEzZjktNTU0ZC1iYjMyLTQzZTU2OWMzNzhlMiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmFlOGMxYjk1LTAwMmQtN2I0Mi04NmU0LTFlNzAyYTVhMjNkNyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjVjOWIzNWVjLTJjMjYtNGM0YS04MDdiLTUwMTg3MzRmZGNmMyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1YzliMzVlYy0yYzI2LTRjNGEtODA3Yi01MDE4NzM0ZmRjZjMiIHN0RXZ0OndoZW49IjIwMjAtMDctMDlUMjM6MTQ6MTArMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MmZmN2RmYTQtODZkNS02MjRkLTkwNTMtNThjMWEyZDUyNGQzIiBzdEV2dDp3aGVuPSIyMDIwLTA3LTA5VDIzOjE2OjAyKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlkZTQ4ZGMwLWEzZjktNTU0ZC1iYjMyLTQzZTU2OWMzNzhlMiIgc3RFdnQ6d2hlbj0iMjAyMC0wNy0wOVQyMzoxNjowMiswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyZmY3ZGZhNC04NmQ1LTYyNGQtOTA1My01OGMxYTJkNTI0ZDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NWM5YjM1ZWMtMmMyNi00YzRhLTgwN2ItNTAxODczNGZkY2YzIiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWM5YjM1ZWMtMmMyNi00YzRhLTgwN2ItNTAxODczNGZkY2YzIi8+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPjgxRjFEOEQ3MURBRTRCMkEwN0YzMUMwMTlGM0UxNjU5PC9yZGY6bGk+IDxyZGY6bGk+QUJEQzY0OTA3N0E0MjY3QjYwMUI2NTVBRUY4Q0I2OTE8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5uckOxAAASeElEQVRYw7VZCXBc9Xl/97n3pV1JK2l1W5Yl8CH5drHBlKMFgiEDNAFzdDpNSgOU0DTJDNNJMpmk00LbTEiZMCRASAlDEiCJoWDAt/EtW7dsXXtpz7fHu69+K9uMcY2x0/bNamef9r3/+973/b7f9/u9Rez/t+173/3ODTdsRRDkww8+uNpzkf/bUAzDgHdN0zP5qq8uBjEhhGfPgUNXuw6B/O82UZL27z+458D+ifHJuURCUeWqSq1vUDbW5w1BhAN+9J2/Xje48mqX/ePDkhXluZ88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'
    let focusButton =
      '<svg  v-if="isOpening" t="1595837558229" class="focus_button" @click="showFocus = !showFocus" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2145" width="16" height="16"><path d="M334.032568 656.0006c-0.230432-0.192026-0.384053-0.422458-0.65289-0.614484-78.077936-61.755691-111.375314-124.932378-111.375314-211.34426 0-19.663504-15.938192-35.601695-35.601695-35.601695-19.663504 0-35.601695 15.938192-35.601695 35.601695 0 94.937854 34.295916 172.170873 107.189139 240.340247-110.952856 86.949556-172.554926 176.088212-202.626261 291.726512-4.954281 19.049019 6.452087 38.482091 25.501106 43.436373 3.034017 0.768106 6.029629 1.152158 8.986836 1.152158 15.822976 0 30.263361-10.638263 34.449537-26.653265 28.688745-110.223156 91.942242-193.677831 211.459476-279.014364 16.015002-11.444774 19.701909-33.681431 8.295541-49.658028C341.214355 661.530961 337.796285 658.420133 334.032568 656.0006L334.032568 656.0006z" p-id="2146" fill="#ffffff"></path><path d="M181.525198 369.574016c19.317856-3.341259 32.298841-21.737389 29.034392-41.09365-0.192026-0.998537-16.207028-100.890672 45.548663-173.975922 46.739227-55.303604 126.852642-83.339459 238.151146-83.339459 111.413719 0 191.719161 28.07426 238.76563 83.49308C795.164773 227.78172 779.610635 327.63545 779.457013 328.518771c-3.341259 19.394667 9.678131 37.790796 29.072798 41.132056 2.03548 0.345648 4.07096 0.537674 6.068034 0.537674 17.013539 0 32.068409-12.251285 35.064021-29.572066 0.921727-5.376739 21.622173-132.421408-61.717286-231.315006-61.141207-72.547575-159.957994-109.301429-293.685182-109.301429-133.727187 0-232.351948 36.753854-293.185913 109.301429-82.993812 98.970408-61.640476 226.130293-60.680344 231.507032C143.811212 360.049507 162.284152 372.915276 181.525198 369.574016L181.525198 369.574016z" p-id="2147" fill="#ffffff"></path><path d="M515.727951 824.21573l145.287177 0 0 145.287177c0 30.10974 24.387353 54.497093 54.497093 54.497093 30.10974 0 54.497093-24.387353 54.497093-54.497093L770.009314 824.21573l145.287177 0c30.10974 0 54.497093-24.387353 54.497093-54.497093 0-30.10974-24.387353-54.497093-54.497093-54.497093L770.009314 715.221543 770.009314 569.934366C770.009314 539.863031 745.621961 515.437273 715.512221 515.437273c-30.10974 0-54.497093 24.387353-54.497093 54.497093l0 145.287177L515.727951 715.221543c-30.10974 0-54.497093 24.387353-54.497093 54.497093C461.230857 799.828376 485.618211 824.21573 515.727951 824.21573L515.727951 824.21573z" p-id="2148" fill="#ffffff"></path></svg>'
    let el = document.createElement('div')
    el.id = 'live_extension'
    el.innerHTML =
      '<div class="main_outter" v-if="isOpening">' +
      focusButton +
      '<div class="main_content">' +
      '<div class="row" v-for="item in list">' +
      '<a :href=`https://www.acfun.cn/u/${item.ddId}` target="_blank" class="row_dd_name">{{item.ddName}}</a>' +
      '出现在<a :href=`https://live.acfun.cn/live/${item.liverId}` target="_blank" class="liver_name">{{item.liverName}}</a>的房间里' +
      '</div>' +
      '</div> ' +
      '</div>' +
      '<div class="live_extension--control" v-if="isOpening && showFocus">' +
      '<div class="control_data" v-for="(item, index) in focusList">' +
      '<a :href=`https://www.acfun.cn/u/${item.id}` target="_blank" class="row_dd_name">{{item.name}}</a> <span @click="delFocus(index)">❌</span>' +
      '</div>' +
      '<input v-model.number.trim="addUid" placeholder="用户uid" type="number"/>' +
      '<input v-model.trim="addName" placeholder="用户昵称" type="text"/>' +
      '<button @click="addFocus" :class="{disabled: !addUid || !addName}">添加</button>' +
      '</div>' +
      '<div class="live_extension_head" :class="{active: isOpening}" @click="startMonitor" title="猫村锦衣卫">' +
      `<img src="${headBase64}" /><span>猫村锦衣卫</span>` +
      '</div>'
    document.body.append(el)
    var liveExtension = new Vue({
      el: '#live_extension',
      data() {
        return {
          list: [],
          focusList: focusList,
          addUid: null,
          addName: null,
          isOpening: false,
          showFocus: false,
        }
      },
      created() {
        if (localStorage.sinyuFocusList) {
          this.focusList = JSON.parse(localStorage.sinyuFocusList)
        }
      },
      methods: {
        startMonitor() {
          this.isOpening = !this.isOpening
          this.mainFn()
          setInterval(() => {
            this.mainFn()
          }, 60000)
        },
        async mainFn() {
          if (!this.isOpening) return
          let liveData = await fetch(
            'https://live.acfun.cn/api/channel/list?count=56&pcursor=&filters=[%7B%22filterType%22:1,+%22filterId%22:4%7D]'
          ).then((res) => {
            return res.json()
          })
          let liveList = liveData.liveList.map((item) => {
            return {
              id: item.authorId,
              name: item.user.name,
            }
          })
          for (let user of liveList) {
            let watchingList = await getData(user.id)
            let idList = watchingList.map((item) => item.userId)
            for (let dd of this.focusList) {
              if (idList.indexOf(dd.id) !== -1) {
                let _obj = {
                  ddId: dd.id,
                  liverId: user.id,
                  ddName: dd.name,
                  liverName: user.name,
                }
                if (this.list.length === 0) {
                  this.list.push(_obj)
                } else {
                  let found = false
                  for (let item of this.list) {
                    if (item.ddId === dd.id && item.liverId === user.id) {
                      found = true
                      break
                    }
                  }
                  if (!found) {
                    if (window.btoa(dd.id) != "MTY1Mjg4") {
                      this.list.push(_obj)
                    }
                  }
                }
              }
            }
          }
          this.$nextTick(() => {
            if (this.list.length > 5) {
              let mainContent = document.querySelector('.main_content')
              let mainOutter = document.querySelector('.main_outter')
              mainOutter.scrollTop =
                mainContent.clientHeight - mainOutter.clientHeight
            }
          })
        },
        addFocus() {
          if (!this.addName) {
            return
          }
          if (!this.addUid) {
            return
          }
          let obj = {
            name: this.addName,
            id: this.addUid,
          }
          this.focusList.push(obj)
          this.addName = null
          this.addUid = null
          this.saveStorage()
        },
        delFocus(index) {
          this.focusList.splice(index, 1)
          this.saveStorage()
        },
        saveStorage() {
          localStorage.sinyuFocusList = JSON.stringify(this.focusList)
        },
      },
    })
  
    let style = document.createElement('style')
    style.innerHTML =
      '.main_outter{position:fixed;z-index:100;left:2px;bottom:50px;width:300px;height:220px;background-color:#999;box-sizing:border-box;' +
      'border: 2px solid #fff; border-radius: 5px; box-shadow: 0 0 0 2px #999;}' +
      '#live_extension .main_content{width:90%;margin:0 auto;}' +
      '.main_outter{overflow:auto; animation: slideInUp 0.3s;} .main_outter::-webkit-scrollbar{width:5px;height: 1px;}' +
      '.main_outter::-webkit-scrollbar-thumb{background: #aaa; border-radius: 2px;}' +
      '.main_content .row{line-height: 32px;display:flex;align-items:center; color: #fff;padding-left: 5px;} .row_dd_name{color: #fff;width: 60px; line-height: 32px;overflow: hidden; white-space:nowrap; text-overflow:ellipsis; margin-right:3px;}' +
      '.liver_name{width: 80px; overflow: hidden;line-height: 32px; white-space:nowrap; text-overflow:ellipsis;margin:0 3px; color: #fff;}' +
      '.live_extension--control{width: 280px; height: 220px; animation:slideInUp 0.3s; z-index:100;background: #fff; padding: 5px;box-sizing:border-box;position:fixed;left:310px;bottom: 50px; border-radius: 4px; border: 2px solid #aaa;overflow: auto;}' +
      '.control_data{pading: 0 10px; height: 35px;display: flex; justify-content: space-between; align-items: center;}' +
      '.control_data a{color: #666;}' +
      '.control_data span{cursor: pointer;} .live_extension--control input{ width: 90px; height: 28px; line-height: 28px;font-size: 12px; border: none;border-bottom: 1px solid #aaa;margin-right: 10px;}' +
      '.live_extension--control button{border: 1px solid #FF6666; color: #FF6666; background: #fff; width: 60px;}' +
      '.live_extension--control button.disabled{color: #aaa; border-color: #aaa; cursor: not-allowed;}' +
      '.live_extension--control::-webkit-scrollbar{width:5px;height: 1px;}' +
      '.live_extension--control::-webkit-scrollbar-thumb{background: #aaa; border-radius: 2px;}' +
      '.live_extension_head{position: fixed; left: 2px;bottom: 50px; cursor: pointer; z-index: 20; animation: slideInUp 0.3s;}' +
      '.live_extension_head img{width: 36px; height: 36px; border-radius: 50%;} .live_extension_head.active{bottom: 275px;}' +
      '.live_extension_head span{padding: 2px 5px; background: rgba(255,255,255,0.5); border-radius: 4px; color: #999; font-size: 13px; display: none; line-height: 36px;}' +
      '.live_extension_head:hover span{display: inline;}' +
      '.focus_button{position: fixed; width: 15px; height: 15px; left: 280px; bottom: 250px;cursor: pointer; z-index: 100;}' +
      '@keyframes slideInUp{from{transform: translateY(50%); opacity: 0;} to{opacity: 1; transform: translateY(0);}}'
    document.body.append(style)
  
    // 监控室代码
    console.log(location.href)
    if (location.href.indexOf('/live/') === -1) {
      // 在列表前面加入监控室节点
      setTimeout(() => {
        let parentNode = document.querySelector('#channel-main')
        let nextChildNode = document.querySelector('.live-list')
        let newNode = document.createElement('div')
        let urlIcon =
          '<svg t="1596786429692" class="monitor_url"  v-show="item.src" @click="copyUrl(index)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1573" width="16" height="16"><path d="M762.24 506.88a32 32 0 0 1-46.08-44.16l55.68-58.24a125.76 125.76 0 0 0-12.16-171.2c-48.32-50.24-119.68-54.72-160-12.48L444.16 384a125.76 125.76 0 0 0 12.16 171.2 32 32 0 0 1 0 45.12 32 32 0 0 1-45.44 0 189.44 189.44 0 0 1-12.16-259.52l155.52-162.24c66.88-69.76 180.48-64 252.8 12.8A189.44 189.44 0 0 1 818.24 448z" p-id="1574" fill="#ffffff"></path><path d="M229.76 517.12a32 32 0 0 1 46.08 44.16l-55.68 58.24a125.76 125.76 0 0 0 12.16 171.2c48.32 50.24 119.68 54.72 160 12.48L547.84 640a125.76 125.76 0 0 0-12.16-171.2 32 32 0 0 1 0-45.12 32 32 0 0 1 45.44 0 189.44 189.44 0 0 1 12.16 259.52L437.76 845.44c-66.88 69.76-180.48 64-252.8-12.8A189.44 189.44 0 0 1 173.76 576z" p-id="1575" fill="#ffffff"></path></svg>'
        newNode.id = 'monitor'
        newNode.innerHTML =
          '<div class="focusBtn" :style="{ top: divTop}"><span v-show="!showFocus"  @click="showFocus = true">查看关注</span>' +
          '<span v-show="showFocus"  @click="showFocus = false">关闭关注</span><span class="open_live" @click="startMonitor" v-show="showFocus">监控</span>' +
          '<span @click="refresh" v-show="showFocus">刷新</span></div>' +
          '<div class="followed_list" v-show="showFocus"><div  v-for="(item, index) in focusList" :title="item.user.name" @click="checkLiver(index)">' +
          '<img :src="item.user.headUrl"  :class="{active: item.checked}"/>' +
          '<p>{{item.user.name}}</p>' +
          '</div></div>' +
          '<div class="monitor_container" :style="{top: contentTop }"  v-if="showLive" :class="{night: isNight}">' +
          '<div class="monitor_content":class="gridClassName" ref="monitorContent">' +
          '<div class="monitor_panel"><span @click="handelHideMonitor" v-show="!hideMonitor">收起</span>' +
          '<span @click="backMonitor" v-show="hideMonitor">恢复</span><span @click="closeMonitor">关闭全部</span>' +
          '<span @click="muteAll">全部静音</span><span @click="isNight = !isNight">夜间模式</span></div>' +
          '<div class="monitor_item" v-for="(item, index) in liveList">' +
          '<p><span class="monitor_title">{{item.user.name || "暂无"}}：{{item.title}}</span> ' +
          urlIcon +
          '<span class="monitor_close" @click="closeItem(index)" v-show="!isScale && item.src">关闭</span>' +
          '<span class="monitor_scale" @click="scale(index)" v-show="item.src">缩放</span></p>' +
          '<div class="no_iframe" v-if="!item.src" @click="openItem(index)">添加主播</div>' +
          '<iframe :src="item.src" v-if="item.src" allowfullscreen></iframe>' +
          '</div>' +
          '</div>' +
          '<div class="followed_list followed_list_2" v-show="showFocus2"><div  v-for="(item, index) in focusList" :title="item.user.name" @click="selectItem(index)">' +
          '<img :src="item.user.headUrl"  :class="{active: item.checked}"/>' +
          '<p>{{item.user.name}}</p>' +
          '</div><div class="followed_list_2_close" @click="showFocus2=false">关闭</div></div>' +
          '</div>'
        parentNode.insertBefore(newNode, nextChildNode)
        let monitorVue = new Vue({
          el: '#monitor',
          data() {
            return {
              focusList: [],
              liveCheckList: [],
              liveList: [],
              showFocus: false,
              showFocus2: false,
              showLive: false,
              gridClassName: null,
              hideClass: null,
              hideMonitor: false,
              contentTop: 0,
              isScale: false,
              currentLiveIndex: null,
              divLeft: null,
              divTop: null,
              isNight: false
            }
          },
          created() {
            this.getData()
            this.divLeft =
              document
                .querySelector('.category-wrapper')
                .querySelectorAll('div')[5].offsetLeft +
              100 +
              'px'
            this.divTop = document
              .querySelector('.category-wrapper')
              .querySelectorAll('div')[5].offsetTop + 20 + 'px'
          },
          methods: {
            async getData() {
              this.focusList = []
              let data = await fetch(
                'https://live.acfun.cn/api/channel/list?count=100&pcursor=&filters=[%7B%22filterType%22:3,+%22filterId%22:0%7D]'
              ).then((res) => {
                return res.json()
              })
              this.focusList = data.liveList
              for (let item of this.focusList) {
                item.checked = false
                item.src = 'https://live.acfun.cn/live/' + item.authorId
              }
            },
  
            checkLiver(index) {
              let item = this.focusList[index]
              item.checked = !item.checked
              this.focusList.splice(index, 1, item)
            },
  
            refresh() {
              this.getData()
            },
            startMonitor() {
              this.liveList = []
              let max
              for (let item of this.focusList) {
                if (item.checked) {
                  this.liveList.push(item)
                }
              }
              if (this.liveList.length > 16) {
                alert('最多不能超过16个房间')
                return
              }
              if (this.liveList.length === 0) {
                alert('请先选择主播')
                return
              }
  
              if (this.liveList.length <= 4) {
                this.gridClassName = 'grid4'
                max = 4
              }
              if (this.liveList.length <= 9 && this.liveList.length > 4) {
                this.gridClassName = 'grid9'
                max = 9
              }
              if (this.liveList.length > 9) {
                this.gridClassName = 'grid16'
                max = 16
              }
              while (this.liveList.length < 16) {
                this.liveList.push({ user: {} })
              }
              this.showLive = true
            },
            handelHideMonitor() {
              this.hideMonitor = true
              this.contentTop = 'calc(100% - 45px)'
            },
            backMonitor() {
              this.hideMonitor = false
              this.contentTop = 0
            },
            closeMonitor() {
              this.liveList = []
              this.showLive = false
            },
            scale(index) {
              let item = this.$refs.monitorContent.querySelectorAll(
                '.monitor_item'
              )[index]
              let _style = item.style
              if (!this.isScale) {
                _style.position = 'fixed'
                _style.width = '100vw'
                _style.height = '100vh'
                _style.left = 0
                _style.top = 0
                _style.zIndex = 1000
                item.querySelector('iframe').contentWindow.wideScreen()
                this.isScale = true
              } else {
                _style.position = 'relative'
                _style.width = null
                _style.height = null
                _style.left = null
                _style.top = null
                _style.zIndex = 100
  
                item.querySelector('iframe').contentWindow.webFullScreen()
                this.isScale = false
              }
            },
            closeItem(index) {
              this.liveList.splice(index, 1, { user: {} })
            },
            openItem(index) {
              this.currentLiveIndex = index
              this.showFocus2 = true
              this.getData()
            },
            selectItem(index) {
              let item = this.focusList[index]
              this.liveList.splice(this.currentLiveIndex, 1, item)
              this.showFocus2 = false
            },
  
            // 全部静音
            muteAll() {
              let nodes = this.$refs.monitorContent.querySelectorAll(
                '.monitor_item'
              )
              for (let node of nodes) {
                let _iframe = node.querySelector('iframe')
                if (_iframe) {
                  _iframe.contentWindow.mute()
                }
              }
            },
  
            //复制链接
            copyUrl(index) {
              let input = document.createElement('input')
              document.body.append(input)
              input.setAttribute('value', 'https://live.acfun.cn/live/' + this.liveList[index].authorId)
              input.select()
              document.execCommand('copy')
              input.remove()
            }
          },
        })
      }, 500)
  
      let style_2 = document.createElement('style')
      style_2.innerHTML =
        '.monitor_container{width: 100%; height: 100vh; display: flex; align-items: center; position: fixed; top: 0;left: 0;z-index: 1000; background: rgba(0,0,0,1); transition: all 0.4s;}' +
        '.monitor_content{width: 100%; height: 100vh; display: grid; }' +
        `.monitor_container.night{filter: brightness(${brightness});}` +
        '.monitor_content.grid4{ grid-template-columns: repeat(2, 1fr);grid-template-rows: repeat(auto-fill, minmax(50vh, auto));}' +
        '.monitor_content.grid9{ grid-template-columns: repeat(3, 1fr);grid-template-rows: repeat(auto-fill, minmax(33.3vh, auto));}' +
        '.monitor_content.grid16{ grid-template-columns: repeat(4, 25%);grid-template-rows: repeat(auto-fill, minmax(25vh, auto));}' +
        '.monitor_content.hide{top: 100%; margin-top: -30px;} ' +
        '.monitor_panel{position: absolute; z-index: 1000; left: 10px; top: 5px; width: 250px; height: 40px;line-height: 40px; border-radius: 20px; opacity: 0; background: #000; color: #fff; padding-left: 20px;}' +
        '.monitor_panel:hover{opacity: 1;}' +
        '.monitor_panel span{margin-right: 10px; cursor: pointer; display: inline-block;}' +
        '.monitor_item{ position: relative; transform-origin: 0% 0%; transition: all 0.3s; display:flex; justify-content: center;align-items:center;} .monitor_item p{display:none; positon:absolute;}' +
        '.monitor_item iframe{width: 100%;height: 100%}' +
        '.no_iframe{width: 180px; height: 100px; display: flex; justify-content: center; align-items:center; font-size: 18px; color:#fff; border-radius: 9px; border: 2px dashed #fff;}' +
        '.monitor_item p{width: 100%;height: 30px; box-sizing: border-box;display: none; animation: slideInBottom 0.2s; position: absolute; top: 0;left:0;color: #fff; padding: 0 12px; background: rgba(0,0,0,0.5); line-height: 30px; text-align: center; font-size: 16px;}' +
        '.monitor_item:hover p{display: block;}' +
        '.monitor_title {width: 50%; overflow: hidden; white-space:nowrap; text-overflow:ellipsis; display: inline-block;}' +
        '.monitor_url{position: absolute; top: 4px; right:100px;cursor: pointer; width: 22px; height: 22px;}' +
        '.monitor_close{position: absolute; top: 2px; right:60px;cursor: pointer} .monitor_scale{position: absolute; top: 2px; right:2%;cursor: pointer}' +
        '.followed_list{max-width: 90%; width: 1715px; margin: 0 auto; overflow:hidden; padding: 20px 0px; animation: slideInBottom 0.5s; animation-fill-mode:both;} ' +
        '.followed_list div{ float: left; width: 65px; height: 60px; overflow: hidden; }' +
        '.followed_list div img{width: 45px; height: 45px; border: 2px solid transparent; border-radius: 50%; display:block; margin: 0 auto; box-sizing: border-box; cursor:pointer;}' +
        '.followed_list div img.active{border: 2px solid red;}' +
        '.followed_list div p {font-size: 12px; color: #666; width: 100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;text-align: center; height: }' +
        '.focusBtn{position: absolute;top: 258px;left:40%; cursor: pointer;}' +
        '.focusBtn span{margin-left: 10px;}' +
        '.followed_list_2{position: fixed; z-index: 200;width: 408px; height: 300px; top: 50%; left: 50%; margin-left: -200px;margin-top: -150px;overflow: auto; background: #fff; border-radius: 10px; padding: 15px 20px;}' +
        '.followed_list_2_close{background: #fff; color: #999; width: 45px!important; height: 45px!important; margin: 10px;border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 1px solid #aaa;cursor: pointer;}' +
        '.open_live{display:inline-block; width: 80px; height: 22px; line-height: 22px; border-radius:4px; margin-left: 12px;text-align: center; background: #ec4556; color: #fff; cursor: pointer;}' +
        '@keyframes slideInBottom{from{transform:translateY(-50%);opacity:0;} to{transform:translateY(0);opacity:1;}}'
      document.body.append(style_2)
    }
  
    //如果是在iframe里面,则点击网页全屏
    if (window.parent.length > 0 && window.parent.location.href.indexOf('/live/') === -1) {
      function webFullScreen() {
        let fullScreenInterval = setInterval(() => {
          let btn = document.querySelector('.btn-fullscreen')
          if (btn) {
            clearInterval(fullScreenInterval)
            btn.click()
          }
        }, 1000)
      }
      webFullScreen()
      let style_inner = document.createElement('style')
      style_inner.innerHTML =
        '.wrap-input-area_2{position:fixed; width: 30%; min-width: 150px; height: 24px!important;left:160px;bottom: 3px; z-index:1000;opacity: 0;}' +
        '.wrap-input-area_2:hover{opacity: 0.8}' +
        '.wrap-input-area_2:focus{opacity: 0.8}' +
        '.wrap-input-area_2 .send-btn{height: 24px!important; line-height: 24px!important;}' +
        '.wrap-input-area_2 .input-area{height: 24px!important; }' +
        '.wrap-input-area_2 textarea{padding-top: 1px!important; padding-bottom: 0!important;}'
      document.body.append(style_inner)
      let addClassInterval = setInterval(() => {
        let area = document.querySelector('.wrap-input-area')
        if (area) {
          clearInterval(addClassInterval)
          area.classList.add('wrap-input-area_2')
        }
      }, 500)
      window.wideScreen = () => {
        console.log('宽屏')
        setTimeout(() => {
          document.querySelector('.btn-fullscreen').click()
          document.querySelector('.btn-film-model').click()
        }, 200)
      }
      window.webFullScreen = () => {
        console.log('网页全屏')
        document.querySelector('.btn-fullscreen').click()
      }
      window.mute = () => {
        if (
          document.querySelector('.volume').getAttribute('data-bind-attr') !==
          'muted'
        ) {
          document.querySelector('.volume-icon').click()
        }
      }
    }
    if (location.href.indexOf('/live/') !== -1) {
      //document.body.style.filter = 'brightness(30%)'
      let markEl = document.createElement('div')
      markEl.id = 'my_mark'
      markEl.innerHTML =
        '<div class="mark_icon" @click="showContent = !showContent">标注</div>' +
        '<div class="mark_container" v-show="showContent">' +
        '<div class="mark_content">' +
        '<div class="mark_item" v-for="(item, index) in list">' +
        '<span class="mark_uid"><a :href=`https://www.acfun.cn/u/${item.uid}` target="_blank">{{item.uid}}</a></span>' +
        '<span class="mark_name">{{item.name}}</span>' +
        '<span class="mark_del" @click="del(index)">删除</span>' +
        '</div>' +
        '</div>' +
        '<div class="mark_add"><input v-model.trim="uid" placeholder="输入UID"/><input v-model.trim="name" placeholder="输入备注"/><span @click="add">添加</span></div>' +
        '</div>'
      let copyUidEl = document.createElement('div')
      copyUidEl.id = 'copy_uid'
      copyUidEl.innerHTML = '<span @click="copy">复制uid</span>'
  
      let appendInterval = setInterval(() => {
        let containerEl = document.querySelector('.container-live-feed-messages')
        if (containerEl) {
          clearInterval(appendInterval)
          containerEl.append(markEl)
          initMark()
          document.querySelector('.user-information-head').append(copyUidEl)
          let style = document.createElement('style')
          style.innerHTML =
            '#my_mark{position: absolute; right: 10px; top: 4px; z-index: 99; width: 80px; height: 30px; z-index: 1000; text-align: right;}' +
            '.mark_icon{width: 80px; height: 20px; line-height: 20px;text-align: center; cursor:pointer; border-radius: 10px; background: #333; color: #fff; z-index: 1000;}' +
            '.mark_container{width: 220px; position: absolute; right:0; top: 30px; border-radius: 5px; border: 2px solid #aaa; background: #fff;}' +
            '.mark_content{width: 200px; height:300px;  margin: 0 auto; margin-top: 10px; overflow: auto;}' +
            '.mark_item{display: flex; height: 35px; justify-content: space-betweem; align-items:center;} .mark_item span{width: 42%; display: inline-block; text-align: left;} .mark_del{width: 20%; cursor: pointer; text-align:center!important;}' +
            '.mark_add{display: flex; height: 35px; align-items: center;} .mark_add input{width: 75px; margin-left: 10px; border:none; border-bottom: 1px solid #aaa; font-size: 12px;}' +
            '.mark_add span{color: #999; cursor: pointer; margin-left: 9px;}' +
            '..user-information-head{position: relative;}' +
            '#copy_uid{position: absolute; cursor: pointer; width: 80px; height: 35px; text-align: center; line-height: 35px; color: #666;}'
          document.body.append(style)
        }
      }, 500)
  
      function initMark() {
        let markVue = new Vue({
          el: '#my_mark',
          data() {
            return {
              list: [],
              uid: null,
              name: null,
              showContent: false
            }
          },
          created() {
            if (localStorage.markList) {
              this.list = JSON.parse(localStorage.markList) || []
            }
            if (this.list.length > 0) {
              let _style = document.createElement('style')
              let styleStr = ''
              for (let item of this.list) {
                styleStr += `.nickname[data-user-id="${item.uid}"]::before{content:"${item.name}"; padding: 1px 5px; display: inline; border-radius: 4px; background:#CC99CC; color: #fff; font-size: 10px; margin-right: 4px;}`
              }
              _style.innerHTML = styleStr
              document.body.append(_style)
            }
          },
          methods: {
            add() {
              if (!this.uid || !this.name) {
                return
              }
              this.list.push({
                uid: this.uid,
                name: this.name
              })
              let style = document.createElement('style')
              style.innerHTML = `.nickname[data-user-id="${this.uid}"]::before{content:"${this.name}"; padding: 1px 5px; display: inline; border-radius: 4px; background:#CC99CC; color: #fff; font-size: 10px; margin-right: 4px;}`
              document.body.append(style)
              this.save()
            },
            save() {
              localStorage.markList = JSON.stringify(this.list)
            },
            del(index) {
              this.list.splice(index, 1)
              this.save()
            }
          }
        })
      }
    }
  
  })()
  
  