# StarPlay iOS shell

This Capacitor shell consumes the compiled shared interface in www. It is not an independently edited frontend. renderer-assets.json and the standalone verifier bind the packaged index, JavaScript and CSS to their source provenance. Keep the separately updated live playlist intact.

## Mac build

First verify the supplied resources with `node scripts/verify-web-assets.mjs www`. On a Mac with the required Xcode and Node environment, install dependencies with `npm install`, generate a missing native project with `npx cap add ios`, then run `npx cap sync ios`. Open the generated Xcode workspace to configure your signing team, build and test. Package version and buildNumber are owned by package.json.

The existing .github/workflows/ios-ipa.yml also generates and builds the native project, verifying resources before compilation. Its IPA artifact is unsigned and needs an appropriate signing/install process. Keeping this workflow in the source does not mean it was run, and resource verification on Windows is not an Xcode build.

## Platform boundary

CMS/subscription requests use CapacitorHttp. Native HLS is selected by media capability, including extensionless playlists marked as HLS. Browser deployments instead use the Node companion; a native app must not call nonexistent local /api routes. Device capabilities that are not implemented are reported as unavailable rather than successful.

Actual iPhone/iPad acceptance must cover network permissions and redirects, playback/seeking/fullscreen, saved history after restart, backup file selection and screenshot persistence. This handoff contains source and renderer resources, not a newly verified IPA.
