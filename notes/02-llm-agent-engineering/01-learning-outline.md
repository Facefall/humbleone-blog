---
layout: page
title: LLM、Agent 与工程能力学习大纲
date: 2026-06-11
---

# LLM、Agent 与工程能力学习大纲

这是一份后续学习记录的大纲，不是博文，也不包含框架结论。它用于保存当前学习方向、参考资料和后续拆分笔记的入口。

## 学习目标

围绕三个主线持续积累：

1. LLM 基础：理解 Transformer、数学基础、模型训练与推理的核心机制。
2. Agent 开发：理解 agent 设计模式、工作流、SOTA 方案、实现实践和工程边界。
3. 工程能力：把学习内容沉淀为可复用的开发方法、调研模板、评测框架和项目实践。

量化相关内容作为补充资料，不作为当前主线。

## 参考资料

### Book

1. [LLM / Transformer Book](https://waylandz.com/llm-transformer-book/)  
   重点：数学基础、Transformer、LLM 模型基础。

2. [AI Agent Book](https://waylandz.com/ai-agent-book/)  
   重点：当前最应该聚焦的 agent 开发、设计模式、SOTA、实现实践。

3. [Quant Book](https://waylandz.com/quant-book/)  
   重点：部分参考，主要作为量化方向的补充，不作为当前核心。

### Agent 框架与项目调研

后续逐个研究以下项目，记录它们的设计取舍、优点、缺点和可复用部分：

1. [Hmbown/CodeWhale](https://github.com/Hmbown/CodeWhale)
2. [esengine/deepseek-reasonix](https://github.com/esengine/deepseek-reasonix)
3. [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
4. [earendil-works/pi](https://github.com/earendil-works/pi)
5. [anomalyco/opencode](https://github.com/anomalyco/opencode)
6. [HKUDS/DeepCode](https://github.com/HKUDS/DeepCode)

### Workflow 与 Agent 设计

这些资料用于研究 workflow、durable execution、graph-based agent 和工程化编排：

1. [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents)
2. [temporalio/temporal](https://github.com/temporalio/temporal)
3. [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)

### SDK 与 API

1. [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
2. [OpenAI Agents Guide](https://developers.openai.com/api/docs/guides/agents)

## Part 1：LLM 基础第一阶段任务

第一阶段目标：讲清楚一个 Transformer / LLM token 如何从输入文本进入模型，并最终变成下一个 token 的概率分布。

这一阶段先追求概念链路完整，不追求一次覆盖所有工程细节。

### 计划文章 / 笔记

1. 一文讲清楚 Attention 机制  
   重点：Q / K / V、scaled dot-product attention、self-attention、mask、为什么 attention 能建模 token 之间的关系。

2. 一文讲清楚神经网络基础  
   重点：ANN、MLP、激活函数、反向传播直觉；RNN 作为序列模型历史对照，不作为主线深挖。

3. 一文讲清楚 Tokenizer、Embedding、Position Encoding  
   重点：文本如何变成 token，token 如何变成向量，为什么模型需要位置信息。

4. 一文讲清楚 Transformer 基础组件  
   重点：softmax、LayerNorm、残差连接、Feed Forward，以及它们在 Transformer block 中的作用。

5. 一文建立现代 LLM 工程扩展地图  
   重点：KV Cache、MHA、MQA、GQA、位置编码演进、LoRA、MoE、Prompt Engineering。  
   这一篇先讲它们分别解决什么问题、属于训练 / 推理 / 微调 / 使用的哪个阶段，不要求一文讲透每个细节。

### 阶段边界

Part 1 不直接进入 agent 框架评测，也不急着比较 SDK。只有当 LLM 输入、注意力、Transformer block 和推理基础概念闭环后，再进入 agent workflow 与框架调研。

## 后续笔记拆分

后续可以按以下结构继续补充，不要求一次完成：

1. LLM 基础笔记：Transformer、attention、tokenization、训练与推理、上下文窗口、RAG 与工具调用基础。
2. Agent 设计模式笔记：planner、executor、tool use、memory、reflection、multi-agent、workflow agent、coding agent。
3. Agent 框架调研笔记：每个项目单独一篇，记录目标、架构、运行方式、优点、缺点和可复用点。
4. Workflow 工程笔记：LangGraph、DeepAgents、Temporal 的定位、边界和适用场景。
5. SDK 实践笔记：AI SDK 与 OpenAI Agents API 的最小可运行样例、抽象层设计和集成经验。
6. 工程能力复盘：把调研结论转化为自己的实现规范、测试方法、评测表和项目模板。

## 单篇调研模板

每次研究一个框架或资料时，至少记录：

```md
## 问题

这篇笔记要解决什么问题？

## 资料来源

链接、版本、commit、文档日期或阅读时间。

## 核心结论

当前能确认的事实和判断。

## 设计拆解

架构、模块、数据流、控制流、扩展点。

## 优点

值得学习或复用的部分。

## 缺点

复杂度、耦合、性能、可维护性、生产可用性问题。

## 可实践动作

下一步要做的实验、代码验证或对自己项目的迁移点。
```

## 下一步

优先完成 Part 1。建议第一篇先写 Tokenizer、Embedding、Position Encoding，因为它是 LLM 输入链路入口；随后再写 Attention 机制和 Transformer block。
