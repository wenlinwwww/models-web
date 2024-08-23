import path from 'path'
import fs from 'fs'
import { setTimeout } from 'node:timers/promises'
import multer from 'multer'
import express from 'express'
// const { createProxyMiddleware } = require('http-proxy-middleware');
// import {createProxyMiddleware} from "http-proxy-middleware"
import proxy from 'express-http-proxy'
import bodyParser from 'body-parser'
import FormData from 'form-data'
import axios from 'axios'
import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import pkg from '../package.json'
import { formattedDate, isNotEmptyString } from './utils/is'
import { auth, authV2, regCookie, turnstileCheck, verify } from './middleware/auth'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import type { ChatMessage } from './chatgpt'
import type { RequestProps } from './types'
import { lumaProxy, viggleProxy, viggleProxyFileDo } from './myfun'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware';


const app = express()
const router = express.Router()


// const corsOptions = {
//   origin: 'http://localhost:1002',
//   credentials: true,
//   optionSuccessStatus: 200,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 允许的HTTP方法
//   allowedHeaders: ['Content-Type', 'Authorization', 'AccessToken', 'X-CSRF-Toke', 'X-Bdh5-Pf', 'X-XSRF-TOKEN'] // Content-Type,AccessToken,X-CSRF-Token,X-Bdh5-Pf,X-XSRF-TOKEN, Authorization
// };
// app.use(cors(corsOptions));

