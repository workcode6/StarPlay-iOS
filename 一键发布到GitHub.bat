@echo off
chcp 65001 > nul
title StarPlay iOS - 一键发布到 GitHub
setlocal EnableDelayedExpansion

echo.
echo   ============================================================
echo    星映 StarPlay  iOS ipa 自动构建 - 一键发布
echo   ============================================================
echo.
echo   这个脚本会：
echo     1. 把 StarPlay 的 iOS 工程推到你的 GitHub
echo     2. GitHub 的免费 macOS 机器自动编译出真正的 ipa
echo     3. 5-10 分钟后在 Actions 页面下载
echo.
echo   需要你做的：只有一次 GitHub 登录授权（会弹窗）。
echo.
pause

cd /d "%~dp0"

echo.
set /p GHUSER=请输入你的 GitHub 用户名（例如 workcode6）: 
if "%GHUSER%"=="" (
  echo [!] 用户名不能为空
  pause
  exit /b 1
)

set REPO=StarPlay-iOS
set REMOTE=https://github.com/%GHUSER%/%REPO%.git

echo.
echo   [1/5] 检查仓库是否存在...
curl -s -o nul -w "%%{http_code}" "https://api.github.com/repos/%GHUSER%/%REPO%" > "%TEMP%\sp_status.txt"
set /p STATUS=<"%TEMP%\sp_status.txt"
del "%TEMP%\sp_status.txt" 2>nul

if "!STATUS!"=="200" (
  echo        仓库已存在，直接推送
) else (
  echo        仓库不存在，请先创建：
  echo.
  echo          浏览器已打开建仓页面
  echo          仓库名填：%REPO%
  echo          勾选 "Add a README file"
  echo          点 Create repository，然后回到这里按任意键
  echo.
  start "" "https://github.com/new?name=%REPO%&description=StarPlay+iOS"
  pause
)

echo.
echo   [2/5] 初始化 git 仓库...
if not exist ".git" (
  git init -q
  git branch -M main
  echo        已初始化
) else (
  echo        已存在 .git，跳过
)

echo.
echo   [3/5] 添加文件...
git add -A
git -c user.name="%GHUSER%" -c user.email="%GHUSER%@users.noreply.github.com" commit -q -m "StarPlay iOS: Capacitor shell + GitHub Actions ipa build" 2>nul
if errorlevel 1 (echo        无新变更或提交失败，继续) else (echo        已提交)

echo.
echo   [4/5] 设置远程仓库...
git remote remove origin 2>nul
git remote add origin %REMOTE%
echo        %REMOTE%

echo.
echo   [5/5] 推送（会弹出 GitHub 登录窗口，点授权即可）...
echo.
git push -u origin main
if errorlevel 1 (
  echo.
  echo   [!] 推送失败。常见原因：
  echo       - 弹窗被取消：重新运行本脚本再试一次
  echo       - 仓库没建：先按提示去 github.com/new 建
  echo       - 用户名打错：重新运行
  echo.
  pause
  exit /b 1
)

echo.
echo   ============================================================
echo                      推送成功！
echo   ============================================================
echo.
echo   GitHub 正在 macOS 机器上编译 ipa，约 5-10 分钟。
echo.
echo   查看进度和下载：
echo     https://github.com/%GHUSER%/%REPO%/actions
echo.
echo   编译完成后：
echo     Actions -^> 最新一次运行 -^> 底部 Artifacts -^> StarPlay-ipa
echo     下载后得到 StarPlay-unsigned.ipa
echo.
echo   安装到 iPad：
echo     爱思助手 -^> 工具箱 -^> IPA 签名安装 -^> 选这个 ipa
echo     用自己的 Apple ID 签名，7 天有效（或付费开发者 1 年）
echo.
start "" "https://github.com/%GHUSER%/%REPO%/actions"
pause