---
title: Transformer 01｜Overview 到输入链路：大模型如何理解文字？
date: 2026-06-14
tags:
  - Transformer
  - LLM
  - Tokenizer
  - Embedding
  - KV Cache
description: Transformer 系列第一篇，从架构全景、Tokenizer、Embedding、位置编码、自回归生成到 KV Cache 和推理工程建立输入链路直觉。
notionUrl: https://app.notion.com/p/Transformer-01-Overview-37c51c2971c080c1b69ce416b4580cb6
---

本文是 Transformer 系列的第一篇。

它不试图一次讲完整个 Transformer，而是先建立一条基础链路：

```text
文字
→ Token
→ Token ID
→ Embedding 向量
→ 位置编码
→ Transformer Block
→ LM Head
→ 下一个 Token
```

换句话说，这篇文章主要解决两个问题：

1. 大模型如何把人类输入的文字，转换成模型可以计算的数字表示？
2. GPT 这类模型为什么能基于已有上下文，一个 token 一个 token 地继续生成？

## 本文边界

本文先讲全景和输入链路，不深入展开以下内容：

- Attention 的完整数学细节
- Softmax、LayerNorm、Cross Entropy 的公式推导
- FFN 的内部机制
- 完整 Transformer Block 的训练过程

本文重点解决：

- Transformer 全景流程
- 文本如何转成 token 和 token id
- token 如何进入 embedding 层
- 为什么需要位置编码
- 自回归生成与 KV Cache 的直觉

## 1. Transformer 架构是什么？

一句话说：Transformer 本质上是一类神经网络架构，是现代 LLM 的通用底层架构之一。

如果从工程视角看，一个 LLM 可以粗略拆成两部分：

1. **模型权重**：训练后得到的大量参数。
2. **推理程序**：负责加载权重，并按模型结构执行计算。

Transformer 描述的是第二部分里最核心的计算结构：输入如何被表示、信息如何在 token 之间流动、最终如何映射成下一个 token 的概率。

## 2. Transformer 架构全景流程

![Transformer 架构全景图](/images/transformer-01/architecture-overview.png)

一个 GPT 类 Decoder-only 模型从输入到输出，大致经历如下流程：

1. **输入文本**
2. **Tokenizer / Encoding**：把文本切成 token，并转成 token id
3. **Embedding 层**
   - Token Embedding：把 token id 变成向量
   - Position Encoding / Position Embedding：加入位置信息
4. **Transformer Block 重复 N 层**
   - Multi-Head Attention
   - Residual Connection
   - LayerNorm
   - Feed Forward Network，简称 FFN
   - Dropout：训练时用于正则化，推理时通常关闭
5. **输出层 / LM Head**
   - Linear：把隐藏向量映射到词表大小
   - Softmax：得到下一个 token 的概率分布
6. **Decoding / 生成**
   - 根据概率选择下一个 token
   - 把新 token 接回输入，循环生成后续文本

这里需要注意两个层级问题：

- Tokenizer 是模型前处理，不是 Transformer 网络层。
- Softmax 有两个常见位置：Attention 内部计算权重时，以及最后输出 token 概率时。

## 2.1 三种架构形态

Transformer 不是只有一种用法。按照 Encoder 和 Decoder 的组合方式，常见模型可以分为三类。

| 架构 | 代表模型 | 主要用途 | 直觉理解 |
| --- | --- | --- | --- |
| Encoder-only | BERT | 分类、检索、理解 | 把输入整体读懂 |
| Decoder-only | GPT、LLaMA、Qwen、DeepSeek | 生成、对话、代码 | 根据前文继续写 |
| Encoder-Decoder | 原始 Transformer、T5、BART | 翻译、摘要、改写 | 一个负责读，一个负责写 |

简单总结：

- **Encoder-only**：偏理解。
- **Decoder-only**：偏生成。
- **Encoder-Decoder**：先理解，再生成。

GPT、LLaMA、Qwen、DeepSeek 这类通用对话模型，通常是 Decoder-only 架构。