// const targetUrl = 'https://wenku.baidu.com/ndlaunch/browse/chat?isppt=1&fr=launch_ad&utm_source=360ss-WD&utm_medium=cpc&keyword=%E7%99%BE%E5%BA%A6%E6%96%87%E5%BA%93ai%E7%94%9F%E6%88%90ppt&utm_account=SS-360tg10&e_creative=%7Bcreative%7D&e_keywordid=63874449868&qhclickid=5aecea3b3523d264'
// const cookieInfo = `BAIDUID=4A41FE2601B18571A25A83D449A5FDCF:FG=1; BAIDUID_BFESS=4A41FE2601B18571A25A83D449A5FDCF:FG=1; BIDUPSID=4A41FE2601B18571A25A83D449A5FDCF; PSTM=1721011126; H_WISE_SIDS=110085_287281_299590_603326_298696_301025_307086_607111_277936_610009_611624_611731_612162_612273_613052_613178_613335_612825_613409_613597_612042_613729_613804_613814_613843_614174_614267_614250_613974_612560_614397_614464_614473_614482_609580_610631_614557_614690_614687_614684_614717_614662_614693_107317_309908_614853_614838_614889_614910_614874_614901_615141_615155_615162_613117_614206_615090_615214_615211_615076_613396_614509_615337; delPer=0; PSINO=6; H_WISE_SIDS_BFESS=110085_287281_299590_603326_298696_301025_307086_607111_277936_610009_611624_611731_612162_612273_613052_613178_613335_612825_613409_613597_612042_613729_613804_613814_613843_614174_614267_614250_613974_612560_614397_614464_614473_614482_609580_610631_614557_614690_614687_614684_614717_614662_614693_107317_309908_614853_614838_614889_614910_614874_614901_615141_615155_615162_613117_614206_615090_615214_615211_615076_613396_614509_615337; ZFY=THaROaP9B1Wzp9vw6jBe1yRDsYv78oWalHXl1Vkqb9U:C; __bid_n=190be83297587363111b86; ppfuid=FOCoIC3q5fKa8fgJnwzbE0LGziLN3VHbX8wfShDP6RCsfXQp/69CStRUAcn/QmhIlFDxPrAc/s5tJmCocrihdwitHd04Lvs3Nfz26Zt2holplnIKVacidp8Sue4dMTyfg65BJnOFhn1HthtSiwtygiD7piS4vjG/W9dLb1VAdqMruOyYxu8xgrK49GD5UPdKO0V6uxgO+hV7+7wZFfXG0MSpuMmh7GsZ4C7fF/kTgmsQivo9Wh9iv2los+eCYSHJXmeg4wf5A81zROpp0H1EClagEpCqJwKNm8tWtlSmdWzpJIFqcvNsRYzITz5PyOAD6RLDT+sXOPQ6ovNaw3n8P6JLwMdIdH+eEAlE3PHwsfIZaGhxes+nljx68Dx7ernRxeDM7aocuFnQS4h0xnG4pE/WJ55Gs3+xxEcHQQ/Dyc+ZopDH1un01VZ7zgV0+2zu2dM1L+ksxZx66zR7vnv9Q4QgHNs9HCEXLj3Bz4j2DH7IXnnIkSO22UutZs8Cyb0+eFyFpJLbuE2Ollwun8iq6JNWXKEnclcLqTPRA3jp4GDPet50Oih4uyDXUyaEPuN9BpZHky2Yj2fALghfj4C/EW54uLQIZoMhD5C2+JQ+FfogXvsPLrJlgOz1iIuKhLkhwmkHhtsrGRmvxl+1VgMpaw86NO91Qk+N2PKwW9QcHibEQQPYQGiB5bg+LsvIyi0bxsC3jnEtpfJM6vkhymV4DYbaofyv+mwquzxzDPy+dpoZqj4cFtwDdJ/UZaa6iAMtisimJ3hrQNG5R+IDl9S7UYJMRFyg8+nLMfB31RGYaljpaT6TUCpvQ9xOTkVMtm/r9+JIpQ6nVWxL4vL34i6mfzL4hLXcGAwm/blGCaj2qqkwKFzcz5wicgeYe5KUcB7Qdi36YSaLVnR8As1K4/M+RTUbXx9qY4B+kn9/t6Bjw8U+qVKCNpXr/HlvvyColAwGD/nEfgSBvjT2a7NPNwgUKnVl9KhxLeGsCR+72cxTpC478kPAMjtk2v8n8tGs9j98Rk//Dw3a1TfmjGWx6rUtaA+7pe20aBIMPerN5P6KgZGVWGjCp19HVoeRO1Z4akUiKdupxdT9Ph/aEsgj0PeDz0v/+7oFdP43WH8/yNbq39fJqQA0exMUrIO10QD+SrSnsAxZcQj0QVA8Ykq/QiOmr+mKXGE5xNIW8Iw/diI0ndER3/pwrvlTq5hwCEmlBswCaBlWKRYDYpyNtk2HLyTiSNXc0gJM1l3KZvmbCV9xymwPZhAa17TBqfaI4NEN7g9S; bce-sessionid=001c626dbfdd4aa4043b2425ba081e558b1; H_PS_PSSID=60274_60521_60565_60360; jsdk-uuid=171bc724-6335-407b-8673-cb4dc6cfaee7; Hm_lvt_d8bfb560f8d03bbefc9bdecafc4a4bf6=1721783018,1722908651,1723079261; HMACCOUNT=38CA17486D885223; RT="z=1&dm=baidu.com&si=6dd0e8be-7bcb-48a9-9e10-7b0d40e3587d&ss=lzs52z3d&sl=f&tt=9ed&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=1iq44&nu=5dr2ycr8&cl=1j04y&ul=1j056&hd=1j07q"; BDUSS=RkQXc2TUMzbFA4d1RNbHVQZUJkSlRZdTBRbTJrOU9jR21QZVpHc0I4ckZoLU5tSVFBQUFBJCQAAAAAAAAAAAEAAAA2swsxtcKx8zE5ODAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMX6u2bF-rtmT0; BDUSS_BFESS=RkQXc2TUMzbFA4d1RNbHVQZUJkSlRZdTBRbTJrOU9jR21QZVpHc0I4ckZoLU5tSVFBQUFBJCQAAAAAAAAAAAEAAAA2swsxtcKx8zE5ODAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMX6u2bF-rtmT0; Hm_lpvt_d8bfb560f8d03bbefc9bdecafc4a4bf6=1723595464; SEARCH_MARKET_URL=http%3A//wenku.baidu.com/ndlaunch/browse/chat%3Fisppt%3D1%26fr%3Dlaunch_ad%26utm_source%3D360ss-WD%26utm_medium%3Dcpc%26keyword%3D%25E7%2599%25BE%25E5%25BA%25A6%25E6%2596%2587%25E5%25BA%2593ai%25E7%2594%259F%25E6%2588%2590ppt%26utm_account%3DSS-360tg10%26e_creative%3D%257Bcreative%257D%26e_keywordid%3D63874449868%26qhclickid%3D5aecea3b3523d264; ab_sr=1.0.1_Mjc5OGQ5OGQwMzQzNzZmZmVlYzZiMTc4MjNhYjdmYTRiMTdiNTY0MDQxMWU5ODhkNmZkZGIyMjk2YmRiZjZmNThmYThjNzk1NmIxOTMwYjIzMTNiOGE3ZDI3MjE2MmY0MWQzYzMwZDUwZDBmZTE1MzEzNTM5OTBmYTdmMjJkNGU4ZTE0MGM2Njg1MDJiMTkwNzI0MTY4ZTFkZDhlYTU0ZjJmZmY5ZTRlNzk5ZDJhM2VhZDE2YTFkYWRjYzQxODYw`
// const cookieInfo = 'BAIDUID=4A41FE2601B18571A25A83D449A5FDCF:FG=1; BDUSS=RkQXc2TUMzbFA4d1RNbHVQZUJkSlRZdTBRbTJrOU9jR21QZVpHc0I4ckZoLU5tSVFBQUFBJCQAAAAAAAAAAAEAAAA2swsxtcKx8zE5ODAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMX6u2bF-rtmT0'

