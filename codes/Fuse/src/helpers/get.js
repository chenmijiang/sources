import {
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isArray,
  toString
} from './types'

/**
 * 获取对象的值
 * @param {Object} obj - 对象
 * @param {string|Array} path - 路径
 * @returns {string|Array} - 获取到的值
 */
export default function get(obj, path) {
  // 存储获取到的值
  let list = []
  // 标记是否遇到数组
  let arr = false

  const deepGet = (obj, path, index) => {
    // 如果对象未定义则返回
    if (!isDefined(obj)) {
      return
    }
    // 如果路径索引不存在,说明已经到达目标对象
    if (!path[index]) {
      list.push(obj)
    } else {
      let key = path[index]

      const value = obj[key]

      // 如果值未定义则返回
      if (!isDefined(value)) {
        return
      }

      // 如果是路径的最后一个值,且是字符串/数字/布尔值,
      // 则将其转换为字符串后添加到列表中
      if (
        index === path.length - 1 &&
        (isString(value) || isNumber(value) || isBoolean(value))
      ) {
        list.push(toString(value))
      } else if (isArray(value)) {
        // 如果值是数组,设置arr标记为true
        arr = true
        // 遍历数组中的每一项,递归获取值
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path, index + 1)
        }
      } else if (path.length) {
        // 如果是对象,则继续递归
        deepGet(value, path, index + 1)
      }
    }
  }

  // 为了向后兼容(path之前是字符串类型)
  // 如果path是字符串则按点分割,否则直接使用path数组
  deepGet(obj, isString(path) ? path.split('.') : path, 0)

  // 如果遇到过数组则返回整个列表,否则返回第一个元素
  return arr ? list : list[0]
}