## 2.2 自回归机制：GPT 如何一个 token 一个 token 吐字？

GPT 生成文本时，并不是一次性把整段答案完整生成出来。

它的真实过程更像这样：

```text
输入：
“我今天想吃”

模型预测下一个 token：
“火锅”

新的上下文变成：
“我今天想吃火锅”

模型再预测下一个 token：
“。”
```

这个过程不断循环：

```text
已有上下文
→ 预测下一个 token
→ 把新 token 接回上下文
→ 再预测下一个 token
```

这就是 Autoregressive，自回归生成。

它可以写成：

$$
P(x_t | x_1, x_2, ..., x_{t-1})
$$

也就是说，第 $t$ 个 token 的概率，取决于它前面已经出现的所有 token。

::: tip 直觉类比
GPT 像是一边开火车，一边在火车前面铺铁轨。

铺一节，开一节；再铺一节，再开一节。

火车是模型，铁轨是生成出来的文字，铺铁轨的动作就是预测下一个 token。
:::

这个类比还要避免一个误解：GPT 不是先在脑子里写好整段答案，然后逐字吐出来。

它更像每走一步都重新看一遍当前轨道，再决定下一节轨道应该铺向哪里。新生成的 token 会立刻变成下一轮推理的上下文。

## 2.3 为什么 GPT / LLaMA 是自回归生成？

GPT 这类模型面对的任务通常不是单纯分类，也不是只做句子匹配。

它面对的问题往往是：

- 请解释一个概念
- 请写一段代码
- 请继续完成一篇文章
- 请进行多轮对话
- 请根据已有上下文继续推理

这些任务有共同特点：

1. 输出长度不固定。
2. 输出内容需要一步一步展开。
3. 后面的内容依赖前面已经说过什么。
4. 生成过程需要持续保持上下文一致。

所以 GPT 的核心任务可以抽象成：

> 根据已有上下文，继续生成后面的内容。

Decoder-only 的“只看前文、继续往后写”的结构特性，正好适合这种开放式语言生成。

在训练时，Decoder-only 模型会使用 Causal Mask：

```text
每个 token 只能看到它自己和它之前的 token，不能看到未来 token。

这样模型在训练时不会偷看答案，只能学习：

给定前文，预测下一个 token。
```

一句话的概率，也可以被拆成一连串条件概率。

比如：

```text
我 今天 想 吃 火锅
```

可以拆成：

```text
P(我 今天 想 吃 火锅)
=
P(我)
× P(今天 | 我)
× P(想 | 我 今天)
× P(吃 | 我 今天 想)
× P(火锅 | 我 今天 想 吃)
```

### 优势

1. **训练目标统一**：给定前文，预测下一个 token。海量文本天然可以转成训练样本。
2. **生成方式灵活**：不需要提前知道输出长度，可以持续生成直到停止符。
3. **适合开放式任务**：对话、写作、解释、代码、推理，都可以统一成续写问题。
4. **架构容易规模化**：只有 Decoder 堆叠，不需要单独 Encoder-Decoder 的双塔结构。
5. **和上下文学习兼容**：Prompt、示例、历史对话、工具结果都可以放进同一条上下文流。

### 代价

1. **推理慢**：必须一个 token 一个 token 生成，不能完全并行输出整段答案。
2. **长上下文成本高**：上下文越长，Attention 和 KV Cache 的计算 / 显存压力越大。
3. **错误会累积**：前面生成错了，后面的生成会继续基于错误上下文展开。
4. **对上下文组织敏感**：Prompt、历史记录、工具结果放得不好，会直接影响后续生成。
5. **不是所有任务都最优**：分类、检索、表征学习等任务，Encoder-only 有时更直接。

## 2.4 自回归 vs 马尔可夫链

马尔可夫链是一种数学模型。简单来说，系统的下一个状态只取决于当前状态，而与更早的历史状态无关。

可以粗略写成：

$$
X_t = f(X_{t-1}) + \epsilon
$$

也就是：你下一步往哪走，主要取决于你现在踩在哪块石头上。