app.use(express.static('public', {
  // 设置响应头，允许带有查询参数的请求访问静态文件
  setHeaders: (res, path, stat) => {
    res.set('Cache-Control', 'public, max-age=1')
  },
}))
// app.use(express.json())
app.use(bodyParser.json({ limit: '10mb' })) // 大文件传输

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', authV2, async (req, res) => { // [authV2, limiter]
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    const isUpload = isNotEmptyString(process.env.API_UPLOADER)
    const isHideServer = isNotEmptyString(process.env.HIDE_SERVER)
    const amodel = process.env.OPENAI_API_MODEL ?? 'gpt-3.5-turbo'
    const isApiGallery = isNotEmptyString(process.env.MJ_API_GALLERY)
    const cmodels = process.env.CUSTOM_MODELS ?? ''
    const baiduId = process.env.TJ_BAIDU_ID ?? ''
    const googleId = process.env.TJ_GOOGLE_ID ?? ''
    const notify = process.env.SYS_NOTIFY ?? ''
    const disableGpt4 = process.env.DISABLE_GPT4 ?? ''
    const isUploadR2 = isNotEmptyString(process.env.R2_DOMAIN)
    const isWsrv = process.env.MJ_IMG_WSRV ?? ''
    const uploadImgSize = process.env.UPLOAD_IMG_SIZE ?? '1'
    const gptUrl = process.env.GPT_URL ?? ''
    const theme = process.env.SYS_THEME ?? 'dark'
    const isCloseMdPreview = !!process.env.CLOSE_MD_PREVIEW
    const uploadType = process.env.UPLOAD_TYPE
    const turnstile = process.env.TURNSTILE_SITE
    const menuDisable = process.env.MENU_DISABLE ?? ''
    const visionModel = process.env.VISION_MODEL ?? ''
    const systemMessage = process.env.SYSTEM_MESSAGE ?? ''
    const customVisionModel = process.env.CUSTOM_VISION_MODELS ?? ''
    const isHk = (process.env.OPENAI_API_BASE_URL ?? '').toLocaleLowerCase().indexOf('-hk') > 0

    const data = {
      disableGpt4,
      isWsrv,
      uploadImgSize,
      theme,
      isCloseMdPreview,
      uploadType,
      notify,
      baiduId,
      googleId,
      isHideServer,
      isUpload,
      auth: hasAuth,
      model: currentModel(),
      amodel,
      isApiGallery,
      cmodels,
      isUploadR2,
      gptUrl,
      turnstile,
      menuDisable,
      visionModel,
      systemMessage,
      customVisionModel,
      isHk,
    }
    res.send({ status: 'Success', message: '', data })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', verify)
router.get('/reg', regCookie)

const API_BASE_URL = isNotEmptyString(process.env.OPENAI_API_BASE_URL)
  ? process.env.OPENAI_API_BASE_URL
  : 'https://api.openai.com'

app.use('/mjapi', authV2, proxy(process.env.MJ_SERVER ? process.env.MJ_SERVER : 'https://api.openai.com', {
  https: false,
  limit: '10mb',
  proxyReqPathResolver(req) {
    return req.originalUrl.replace('/mjapi', '') // 将URL中的 `/mjapi` 替换为空字符串
  },
  proxyReqOptDecorator(proxyReqOpts, srcReq) {
    if (process.env.MJ_API_SECRET)
      proxyReqOpts.headers['mj-api-secret'] = process.env.MJ_API_SECRET
    proxyReqOpts.headers['Content-Type'] = 'application/json'
    proxyReqOpts.headers['Mj-Version'] = pkg.version
    return proxyReqOpts
  },
  // limit: '10mb'

}))

