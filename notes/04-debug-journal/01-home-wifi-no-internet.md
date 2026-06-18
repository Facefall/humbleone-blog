---
layout: page
title: 家庭 Wi-Fi 已连接但突然无法访问 Internet 的排查记录
date: 2026-06-15
---

# 家庭 Wi-Fi 已连接但突然无法访问 Internet 的排查记录

这是一篇持续更新的 debug 随笔，用来记录一次日常网络故障的排查过程。

问题不是“完全连不上 Wi-Fi”，而是：电脑显示 Wi-Fi 仍然已连接，上一秒还能正常联网，下一秒系统或应用提示当前无法连接 Internet。

为保护隐私，本文省略 SSID、设备名、MAC 地址等可识别信息，只保留排查链路和必要技术事实。

## 当前结论

截至 2026-06-15，问题还没有最终定因。当前更像是两个方向需要并行验证：

1. 本机代理 / TUN 出口链路不稳定。
2. Intel AX201 无线网卡驱动或 2.4GHz 无线环境存在间歇断连。

这不是单纯的“信号差”结论。因为现场采样时，Wi-Fi 链路、网关、公网 ping、DNS 和 HTTP 探测都能恢复正常；但 Windows 日志里已经出现过驱动级断开记录。

## 现场现象

- Wi-Fi 状态仍显示已连接。
- 系统可能提示无法访问 Internet。
- 问题随机出现，不是固定时间稳定复现。
- 恢复后当前连接看起来正常，因此需要在下一次故障发生时抓取现场证据。

## 2026-06-15 初始采样

当前正常状态下的观察：

- 物理无线网卡：Intel Wi-Fi 6 AX201 160MHz。
- 当前连接频段：2.4GHz。
- 当前协议：802.11n。
- 信号强度：约 76%，RSSI 约 -64。
- WLAN 私网地址正常，网关为家庭路由器。
- DNS 由路由器下发。
- 默认网络出口优先经过 Mihomo 虚拟网卡，而不是直接走物理 WLAN。
- `verge-mihomo` 持有较多已建立 TCP 连接。

正常状态下的探测结果：

- 网关 ping：正常。
- 公网 IP ping：正常。
- DNS 解析：正常。
- Windows 连通性测试目标 HTTP：正常。

## 已发现的关键线索

### 线索一：默认出口优先经过 Mihomo

当前机器的默认路由优先走虚拟网卡：

```text
Mihomo -> 198.18.0.2
```

这意味着很多应用的实际出口不是“物理 Wi-Fi -> 路由器 -> Internet”，而是：

```text
应用 -> Mihomo/TUN -> 物理 Wi-Fi -> 路由器 -> Internet
```

如果 TUN、代理内核、规则、DNS 劫持或上游节点短暂卡住，用户看到的结果可能仍然是“Wi-Fi 已连接，但无法访问 Internet”。

### 线索二：WLAN 日志出现过驱动级断开

Windows WLAN 日志里出现过类似记录：

```text
网络被驱动程序断开连接
关联时驱动程序已断开连接
```

这说明不能只怀疑代理。物理无线链路、Intel AX201 驱动、电源管理、路由器兼容性或 2.4GHz 干扰也需要进入排查范围。

### 线索三：系统曾出现 UDP 临时端口申请失败

系统日志中出现过 `Tcpip 4266`，含义是系统申请 UDP 临时端口失败。

这类问题可能影响：

- DNS 查询。
- QUIC / HTTP3。
- 代理 TUN 转发。
- 某些实时网络连接。

不过后续即时检查时，UDP endpoint 数量并不高，所以它更像是某个时间段发生过突发占用，而不是持续泄漏。

## 当前假设

### 假设 A：Mihomo / TUN 链路短暂失效

判断标准：

- 掉线时网关仍可 ping。
- 公网 IP 直接 ping 正常。
- DNS 或 HTTP 经过默认路由失败。
- 关闭 TUN / 系统代理后故障消失或频率明显下降。

验证方式：

1. 关闭 Mihomo 的 TUN / 增强模式，保留普通直连网络使用半天到一天。
2. 如果故障消失，优先检查 Mihomo 配置、DNS、规则、节点和虚拟网卡。
3. 如果故障仍然出现，继续看无线驱动和路由器侧。

### 假设 B：Intel AX201 驱动或无线链路间歇断开