即使是高阶马尔可夫链，比如看前 $n$ 步，它的逻辑依然是有限状态依赖。

现代大模型的自回归不同。它依赖的不是前 1 步或固定 $n$ 步，而是整个上下文窗口里的 token 表示。

可以粗略写成：

$$
X_t = f(X_{t-1}, X_{t-2}, ..., X_2, X_1) + \epsilon
$$

更准确地说，每次预测下一个 token 时，模型会基于当前上下文窗口内已有 token 的向量表示做条件概率预测。

两者的相同点：

1. 都是在建模“下一个状态 / 下一个词”的概率。
2. 都是一步一步生成，每一步输出都会成为后续输入的一部分。

关键差异：

| 维度 | 马尔可夫链 | 自回归大模型 |
| --- | --- | --- |
| 依赖范围 | 通常是当前状态或有限历史 | 整个上下文窗口 |
| 表示方式 | 离散状态 | 连续向量空间 |
| 状态空间 | 通常有限 | 高维、动态、语义化 |
| 预测函数 | 人为定义或统计估计 | 深层神经网络学习 |

一句话总结：

> 如果把马尔可夫链看作“只看前一步的导航员”，那么自回归大模型更像“能回顾整本历史书，再推演下一步的博弈者”。

这自然引出两个问题：

1. 自回归模型如何从整个 context 推到下一个 token？
2. 每一轮预测结束后，新的 context 中各元素的权重与位置关系如何变化？

这两个问题会进入 Transformer 内部机制，后续会在 Attention 和 Transformer Block 章节继续展开。

这里先给一个粗略答案，方便把全景串起来。

::: details 自回归模型如何从 context 推到下一个 token？
可以先把过程简化成三步：

```text
编码
→ 聚合
→ 映射
```

第一步，Tokenizer 把文字变成 token id，Embedding 把 token id 变成向量，再加上位置信息。

第二步，Transformer Layers 通过 Self-Attention 让每个 token 观察上下文里的其他 token。每一层都会产生新的上下文表示。

第三步，最后一个位置的 hidden state 经过 LM Head 映射到整个词表，得到每个候选 token 的 logits，再通过 softmax 变成概率分布。
:::

::: details 新 token 加入后，权重和位置关系会怎样变化？
新 token 加入后，上下文长度变长，Attention 矩阵也会变大。

每个 token 对其他 token 的关注权重会重新分配。比如“北京”后面接上“中国的”，模型关注点可能从“城市”转向“地理位置、政治中心、国家关系”。

位置关系也会随新序列重新进入计算。绝对位置编码直接告诉模型每个 token 的位置；RoPE 这类相对位置方法则更强调 token 之间的距离和旋转关系。

如果没有缓存，每一步都要重复计算大量历史上下文。有了 KV Cache，历史 token 的 Key / Value 可以复用，解码阶段主要增量计算新 token。
:::

## 3. 输入链路：文字如何变成模型能计算的向量？

模型无法直接处理“文字”。模型能处理的是数字和向量。

所以输入链路大致分成三步：

```text
文本
→ Tokenization
→ Token ID
→ Embedding
→ Position Encoding
```

## 3.1 Tokenization：文本如何变成 token？

一开始最容易产生的直觉是：模型是不是维护了一张很大的字典，把每个字或词直接映射成数字？

比如一句话最终进入模型时，变成一个二维矩阵。每一行对应一个 token，每一行里既有语义向量，也有位置相关的信息。

这个直觉有用，但还太粗。它把“字符、词、token、向量”混在了一起。

最直觉的方式，是给每个字符一个编号。

比如：

```js
const wordVectorMap = {
  今: 1,
  天: 2,
  的: 3,
  '?': 10000,
}
```

这种方式简单直接，但实际工程中会有问题：

1. **效率不高**：每个字都是一个 token，一篇文章会产生大量 token。
2. **无法优雅处理新词**：如果出现词表里没有的字或组合，就很麻烦。
3. **语义粒度太粗或太碎**：单字编号并不能自然表达“北京大学”“Transformer”这类组合语义。

