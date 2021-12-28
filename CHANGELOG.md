# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.1.2](https://github.com/MapColonies/discrete-ingestion-db/compare/v3.1.1...v3.1.2) (2021-12-28)

### [3.1.1](https://github.com/MapColonies/discrete-ingestion-db/compare/v3.1.0...v3.1.1) (2021-12-07)

## [3.1.0](https://github.com/MapColonies/discrete-ingestion-db/compare/v3.0.1...v3.1.0) (2021-12-02)


### Features

* added task counters ([#43](https://github.com/MapColonies/discrete-ingestion-db/issues/43)) ([da265ba](https://github.com/MapColonies/discrete-ingestion-db/commit/da265ba85d3ec982ae2aa3cad4164933e0149fd2))

### [3.0.1](https://github.com/MapColonies/discrete-ingestion-db/compare/v3.0.0...v3.0.1) (2021-12-01)


### Bug Fixes

* new task for non-existing job will return 404 instead of 500 ([#41](https://github.com/MapColonies/discrete-ingestion-db/issues/41)) ([e6b62a0](https://github.com/MapColonies/discrete-ingestion-db/commit/e6b62a0deb429af9ab8714ed4e1d6779edea02be))

## [3.0.0](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.3.0...v3.0.0) (2021-11-28)


### ⚠ BREAKING CHANGES

* set 'type' as a mandatory field when creating a task (#38)

### Features

* add payload limit config ([#39](https://github.com/MapColonies/discrete-ingestion-db/issues/39)) ([1a6efed](https://github.com/MapColonies/discrete-ingestion-db/commit/1a6efed91de93d2ad10839a7a56bfd3e39184a99))
* job reset ([#37](https://github.com/MapColonies/discrete-ingestion-db/issues/37)) ([b1092bc](https://github.com/MapColonies/discrete-ingestion-db/commit/b1092bc2c1cf3a3754f073e9dc877eaaeeb3a8e4))
* set 'type' as a mandatory field when creating a task ([#38](https://github.com/MapColonies/discrete-ingestion-db/issues/38)) ([25ac9a5](https://github.com/MapColonies/discrete-ingestion-db/commit/25ac9a5de54575ee0683dfe1c7d4de08f6a20b1d))


### Bug Fixes

* payload limit config location ([#40](https://github.com/MapColonies/discrete-ingestion-db/issues/40)) ([94255d4](https://github.com/MapColonies/discrete-ingestion-db/commit/94255d4d32565c1dbd2f948d5e9003cb0212284f))

## [2.3.0](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.2.2...v2.3.0) (2021-11-14)


### Features

* exparation and inactive tasks black list ([#36](https://github.com/MapColonies/discrete-ingestion-db/issues/36)) ([a8ee37b](https://github.com/MapColonies/discrete-ingestion-db/commit/a8ee37bdf33e39a1a9b0e70e74dd9fb266533215))

### [2.2.2](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.2.1...v2.2.2) (2021-11-10)


### Bug Fixes

* connection creation duplucation ([#35](https://github.com/MapColonies/discrete-ingestion-db/issues/35)) ([367a2f8](https://github.com/MapColonies/discrete-ingestion-db/commit/367a2f8e1d5d94923c18e56c89fd4b7cad8f83aa))

### [2.2.1](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.2.0...v2.2.1) (2021-11-07)

## [2.2.0](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.1.3...v2.2.0) (2021-10-06)


### Features

* add route for querying status of job's tasks ([#31](https://github.com/MapColonies/discrete-ingestion-db/issues/31)) ([e506e36](https://github.com/MapColonies/discrete-ingestion-db/commit/e506e36e52f97a6613f937683c8b2f44dd664684))
* full find tasks implementation ([#32](https://github.com/MapColonies/discrete-ingestion-db/issues/32)) ([3e1942a](https://github.com/MapColonies/discrete-ingestion-db/commit/3e1942ab3ebd19a320d43eb914c16673a5845e3e))
* Jobs with no tasks ([#30](https://github.com/MapColonies/discrete-ingestion-db/issues/30)) ([3b72482](https://github.com/MapColonies/discrete-ingestion-db/commit/3b7248279364645d6bb6fe0c9a4d9e32772d5bf2))


### Bug Fixes

* prevent duplication of active jobs ([#33](https://github.com/MapColonies/discrete-ingestion-db/issues/33)) ([39c3b7a](https://github.com/MapColonies/discrete-ingestion-db/commit/39c3b7a17d6d259bd60a68077695ce54de8be3e2))

### [2.1.3](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.1.2...v2.1.3) (2021-08-19)


### Bug Fixes

* don't print error message on no pending tsak response ([#29](https://github.com/MapColonies/discrete-ingestion-db/issues/29)) ([6766d39](https://github.com/MapColonies/discrete-ingestion-db/commit/6766d395064ef7b143f5aa0eb04ebb1b1b31be99))

### [2.1.2](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.1.1...v2.1.2) (2021-08-16)


### Features

* fix audit and ssl config format ([#27](https://github.com/MapColonies/discrete-ingestion-db/issues/27)) ([7cfa723](https://github.com/MapColonies/discrete-ingestion-db/commit/7cfa7230956dac3082f5bea0f2f973780b77bb2f))

### [2.1.1](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.1.0...v2.1.1) (2021-06-08)

## [2.1.0](https://github.com/MapColonies/discrete-ingestion-db/compare/v2.0.0...v2.1.0) (2021-05-24)


### Features

* added job Priorities ([#21](https://github.com/MapColonies/discrete-ingestion-db/issues/21)) ([ad51da2](https://github.com/MapColonies/discrete-ingestion-db/commit/ad51da2e083d3c8aa022faaf53291dd7e708dd10))
* added task releaser support ([#22](https://github.com/MapColonies/discrete-ingestion-db/issues/22)) ([8bd0236](https://github.com/MapColonies/discrete-ingestion-db/commit/8bd0236dcef20f88e179a09505e3d91ccc3ac2cc))
* **ssl:** add ssl support to DB connection ([#19](https://github.com/MapColonies/discrete-ingestion-db/issues/19)) ([edc5229](https://github.com/MapColonies/discrete-ingestion-db/commit/edc52290a94c877a7884bd315be041771cbcf43d))


### Bug Fixes

* added timezone to db timestamps ([#25](https://github.com/MapColonies/discrete-ingestion-db/issues/25)) ([4ea9a06](https://github.com/MapColonies/discrete-ingestion-db/commit/4ea9a06e3d7627d05b62c9e497f5a8817ed70b2c))

## 2.0.0 (2021-04-18)


### ⚠ BREAKING CHANGES

* moved to generic api  (#17)

### Features

* moved to generic api  ([#17](https://github.com/MapColonies/discrete-ingestion-db/issues/17)) ([77f8033](https://github.com/MapColonies/discrete-ingestion-db/commit/77f8033406f567d41313de47676ec5cfe29abc4a))


### Bug Fixes

* fixed index nameing ([#18](https://github.com/MapColonies/discrete-ingestion-db/issues/18)) ([a2c71d1](https://github.com/MapColonies/discrete-ingestion-db/commit/a2c71d14984ff62b6515bc6301bc18d8a26a6fa8))

### 1.0.2 (2021-03-22)


### Features

* add route for getting partial task by id ([#9](https://github.com/MapColonies/discrete-ingestion-db/issues/9)) ([d4ab20c](https://github.com/MapColonies/discrete-ingestion-db/commit/d4ab20ccca77e342a773b5b7ce4debd9f2820f45))


### Bug Fixes

* fixed issues with create, get, update and delete of discrete task ([#5](https://github.com/MapColonies/discrete-ingestion-db/issues/5)) ([d45a7ce](https://github.com/MapColonies/discrete-ingestion-db/commit/d45a7ce9babf455621362541798eb2e4369a452a))

### 1.0.1 (2021-03-09)


### Features

* add route for getting partial task by id ([#9](https://github.com/MapColonies/discrete-ingestion-db/issues/9)) ([d4ab20c](https://github.com/MapColonies/discrete-ingestion-db/commit/d4ab20ccca77e342a773b5b7ce4debd9f2820f45))


### Bug Fixes

* fixed issues with create, get, update and delete of discrete task ([#5](https://github.com/MapColonies/discrete-ingestion-db/issues/5)) ([d45a7ce](https://github.com/MapColonies/discrete-ingestion-db/commit/d45a7ce9babf455621362541798eb2e4369a452a))