判断标准：

- 掉线时网关也 ping 不通。
- Windows WLAN 日志同步出现驱动断开、重新关联、认证重试。
- 切到 5GHz 或更新 / 回退驱动后故障减少。

验证方式：

1. 优先使用 5GHz Wi-Fi，减少 2.4GHz 干扰变量。
2. 检查 Intel AX201 驱动版本，必要时更新或回退。
3. 关闭无线网卡省电策略，观察是否改善。
4. 路由器侧固定信道，避免自动信道切换带来的短断。

### 假设 C：路由器 DNS 或上游出口短暂异常

判断标准：

- 掉线时网关可 ping。
- 公网 IP 可 ping。
- DNS 解析失败。
- 更换本机 DNS 后问题改善。

验证方式：

1. 掉线现场同时测试公网 IP ping 和域名解析。
2. 如果只有 DNS 失败，优先绕开路由器 DNS，临时改用公共 DNS 做对照。

## 下一次掉线时要抓的证据

下一次出现“Wi-Fi 已连接但无 Internet”时，先不要重启电脑或路由器，先确认下面四层：

1. 能否 ping 通路由器网关。
2. 能否 ping 通公网 IP。
3. 能否解析常见域名。
4. 默认出口当时是 Mihomo 还是 WLAN。

本地已经准备了一个只读监控脚本，用于持续记录：

- 网关 ping。
- 公网 IP ping。
- DNS 解析。
- HTTP 探测。
- 默认路由。
- UDP endpoint 数量。
- 主要 TCP 连接进程。
- 最近 WLAN / System 网络事件。

持续监控命令：

```powershell
powershell -ExecutionPolicy Bypass -File .\wifi-doctor.ps1 -IntervalSeconds 10
```

如果脚本生成 `outage-*.txt`，下一步就优先分析这个快照。

## 当前排查顺序

1. 先跑 24 小时监控，抓下一次掉线现场。
2. 做一次对照实验：关闭 Mihomo TUN / 增强模式半天到一天。
3. 如果关闭 TUN 后稳定，回头查代理配置、DNS、规则和上游节点。
4. 如果关闭 TUN 后仍掉线，切到 5GHz，并检查 Intel AX201 驱动与省电设置。
5. 如果网关始终可达但 DNS 失败，再单独排查路由器 DNS / 上游 DNS。

## 追踪日志

### 2026-06-18

下载 GitHub Release 字体包时，Chrome 里出现下载速度先升到 100KB/s、200KB/s、300KB/s，随后几分钟内稳定下降到 40KB/s 到 60KB/s，甚至阶段性显示 0KB/s。

目标文件是 GitHub Release Asset 中的 `SarasaMonoSC-TTF-1.0.39.7z`。该下载链接是 GitHub 生成的临时签名 URL，带有过期时间；因此如果长时间低速下载，链接过期后也可能导致下载失败。

现场检查：

- 当前本地网关 `192.168.1.1` ping 正常，短样本未出现明显丢包。
- `github.com` 和 `release-assets.githubusercontent.com` DNS 解析正常，解析结果经 Mihomo 映射到 `198.18.0.x`。
- 默认公网出口仍经过 Mihomo。
- 对 GitHub Release Asset 做 10MB 分段下载测试，30 秒只下载约 1MB。

复现数据：

```text
请求范围：0-10485759
HTTP 状态：206 Partial Content
30 秒下载量：约 1,013,759 bytes
平均速度：约 33KB/s
结果：超时
```

观察到的下载曲线与 Chrome 一致：开始阶段可以到几十 KB/s 或更高，但很快稳定在 30KB/s 到 60KB/s 区间。

新的判断：

1. 这不是 Chrome 进度条假象，命令行下载也复现了低速。
2. 这次不是 DNS 解析失败；DNS 和 TCP 连接都能建立。
3. 慢点主要出现在 GitHub Release Asset / Azure Blob 这条长连接下载链路上。
4. 可能原因包括 Mihomo 当前节点到 GitHub Release Assets/CDN 质量差、GitHub Release Asset 单连接被限速、CDN 到当前出口拥塞，以及 2.4GHz 中继链路放大长连接抖动。
5. 该类大文件下载不适合继续依赖 Chrome 单线程下载。

临时处置建议：