// 设置存储引擎和文件保存路径
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadFolderPath = `./uploads/${formattedDate()}/`// `

    // console.log('dir', __dirname   ) ;

    if (!fs.existsSync('./uploads/'))
      fs.mkdirSync('./uploads/')

    if (!fs.existsSync(uploadFolderPath))
      fs.mkdirSync(uploadFolderPath)

    cb(null, `uploads/${formattedDate()}/`)
  },
  filename(req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname)
    console.log('file', filename)
    cb(null, filename)
  },
})
const upload = multer({ storage })

const storage2 = multer.memoryStorage()
const upload2 = multer({ storage: storage2 })

// 处理文件上传的路由
const isUpload = isNotEmptyString(process.env.API_UPLOADER)
if (isUpload) {
  if (process.env.FILE_SERVER) {
    app.use('/openapi/v1/upload',
      upload2.single('file'),
      async (req, res, next) => {
        // console.log( "boday",req.body ,  req.body.model );
        if (req.file.buffer) {
          const fileBuffer = req.file.buffer
          const formData = new FormData()
          formData.append('file', fileBuffer, { filename: req.file.originalname })
          // formData.append('model',  req.body.model );
          try {
            const url = process.env.FILE_SERVER
            const responseBody = await axios.post(url, formData, {
              headers: {
                // Authorization: 'Bearer '+ process.env.OPENAI_API_KEY ,
                'Content-Type': 'multipart/form-data',
              },
            })

            res.json(responseBody.data)
          }
          catch (e) {
            res.status(400).json({ error: e })
          }
        }
        else {
          res.status(400).json({ error: 'uploader fail' })
        }
      },
    )
  }
  else {
    app.use('/openapi/v1/upload', authV2, upload.single('file'), (req, res) => {
    // res.send('文件上传成功！');
      res.setHeader('Content-type', 'application/json')
      if (req.file.filename)
        res.json({ url: `/uploads/${formattedDate()}/${req.file.filename}`, created: Date.now() })
      else res.json({ error: 'uploader fail', created: Date.now() })
    })
  }
}
else {
  app.use('/openapi/v1/upload', (req, res) => {
    // res.send('文件上传成功！');
    res.json({ error: 'server is no open uploader ', created: Date.now() })
  })
}
app.use('/uploads', express.static('uploads'))

// R2Client function
const R2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_KEY_ID
  const accessKeySecret = process.env.R2_KEY_SECRET
  const endpoint = new AWS.Endpoint(`https://${accountId}.r2.cloudflarestorage.com`)
  const s3 = new AWS.S3({
    endpoint,
    region: 'auto',
    credentials: new AWS.Credentials(accessKeyId, accessKeySecret),
    signatureVersion: 'v4',
  })
  return s3
}

// cloudflare R2 upload
app.post('/openapi/pre_signed', (req, res) => {
  const bucketName = process.env.R2_BUCKET_NAME
  const domain = process.env.R2_DOMAIN
  const s3 = R2Client()
  const fileName = uuidv4()
  const saveFile = `${new Date().toISOString().split('T')[0]}/${fileName}${req.body.file_name}`

  const params = {
    Bucket: bucketName,
    Key: saveFile,
    ContentType: req.body.ContentType,
    Expires: 60 * 60, // 1 hour
  }

  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      res.status(500).json({
        status: 'Error',
        message: `Couldn't get presigned URL for PutObject: ${err.message}`,
      })
      return
    }

    res.json({
      status: 'Success',
      message: '',
      data: {
        up: url,
        url: `${domain}/${saveFile}`,
      },
    })
  })
})

app.use(
  '/openapi/v1/audio/transcriptions', authV2,
  upload2.single('file'),
  async (req, res, next) => {
    // console.log( "boday",req.body ,  req.body.model );
    if (req.file.buffer) {
      const fileBuffer = req.file.buffer
      const formData = new FormData()
      formData.append('file', fileBuffer, { filename: req.file.originalname })
      formData.append('model', req.body.model)
      try {
        const url = `${API_BASE_URL}/v1/audio/transcriptions`
        const responseBody = await axios.post(url, formData, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
            'Mj-Version': pkg.version,
          },
        })
        // console.log('responseBody', responseBody.data  );
        res.json(responseBody.data)
      }
      catch (e) {
        // console.log('goog',e );
        res.status(400).json({ error: e })
      }
    }
    else {
      res.status(400).json({ error: 'uploader fail' })
    }
  },
)

