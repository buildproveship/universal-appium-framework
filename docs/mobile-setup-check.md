# Mobile setup check

This implements [RRDMOBILE-9](https://noisegatemusicstudios.atlassian.net/browse/RRDMOBILE-9)
with the official tools instead of a custom script (owner decision UA2-01, 19 Nov 2026).
Nothing here starts a test session. A passing check is not mobile readiness: running the
suites on a real device or simulator stays separate and **NOT VERIFIED** here.

| Need                                              | Tool                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| Node version                                      | `engines` in `package.json` with `engine-strict=true` in `.npmrc`   |
| Declared, locked and installed dependencies agree | `npm ls --all` (`npm run setup:check`)                              |
| Android SDK, JDK and driver                       | `appium driver doctor uiautomator2` (`npm run setup:check:android`) |
| iOS Xcode and driver                              | `appium driver doctor xcuitest` (`npm run setup:check:ios`)         |
| App path is an `.apk` file or an `.app` directory | `npm run setup:check:app -- <path>` (`scripts/check-app-path.ts`)   |

Install the drivers first with `npm run appium:drivers:android` or `npm run appium:drivers:ios`.
Each command exits non-zero on failure, so it works in scripts. The app-path check only reads file
metadata: it does not open, unpack, sign or install the app.

The offline test for the app-path check is `npm run test:setup`.
The earlier custom preflight and its RRDMOBILE-9 scenario trace are in
[docs/history](history/rrdmobile-9-preflight.md).
