import Vue from 'vue'
import MOMENT from 'moment'
import ACCOUNT from 'accounting'

Vue.prototype.$getUUID = (len, radix) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  radix = radix || chars.length
  len = len || 32
  for (let i = 0; i < len; i++) {
    uuid[i] = chars[0 | (Math.random() * radix)]
  }
  return uuid.join('')
}

/* 时间转化 */
Vue.prototype.$formatDate = (date) => {
  return MOMENT(date).format('YYYY-MM-DD HH:mm:ss')
}


/* account */
Vue.prototype.$accounting = ACCOUNT

/* 过滤器 */
/* 日期过滤 */
Vue.filter('dateFormat', (value) => {
  if (value) return MOMENT(value).format('YYYY-MM-DD')
  else return ''
})
Vue.filter('dateYearFormat', (value) => {
  if (value) return MOMENT(value).format('YYYY')
  else return ''
})
/* 时间过滤 */
Vue.filter('dateTimeFormat', (value) => {
  if (value) return MOMENT(value).format('YYYY-MM-DD HH:mm:ss')
  else return ''
})

/* 时间过滤 */
Vue.filter('fileSizeFormat', (value) => {
  var fileSizeByte = parseFloat(value)
  var fileSizeMsg = ''
  if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + 'KB'
  else if (fileSizeByte === 1048576) fileSizeMsg = '1MB'
  else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + 'MB'
  else if (fileSizeByte > 1048576 && fileSizeByte === 1073741824) fileSizeMsg = '1GB'
  else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  else fileSizeMsg = '文件超过1TB'
  return fileSizeMsg
})

Vue.prototype.$hexColor = (color) => {
  if (color == 'none') return color
  const reg = /[0-9]\d+/g
  const getArr = color.match(reg)
  const hexStr = '#' + ((getArr[0] << 16) | (getArr[1] << 8) | getArr[2]).toString(16)
  return hexStr
}

// 对象解绑定
Vue.prototype.$deepCopy = function(data) {
  return JSON.parse(JSON.stringify(data))
}

// 判空 方法
Vue.prototype.$isEmpty = p => {
  if (p === '' || p === undefined || p === null || p === 'undefined') return true
  if (typeof p === 'number' && Number.isNaN(p)) return true
  if (typeof p === 'object' && (JSON.stringify(p) === '[]' || JSON.stringify(p) === '{}')) return true
  return false
}

// 不为空 方法
Vue.prototype.$isNotEmpty = p => {
  return !Vue.prototype.$isEmpty(p)
}

// 读取文件
Vue.prototype.$loadFile = function(name) {
  const xhr = new XMLHttpRequest()
  const okStatus = document.location.protocol === 'file:' ? 0 : 200
  xhr.open('GET', name, false)
  xhr.overrideMimeType('text/html;charset=utf-8')// 默认为utf-8
  xhr.send(null)
  const returnStr = xhr.status === okStatus ? xhr.responseText : ''
  returnStr.replace(/\\/g, '%')
  return unescape(returnStr)
}



// 为 string 类增加 toObject 工具
String.prototype.$toObject = function() {
  let obj = {}
  try {
    obj = JSON.parse(this)
    obj.toString = function() {
      return JSON.stringify(this)
    }
  } catch (err) {
    console.log(err.message)
  }
  return obj
}

Vue.prototype.$toStr = function(obj) {
  if (undefined != obj) {
    return JSON.stringify(obj)
  } else {
    return ''
  }
}