1. 优先更换 Mihomo 节点，选择对 GitHub / release-assets / Azure Blob 更稳定的节点。
2. 使用多线程下载器，而不是 Chrome 单连接下载。
3. 如果链接已长时间挂起，回 GitHub Release 页面重新点击下载，获取新的临时签名 URL。
4. 当前不要关闭 Mihomo/TUN；它仍在帮助 GitHub 域名解析和出口转发。

推荐命令：

```powershell
aria2c -x 16 -s 16 -k 1M "下载链接"
```

如果没有 `aria2c`，可以使用 Motrix、IDM 或 Free Download Manager，将 GitHub Release Asset 链接粘进去，并开启 8 到 16 线程。

后续判断标准：

- 换节点后同一文件速度明显提升：主因是 Mihomo 节点 / 出口链路。
- 多线程下载显著提升：主因是单连接链路限速或拥塞。
- 所有节点和多线程都慢：再考虑 GitHub Release Asset 当前 CDN 对本地网络质量差，或 2.4GHz 中继链路对大文件长连接影响较大。

同日还出现 Win11 GUI 间歇性完全无响应：鼠标仍可移动，但窗口切换、鼠标点击、任务栏和 UI 元素在十几秒到数分钟内没有响应。

这类现象先不归入 Wi-Fi 链路问题。鼠标能动说明系统没有彻底死机，更像桌面 Shell、DWM、显卡驱动、输入队列，或本机进程调度压力导致 UI 响应被饿死。

现场检查：

- 当前同时存在大量 Electron / Chromium / Node / WebView 类进程。
- `node.exe`、Chrome、Cursor、Codex、`msedgewebview2` 合计占用较多内存与线程。
- 采样时 CPU 总占用不一定打满，但 `Processor Queue Length` 曾达到 100 级别，说明可运行线程排队异常。
- 事件日志中出现 ASUS 组件崩溃，例如 `AsusDownloadAgent.exe`、`ArmourySocketServer.exe`。
- 系统中存在虚拟显示 / 远控相关设备，例如 Oray IDD Driver；这类组件也可能影响桌面显示链路。

临时恢复动作：

```powershell
Stop-Process -Name explorer -Force
Start-Process explorer.exe
```

如果卡顿时怀疑是显卡显示链路，可以先按：

```text
Win + Ctrl + Shift + B
```

这会触发 Windows 重置图形驱动显示链路，屏幕可能短暂闪黑。

新增监控脚本：

```powershell
cd D:\Documents\home_wifi_doctor
.\ui-freeze-watch.ps1 -DurationMinutes 30 -IntervalSeconds 1
```

脚本会写入：

- `logs/ui-freeze-watch-*.csv`
- `logs/ui-freeze-snapshots-*`

后续判断标准：

- 如果卡顿时 `Processor Queue Length` 持续很高：优先减少 Node / Chrome / Cursor / Codex / WebView 进程数量，排查进程调度压力。
- 如果卡顿时 DWM / Explorer 异常：优先重启 Explorer，并排查显卡驱动、虚拟显示、壁纸软件。
- 如果 ASUS 组件持续崩溃：临时退出或禁用 Armoury Crate / ASUS 后台组件做对照实验。
- 如果关闭 Wallpaper Engine、ASUS、Oray 相关组件后明显改善：主因更可能在本机 GUI / 驱动 / 常驻组件，而不是网络。

### 2026-06-16

网络再次出现波动时做了现场排查。

本轮能确认：

- WLAN 物理链路当时没有明显断开：信号约 85%，RSSI 约 -55。
- 近 45 分钟没有新的 WLAN 断连事件。
- 网关 `192.168.1.1` 可 ping 通，公网 IP `223.5.5.5` 也可 ping 通。
- 路由器作为 DNS 服务器不响应：`192.168.1.1` 和 `fe80::1%10` 查询域名均超时。
- Mihomo DNS `198.18.0.2` 查询成功。
- Windows DNS Client 日志出现名称解析超时事件。

因此，本轮故障断点更明确地收敛到 DNS 层：路由器可达，但路由器 DNS 服务 / DNS 转发不稳定。

已执行的临时止血动作：

```powershell
Set-DnsClientServerAddress -InterfaceAlias WLAN -ServerAddresses 223.5.5.5,119.29.29.29
ipconfig /flushdns
```

由于当前普通终端没有提升权限，实际执行时通过 UAC 提权完成；同时把 WLAN IPv6 DNS 改为公共 DNS：

