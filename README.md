# StarPlay iOS (Capacitor 壳 + GitHub Actions 构建)

Windows 上无法本地编译 iOS 应用。这个工程把 **StarPlay 的 Web 渲染层**装进 Capacitor iOS 壳，
由 **GitHub Actions 的 macOS runner 免费编译**出真正的 `.ipa`（未签名，需自签安装）。

## 结构

```
ios/
├── package.json            # Capacitor 依赖
├── capacitor.config.ts     # appId com.starplay.ios
├── www/                    # ← StarPlay 的 dist-renderer 内容（构建时放入）
├── web-dist/               # 可选：直接放 windows-app/dist-renderer 的副本
└── .github/workflows/build-ipa.yml
```

## 用法

1. 把 StarPlay 的渲染层拷进来：
   ```powershell
   Copy-Item -Recurse starplay\windows-app\dist-renderer\* starplay\ios\web-dist\
   ```
2. 推到 GitHub（任意仓库）：
   ```bash
   cd starplay/ios
   git init && git add -A && git commit -m "StarPlay iOS"
   git remote add origin https://github.com/<USER>/StarPlay-iOS.git
   git push -u origin main
   ```
3. Actions 自动在 macOS runner 上：
   - `npx cap add ios` 生成 Xcode 工程
   - `xcodebuild` 编译 Release（CODE_SIGNING_ALLOWED=NO）
   - 打包 `StarPlay-unsigned.ipa` 上传 artifact
4. 下载 artifact 里的 ipa → 爱思助手/AltStore 用自己的 Apple ID 自签安装

## 已知限制

- **CORS**：iOS WebView 里 hls.js 拉跨域 m3u8 会受限。PWA 版的 `/api/proxy` 在 ipa 里不存在 —— 需要在 Capacitor 里注册自定义 scheme handler，或改走原生 HLS（`video.src = m3u8`，iOS WKWebView 支持但需 http 域允许）。
- 首次构建可能因 `npx cap add ios` 与 Xcode 版本差异失败，workflow 已加 `|| true` 兜底并重试。
- 未签名 ipa 不能直接装，必须自签（免费 Apple ID 7 天）。

## 与 PWA 的关系

PWA（`http://<PC-IP>:5720`）是**现在就能用**的形态。这个 ipa 工程是**「要安装包」的正式形态**，
两者共用同一份 Web 渲染代码。