所以 GPT 这类模型通常不会只做“单字映射”，而会使用更聪明的子词切分方法。

### BPE 的直觉

BPE，全称 Byte Pair Encoding，字节对编码。

它的核心思想是：

> 高频一起出现的片段，可以合并成更大的 token。

比如训练语料中经常出现：

```text
Trans + former
```

模型的 tokenizer 就可能把它合并成更稳定的 token 片段。

这样做的好处是：

- 常见词不会被切得过碎。
- 生僻词仍然可以被拆成更小片段。
- 英文、中文、符号、代码都可以放进统一的 token 序列里。

Tokenization 结束后，文本就变成了一串 token id：

```text
“你是谁”
→ [100, 120, 311, ...]
```

这里的关键是：token 不一定等于“一个汉字”，也不一定等于“一个完整单词”。

它更像 tokenizer 根据训练语料统计出来的稳定片段。一个英文单词可能被拆成多个 token，一个常见中文词也可能被合并成较少 token。

所以 Tokenizer 解决的是“怎么切”和“怎么编号”，Embedding 解决的是“编号如何变成可计算的语义向量”。

## 3.2 Embedding：编号如何变成向量？

Token ID 只是编号，本身没有语义。

比如：

```text
猫 = 1024
狗 = 1025
火锅 = 8765
```

这些数字的大小关系没有天然意义。模型不能因为 1025 比 1024 大，就理解“狗比猫更大”。

所以模型需要 Embedding。

Embedding 的作用是：

> 把离散的 token id 映射成连续的高维向量。

可以把它理解成一张巨大的查表：

```text
Embedding Table:

token_id 100 → [0.12, -0.03, 0.87, ...]
token_id 120 → [-0.44, 0.19, 0.05, ...]
token_id 311 → [0.08, 0.62, -0.31, ...]
```

如果词表大小是 100,000，隐藏维度是 4,096，那么 embedding table 就是：

```text
[100000, 4096]
```

输入的一句话最终会变成一个矩阵：

```text
[sequence_length, hidden_size]
```

也就是：

- 每一行对应一个 token。
- 每一列是这个 token 在某个语义维度上的数值。

## 3.3 Position Encoding：为什么需要位置信息？

只做 embedding 还不够。

因为 self-attention 本身并不知道 token 的顺序。

如果只看 token 集合：

```text
我 爱 你
你 爱 我
```

两句话包含的 token 是一样的，但意思完全不同。

所以模型必须知道：

- 每个 token 在第几个位置。
- token 之间的相对顺序。
- 当前 token 与其他 token 的距离关系。

这就是位置编码要解决的问题。

### Sinusoidal Position Encoding 的直觉

原始 Transformer 使用的是正弦 / 余弦位置编码。

它会给不同位置生成一组固定的高维数值模式，然后加到 token embedding 上：

```text
最终输入 = Token Embedding + Position Encoding
```

一开始这件事看起来很反直觉：

> 语义向量里加上一组位置数值，不会把语义污染掉吗？

这个疑问是合理的。

如果只在低维空间里看，确实像是把一组位置数字硬塞进语义数字里。语义和位置似乎被搅在一起，模型怎么知道哪一部分是“鱼”，哪一部分是“第 1 个位置”？

但高维空间和低维空间不一样。线段只能表达一维变化，平面能表达方向和面积，三维空间又能表达体积和旋转。

模型的 hidden size 往往是几千维。位置编码不是随便加噪声，而是在高维空间里加入一组稳定、可学习识别的结构模式。

更合理的理解是：

模型看到的不是：

```text
“鱼”的语义值 + 位置值 = 一个被污染的数
```

而是：

```text
“鱼”的语义模式 + 位置模式 = “鱼@某位置”的综合模式
```

位置编码不是随机噪声，而是一种结构化位置水印。

在高维空间中，模型可以学习识别这种模式，并把它用于后续 Attention 计算。