```text
IPv4 DNS: 223.5.5.5, 119.29.29.29
IPv6 DNS: 2400:3200::1, 2402:4e00::
```

改完后的短监控结果：

- 网关 ping：正常。
- 公网 ping：正常。
- DNS：正常。
- HTTP 探测：正常。
- 默认出口仍经过 Mihomo。

新的判断：

1. 当前不优先怀疑 Wi-Fi 射频层断线。
2. 当前优先怀疑路由器 DNS 服务 / DNS 转发异常。
3. 如果后续仍波动，再单独验证 Mihomo TUN 和上游链路。

下一步：

- 继续观察改 DNS 后是否还出现“已连接但无 Internet”。
- 如果故障消失，后续应进入路由器后台检查 DNS 配置或重启 / 升级路由器。
- 如果故障仍出现，下一次重点抓 Mihomo/TUN 是否拦截或转发 DNS 失败。

后续继续做了 Mihomo / TUN 对照实验。

实验结论：

- 禁用 Mihomo 虚拟网卡后，公网路由确实回到 `WLAN -> 192.168.1.1`。
- 但直连状态并没有变稳定，反而暴露出底层 Wi-Fi / 中继链路问题。
- ping 网关 `192.168.1.1` 出现 100ms+ 尖峰和少量丢包。
- ping 公网 IP 也同步出现延迟尖峰和少量丢包。
- 直连 DNS 查询公共 DNS 也会超时。

因此，Mihomo / TUN 不是唯一主因。它会影响 HTTP 延迟尖峰，但底层 2.4GHz Wi-Fi 中继链路本身已经不稳定。

用户补充了关键拓扑信息：

```text
电脑 -> 2.4GHz Wi-Fi 放大器 / 中继器 -> 老路由器 -> Internet
```

并且当前条件下只能继续使用 2.4GHz。

这个信息改变了后续排查重点。当前目标不再是“切 5GHz”，而是在 2.4GHz 中继限制下尽量压低延迟尖峰。

新的判断：

1. 2.4GHz 中继链路天然容易产生排队、重传和短时延迟尖峰。
2. 电脑看到信号强，不代表放大器到主路由的回程链路稳定。
3. `ping 192.168.1.1` 是当前最关键指标，因为它直接反映本机到路由器这一段是否稳定。
4. DNS 和 Mihomo 都会放大用户感知，但底层网关 ping 已经出现尖峰，所以不能只修代理或 DNS。

只能继续使用 2.4GHz 时，后续调参顺序改为：

1. 把 Wi-Fi 放大器移到更靠近主路由的位置，而不是放在电脑旁边。
2. 路由器后台固定 2.4GHz 信道，在 `1 / 6 / 11` 中逐个测试。
3. 固定 2.4GHz 频宽为 `20MHz`，不要使用自动频宽或 `40MHz`。
4. 保持 `WPA2-PSK / AES`，避免 TKIP 或兼容性更差的加密组合。
5. 每次只改一个变量，然后运行：

```powershell
ping -n 100 192.168.1.1
```

判断标准：

- 好：0 丢包，最高延迟低于 50ms。
- 可接受：0 丢包，偶发低于 100ms。
- 差：有丢包，或多次出现 100ms+。

新增了延迟尖峰监控脚本，用于区分网关、公网、DNS 和 HTTP 哪一层在尖峰：

```powershell
.\latency-watch.ps1 -IntervalSeconds 2 -HttpSpikeMs 500
```

下一步：

- 在只能使用 2.4GHz 的前提下，先优化放大器位置和路由器 2.4GHz 参数。
- 不再把“关闭 Mihomo”作为首要修复动作；Mihomo 可以作为临时 DNS / 出口兜底，但底层 Wi-Fi 中继仍需单独优化。

### 2026-06-15

完成首次排查。

当前能确认：

- 正常状态下网络链路是通的。
- 当前默认出口优先经过 Mihomo 虚拟网卡。
- WLAN 日志中存在驱动级断开记录。
- 系统曾出现 UDP 临时端口申请失败。

当前不能确认：

- 下一次实际掉线时，断点是在物理 Wi-Fi、默认路由、代理 TUN、DNS，还是运营商出口。

下一步：

- 运行监控脚本至少一天。
- 下次掉线时优先保留现场日志，不要先重启。
