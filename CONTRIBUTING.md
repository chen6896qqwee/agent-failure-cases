# Contributing

收到。三条规矩：**写机制、写误判、脱敏。**

## 1. 骨架（复制这个）

```json
{
  "id": "FC-00NN",
  "title": "One line, mechanism-oriented: <cause> makes <system> do <wrong observable thing>",
  "title_zh": "中文一句话",
  "status": "draft",
  "domain": "mcp | windows-shell | storage | subagent | network | encoding | dependency | browser | api | <your own>",
  "tags": ["lowercase", "keywords"],
  "severity": "low | medium | high | critical",
  "symptom": "What you actually observe. Copy the log line. >= 20 chars.",
  "wrong_handling": [
    "First plausible-but-wrong action you (or your agent) took.",
    "Second one."
  ],
  "root_cause": "Mechanism. Why the wrong handling is wrong. >= 40 chars.",
  "correct_handling": [
    "Ordered steps that actually work."
  ],
  "guardrail": [
    "The rule/assertion/check that stops this from happening again."
  ],
  "detection": [
    "Command or check that discriminates this case from look-alikes."
  ],
  "evidence": "Optional. Where reproduced, what was measured.",
  "reproducible": true,
  "reported_by": "your agent name / handle",
  "reported_at": "YYYY-MM-DD",
  "confidence": "low | medium | high"
}
```

文件名：`cases/FC-00NN-<kebab-slug>.json`，`id` 必须和文件名开头一致，全局唯一。

## 2. 提交前自检

```bash
node scripts/validate.mjs
```

**零依赖 Node 脚本**，不装任何东西。它会校验字段、去重 id、重建 `cases/index.json`。
只改了 case 文件就提交，`index.json` 是生成物。

## 3. 脱敏清单（硬红线）

提交前逐条过：

- [ ] 没有 token / key / cookie / 会话 id
- [ ] 没有内网地址、IP、端口
- [ ] 没有真实用户名、真实路径 —— 用 `<workspace>`、`<repo>`、`<host>` 占位
- [ ] 没有第三方私有数据
- [ ] 没有个人数据（持仓、聊天、位置、身份）
- [ ] 日志片段里没有上面任何一项的痕迹（**日志最容易夹带**）

## 4. 差案例长什么样

会被拒的：

> **症状**：XX 库太难用了。
> **错误处置**：无。
> **根因**：就是不好用。
> **正确做法**：小心一点。

不会拒的：

> **症状**：进程退出码 0，无任何输出，客户端报 `Connection closed`。
> **错误处置**：反复重启客户端；怀疑网络。
> **根因**：依赖没钉上界，解析器装了 v2，代码 import 的是 v1 的符号，ImportError 发生在日志初始化之前，且框架把启动错误写进了自己的日志文件而不是 console。
> **正确做法**：1) 直接跑子进程抓两个流；2) 读它自己的 stderr 日志文件；3) 比对安装版本与源码 import；4) 钉 `<2` 后重装；5) 用 initialize+tools/list 做真回环验证。

区别就一个：**机制**。

## 5. 不要求原创

同一个坑在别的栈上重现 = 独立案例。那说明它是模式，不是偶然 —— 更有价值。

## 6. 争议

`status: disputed` 是合法状态。案例可以被反驳：开 issue 说明，附证据，改 `status` 或修正 `root_cause`。**我们不做面子工程**，错的案例留着比删掉好。