### RoPE：现代 LLM 更常见的位置编码

LLaMA 等现代模型广泛使用 RoPE，Rotary Positional Embedding，旋转位置编码。

一句话理解：

> RoPE 不再简单做加法，而是对向量做旋转变换，用旋转角度表达位置信息。

它的优势是更适合表达相对位置关系，也更适合长上下文扩展。

这一部分后续会在位置编码专题里单独展开。

## 4. 从自回归联想到 KV Cache

理解自回归之后，会自然出现一个工程问题：

> 如果模型每生成一个 token，都要重新计算前面所有历史上下文，会不会非常浪费？

答案是：会。

所以推理系统会使用 KV Cache。

KV Cache 的直觉是：

> 历史 token 已经算过的 Key / Value 不必每轮重复计算，后续只需要追加新 token 的 K / V。

可以把最朴素的推理过程理解成：

```text
Model(full_context) → next_token
```

而有 KV Cache 后，它更像：

```text
CachedModel(past_kv, new_token) → next_token
```

其中：

- `past_kv` 是已经缓存的历史上下文中间结果。
- `new_token` 是本轮新增的 token。

这和算法里的 memoization、前端里的 `useMemo`、函数式编程里的“把已有状态继续传下去”有相似直觉。

这也是很多工程优化的共同模式：

- 动态规划会缓存子问题结果。
- React `useMemo` 会缓存昂贵计算。
- 推理系统会缓存历史 token 的中间表示。

本质都是：

> 用空间换时间，避免重复计算。

### 和柯里化的类比

柯里化会把：

```text
f(a, b, c)
```

变成：

```text
f(a)(b)(c)
```

也就是先固定一部分参数，得到一个带有已知上下文的新函数，后面只输入新的参数。

KV Cache 也有类似直觉：

```text
历史上下文已经固定
下一步只输入新 token
模型带着缓存继续算
```

### 和尾递归优化的类比

尾递归优化的核心直觉是：

```text
递归调用不再保留一大堆调用栈
而是把状态累积到参数里
然后继续下一轮
```

KV Cache 也像一个不断传递下去的状态：

```text
state_0 + token_1 → state_1
state_1 + token_2 → state_2
state_2 + token_3 → state_3
```

这里的 `state` 就可以近似理解成 KV Cache。

## 4.1 KV Cache 的工程代价

任何缓存，本质上都是空间换时间。

KV Cache 避免了重复计算，但带来了显存压力。

对于一个常见的 LLaMA-7B 级别模型，粗略假设：

- Batch Size = 1
- Context Length = 4096
- Hidden Size = 4096
- Layers = 32
- 数据类型 = FP16，每个数字 2 字节

每一层、每一个 token 都需要缓存 Key 和 Value。

单 token 的 KV 缓存大小大致是：

$$
2 \times 4096 \times 2 = 16384 \text{ bytes} = 16 \text{ KB}
$$

如果是 4096 个 token，再乘以 32 层：

$$
16 \text{ KB} \times 4096 \times 32 \approx 2 \text{ GB}
$$

这意味着：单个用户的 4096 长度上下文，仅 KV Cache 就可能占用约 2GB 显存。

如果同时有 100 个类似请求，粗略看就是约 200GB 级别的 KV Cache 压力。

如果并发上来，KV Cache 就会成为推理系统里的核心瓶颈之一。

## 4.2 KV Cache 的优化方向

业界围绕 KV Cache 做了很多工程优化。

先看问题本身：KV Cache 不是“缓存越多越好”。

上下文变长后，模型常见现象是 Lost in the Middle：开头的系统指令和结尾的最新输入通常更容易被关注，中间很长的历史内容反而可能被稀释。

这会引出一个工程问题：

> 如果显存快满了，应该丢最早的 token，还是丢中间最不重要的 token？

直觉上可以想到几类策略：

1. 像浏览器缓存一样做 LRU，优先淘汰很久不用的内容。
2. 像操作系统一样做分页和块管理，减少显存碎片。
3. 根据相关性或注意力分数，淘汰对当前生成贡献较小的 token。

