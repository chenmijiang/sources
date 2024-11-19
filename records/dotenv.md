# dotenv

[dotenv](https://github.com/motdotla/dotenv) 是一个非常流行的环境变量管理工具。

## 核心功能

- 从 `.env` 文件加载环境变量
- 支持加密的 `.env.vault` 文件
- 将环境变量解析并注入到 `process.env` 中

## 主要函数

- `parse()`: 解析 `.env` 文件内容，将其转换为对象
- `config()`: 主要入口函数，负责加载环境变量
- `configDotenv()`: 处理普通的 `.env` 文件
- `_configVault()`: 处理加密的 `.env.vault` 文件
- `decrypt()`: 解密加密的环境变量
- `populate()`: 将解析后的变量注入到 `process.env` 中

## 特殊功能

- 支持多个 `.env` 文件路径
- 支持加密存储（使用 AES-256-GCM 加密）
- 支持密钥轮换（通过逗号分隔的多个密钥）
- 支持自定义编码
- 提供调试日志功能

## 安全特性

- 支持加密的 vault 文件
- 密钥验证和错误处理
- 环境变量覆盖控制

## 配置选项

- `path`: 自定义 `.env` 文件路径
- `encoding`: 文件编码
- `debug`: 调试模式
- `override`: 是否覆盖已存在的环境变量
- `DOTENV_KEY`: 用于解密的密钥

## 使用示例

```js
import dotenv from 'dotenv'

dotenv.config()
```

## 执行流程解析

1. 入口点: 首先从 `config()` 函数开始

```js
function config (options) {
  // 检查是否设置了 DOTENV_KEY（用于加密场景）
  if (_dotenvKey(options).length === 0) {
    // 如果没有设置加密密钥，走普通的 .env 加载流程
    return DotenvModule.configDotenv(options)
  }
  // ... 加密相关的代码 ...
}
```

2. 主要加载流程 `configDotenv`:

```js
function configDotenv (options) {
  // 默认在当前工作目录下找 .env 文件
  const dotenvPath = path.resolve(process.cwd(), '.env')
  let encoding = 'utf8'

  // 确定要加载的文件路径
  let optionPaths = [dotenvPath] // 默认是 .env
  if (options && options.path) {
    if (!Array.isArray(options.path)) {
      optionPaths = [_resolveHome(options.path)]
    } else {
      optionPaths = []
      for (const filepath of options.path) {
        optionPaths.push(_resolveHome(filepath))
      }
    }
  }

  // 遍历所有路径，读取并解析文件
  const parsedAll = {}
  for (const path of optionPaths) {
    try {
      // 1. 读取文件
      // 2. 解析内容
      const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }))
      // 3. 添加到结果对象
      DotenvModule.populate(parsedAll, parsed, options)
    } catch (e) {
      // ... 错误处理 ...
    }
  }

  // 注入到 process.env
  DotenvModule.populate(processEnv, parsedAll, options)
}
```

3. 解析过程 `parse`:

```js
function parse (src) {
  const obj = {}
  let lines = src.toString()

  // 正则表达式匹配每一行
  // 格式可以是: KEY=value 或 export KEY=value
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]
    let value = (match[2] || '').trim()

    // 处理引号
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')
    
    // 处理特殊字符（如果是双引号包裹的值）
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    obj[key] = value
  }
  return obj
}
```

4. 注入环境变量 `populate`:

```js
function populate (processEnv, parsed, options = {}) {
  const override = Boolean(options && options.override)

  // 遍历解析后的对象，设置到 process.env
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      // 如果环境变量已存在
      if (override === true) {
        processEnv[key] = parsed[key]  // 覆盖
      }
    } else {
      processEnv[key] = parsed[key]    // 新增
    }
  }
}
```

### 流程总结

1. 调用 `config()`
2. 确定 .env 文件位置（默认是当前目录的 .env）
3. 读取文件内容
4. 解析内容
5. 注入到 `process.env`
6. 返回解析结果