// 代理openai 接口
app.use('/openapi', authV2, turnstileCheck, proxy(API_BASE_URL, {
  https: false,
  limit: '10mb',
  proxyReqPathResolver(req) {
    return req.originalUrl.replace('/openapi', '') // 将URL中的 `/openapi` 替换为空字符串
  },
  proxyReqOptDecorator(proxyReqOpts, srcReq) {
    proxyReqOpts.headers.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`
    proxyReqOpts.headers['Content-Type'] = 'application/json'
    proxyReqOpts.headers['Mj-Version'] = pkg.version
    return proxyReqOpts
  },
  // limit: '10mb'
}))

// 代理sunoApi 接口
app.use('/sunoapi', authV2, proxy(process.env.SUNO_SERVER ?? API_BASE_URL, {
  https: false,
  limit: '10mb',
  proxyReqPathResolver(req) {
    return req.originalUrl.replace('/sunoapi', '') // 将URL中的 `/openapi` 替换为空字符串
  },
  proxyReqOptDecorator(proxyReqOpts, srcReq) {
    // mlog("sunoapi")
    if (process.env.SUNO_KEY)
      proxyReqOpts.headers.Authorization = `Bearer ${process.env.SUNO_KEY}`
    else proxyReqOpts.headers.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`
    proxyReqOpts.headers['Content-Type'] = 'application/json'
    proxyReqOpts.headers['Mj-Version'] = pkg.version
    return proxyReqOpts
  },

}))

// 代理luma 接口
app.use('/luma', authV2, lumaProxy)
app.use('/pro/luma', authV2, lumaProxy)

// 代理 viggle 文件
app.use('/viggle/asset', authV2, upload2.single('file'), viggleProxyFileDo)
app.use('/pro/viggle/asset', authV2, upload2.single('file'), viggleProxyFileDo)
// 代理 viggle
app.use('/viggle', authV2, viggleProxy)
app.use('/pro/viggle', authV2, viggleProxy)

// app.use('/ppt', proxy(targetUrl, {
//   proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//     console.log('Proxying request to:', proxyReqOpts.method, proxyReqOpts.path);
//     console.log('Request Headers Before Adding Cookie:', JSON.stringify(proxyReqOpts.headers, null, 2));

//     // 动态设置CORS头部
//     const origin = srcReq.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//       proxyReqOpts.headers['Access-Control-Allow-Origin'] = origin;
//     }
    
//     // 添加cookie
//     proxyReqOpts.headers['cookie'] = cookieInfo;

//     console.log('Request Headers After Adding Cookie:', JSON.stringify(proxyReqOpts.headers, null, 2));

//     return proxyReqOpts;
//   },
//   userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
//     // 设置CORS响应头
//     const origin = userReq.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//       userRes.setHeader('Access-Control-Allow-Origin', origin);
//       userRes.setHeader('Access-Control-Allow-Credentials', 'true');
//       userRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//       userRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     }

//     // 处理 Set-Cookie 头，添加 HttpOnly; Secure; SameSite=None
//     if (proxyRes.headers['set-cookie']) {
//       const cookies = proxyRes.headers['set-cookie'].map(cookie =>
//         cookie.replace(/Expires=[^;]+;/, 'Expires=Wed, 01 Jan 2025 00:00:00 GMT;') // 更改过期时间
//               .replace(/;\s*HttpOnly/i, '') // 先移除已有的 HttpOnly
//               .replace(/;\s*Secure/i, '')   // 移除已有的 Secure
//               .replace(/;\s*SameSite=None/i, '') // 移除已有的 SameSite=None
//               + '; HttpOnly; Secure; SameSite=None' // 添加 HttpOnly, Secure, SameSite=None
//       );
//       userRes.setHeader('Set-Cookie', cookies);
//       console.log('Set cookie:', cookies);
//     }

//     if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
//       const newLocation = proxyRes.headers.location.replace(targetUrl, 'http://localhost:3002/ppt');
//       console.log('Redirecting to:', newLocation);
//       return Buffer.from(proxyResData.toString().replace(proxyRes.headers.location, newLocation));
//     }

//     console.log('Response Headers:', JSON.stringify(proxyRes.headers, null, 2));
//     console.log('Response Status:', proxyRes.statusCode);
    
//     return proxyResData;
//   },
//   onProxyReq: (proxyReq, req, res) => {
//     proxyReq.setHeader('cookie', cookieInfo);
//   },
// }));


app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