下面这些方案，本质上就是围绕这些问题做不同取舍。

### PagedAttention

PagedAttention 是 vLLM 的核心技术之一。

它借鉴操作系统的虚拟内存思想，把一个序列的 KV Cache 划分成固定大小的 blocks。

传统做法如果要求一整块连续 KV Cache，长上下文和高并发时很容易产生显存碎片。PagedAttention 把逻辑连续的序列映射到物理上不连续的 blocks。

常见实现里，一个 block 可以包含一小段连续 token。模型通过 block table 找到这些 token 对应的物理缓存位置。

好处是：

- 不再要求为每个请求预分配一整块连续显存。
- 减少显存碎片。
- 提高显存利用率。
- 更适合高并发推理服务。

直觉上，它就是把 KV Cache 从“连续大数组”变成“可分页管理的块表”。

这类方案成功的关键不只是算法漂亮，还因为它符合 GPU 的访问特性：固定块、批量读取、尽量保持局部连续。

### StreamingLLM

StreamingLLM 的思路是保留两个部分：

1. **Attention Sink**：永远保留序列开头的一小段 token。
2. **Sliding Window**：只保留最近的一段 token。

这样模型可以用相对稳定的显存持续生成。

代价是：模型会丢失中间久远历史的细节。

这也解释了一个常见的工程土办法：Head + Tail Hack。

也就是保留开头一段关键前缀，再保留结尾一段最新上下文，中间内容按窗口或策略裁剪。它不是理论最优，但和 Attention Sink + Sliding Window 的直觉一致。

### H2O / Heavy-Hitter Oracle

H2O 的思路是：并不是所有历史 token 都同样重要。

在注意力计算中，有一小部分 token 会持续贡献大量注意力权重，这些 token 可以称为 heavy hitters。

当显存紧张时，可以优先保留这些高价值 token，淘汰较少被关注的 token。

但这类方法也有工程代价：

- 需要额外维护注意力分数。
- 会引入不连续内存访问。
- GPU 对稀疏、不连续读取并不友好。

所以算法上的优雅，不一定等于工程上的高效。

### Prefix Cache

Prefix Cache 关注的是另一类优化：

> 如果多轮请求有相同前缀，那么前缀部分的 KV Cache 可以复用。

理想形态是：

```text
第 N 轮请求：A + B + C
第 N+1 轮请求：A + B + C + D
第 N+2 轮请求：A + B + C + D + E
```

这样从第二轮开始，绝大部分旧 token 都可以命中缓存。

但如果历史记录每轮都被改写：

```text
第 N 轮请求：A + B + C
第 N+1 轮请求：A + B' + D
第 N+2 轮请求：A' + B'' + D + E
```

那么看起来内容差不多，实际前缀已经变了，缓存也很难命中。

这对 Agent 设计也有启发：

> 如果想提高前缀缓存命中率，历史日志最好尽量保持 append-only，把“改历史”变成少数、显式、可控的事件。

这也是一些 Agent 运行时设计会强调“日志追加”的原因。

如果第 N 轮是 `A + B + C`，第 N+1 轮最好自然变成 `A + B + C + D`。这样前缀可以命中缓存。

如果每轮都重写历史，变成 `A + B' + D` 或 `A' + B'' + D + E`，内容看起来差不多，但前缀哈希已经变了，缓存命中率会明显下降。

## 4.3 相关工程实践：不仅是 KV Cache

KV Cache 只是推理工程里的一个入口。沿着“如何让大模型训练和推理更高效”继续看，还会遇到几类常见技术。

### LoRA

LoRA 关注的是微调成本。

它不直接更新完整大模型权重，而是在部分线性层旁边加入低秩矩阵，只训练这部分新增参数。

直觉上，它是在冻结大模型主体的同时，给模型加一组可学习的“适配器”。这样可以显著降低微调显存和训练成本。

### Megatron-LM

Megatron-LM 关注的是大模型训练的并行化。

当模型太大，单张 GPU 放不下或算不过来时，就需要张量并行、流水线并行、数据并行等策略，把模型和训练任务切到多张 GPU 上。

它解决的问题不是“一个 token 怎么表示”，而是“这么大的网络如何被训练起来”。

### Packing / FlashAttention

Packing 关注训练数据利用率。

如果很多样本很短，直接 padding 到固定长度会浪费大量计算。Packing 会把多个短样本拼到同一个训练序列里，提高 token 利用率。

FlashAttention 关注 Attention 的显存访问效率。它通过更好的分块和 IO 策略，减少中间矩阵落显存的开销，让 Attention 更快、更省显存。

### Activation Checkpointing

Activation Checkpointing 关注训练显存。

训练时为了反向传播，模型通常要保存大量中间激活。Checkpointing 选择只保存一部分关键激活，反向传播时再重新计算缺失部分。

它本质上也是空间和时间的交换：少存一点，多算一点。

## 5. 总结

这篇文章的目标不是讲完 Transformer，而是建立第一层直觉：

1. Transformer 是一类神经网络架构，不是某一个具体模型。
2. GPT 这类模型通常是 Decoder-only，核心任务是根据前文继续生成。
3. 自回归生成就是一个 token 一个 token 地预测，并把新 token 接回上下文。
4. 文本不能直接进入模型，必须先经过 Tokenizer 变成 token id。
5. Token ID 只是编号，必须通过 Embedding 变成连续向量。
6. 只有 Embedding 还不够，模型还需要位置编码来理解顺序。
7. KV Cache 是自回归推理中的中间结果缓存，用空间换时间。
8. KV Cache 能提升推理效率，但会带来显存压力，因此才有 PagedAttention、StreamingLLM、H2O、Prefix Cache 等工程优化。
9. LoRA、Megatron-LM、Packing、FlashAttention、Activation Checkpointing 是同一条工程主线上的后续问题。

如果能用自己的话回答下面几个问题，这篇的目标就基本达成了：

1. Transformer 为什么不是某一个具体模型，而是一类架构？
2. Encoder-only、Decoder-only、Encoder-Decoder 分别适合什么任务？
3. GPT 为什么是一个 token 一个 token 生成，而不是一次性生成整段答案？
4. Token、Token ID、Embedding 三者有什么区别？
5. 为什么模型不能只用 Token ID，而要转成向量？
6. 为什么“我爱你”和“你爱我”需要位置编码才能区分？
7. KV Cache 为什么能减少自回归生成中的重复计算？
8. KV Cache 为什么会带来显存压力？
9. Lost in the Middle 为什么会影响长上下文缓存策略？
10. Prefix Cache 为什么要求 Agent 历史尽量 append-only？

## 6. 下一章预告：Transformer 02｜必要数学

第一篇已经走完 Transformer 的入口：

```text
文字
→ Token
→ Token ID
→ Embedding
→ 位置编码
→ 进入 Transformer Block
```

但一旦真正进入 Transformer 内部，很多问题就不能只靠类比解释。

比如：

- Attention 为什么要做矩阵乘法？
- 点积为什么能表示两个 token 之间的相关性？
- Logits 是什么？为什么它还不是概率？
- Softmax 为什么能把一堆分数变成概率分布？
- LayerNorm 为什么能稳定模型的中间表示？
- Cross Entropy 为什么可以衡量模型预测和正确答案之间的差距？
- 反向传播为什么能根据 loss 调整模型参数？

所以第二篇会先补必要数学。

目标不是学完数学本身，而是为了读懂 Transformer 里的核心运算。

下一篇重点：

1. 向量
2. 矩阵乘法
3. 点积
4. Logits
5. Softmax
6. 概率分布
7. 均值、方差、标准差
8. LayerNorm
9. Cross Entropy
10. 偏导数与梯度下降

等这些数学直觉补齐之后，再进入真正的核心机制：

```text
Attention
→ Multi-Head Attention
→ FFN
→ Residual Connection
→ LayerNorm
→ Transformer Block
```
