export const attentionTopics = {
  zh: [
    { id: 'math', name: '数学原理', iconName: 'Calculator', color: 'from-blue-500 to-cyan-500' },
    { id: 'multihead', name: '多头注意力', iconName: 'Layers', color: 'from-purple-500 to-pink-500' },
    { id: 'residual', name: '残差连接', iconName: 'GitBranch', color: 'from-green-500 to-emerald-500' },
    { id: 'encoder', name: '编码器', iconName: 'Grid3X3', color: 'from-orange-500 to-red-500' },
    { id: 'decoder', name: '解码器', iconName: 'ChevronRight', color: 'from-amber-500 to-yellow-500' },
    { id: 'causal', name: '因果掩码', iconName: 'Clock', color: 'from-indigo-500 to-blue-500' },
    { id: 'rope', name: 'RoPE位置编码', iconName: 'Zap', color: 'from-pink-500 to-rose-500' },
    { id: 'advanced', name: '进阶视角', iconName: 'Brain', color: 'from-violet-500 to-purple-500' },
    { id: 'token', name: '分词算法', iconName: 'BookOpen', color: 'from-teal-500 to-cyan-500' },
    { id: 'training', name: '训练核心', iconName: 'Zap', color: 'from-red-500 to-pink-500' },
  ],
  en: [
    { id: 'math', name: 'Math', iconName: 'Calculator', color: 'from-blue-500 to-cyan-500' },
    { id: 'multihead', name: 'Multi-Head', iconName: 'Layers', color: 'from-purple-500 to-pink-500' },
    { id: 'residual', name: 'Residual', iconName: 'GitBranch', color: 'from-green-500 to-emerald-500' },
    { id: 'encoder', name: 'Encoder', iconName: 'Grid3X3', color: 'from-orange-500 to-red-500' },
    { id: 'decoder', name: 'Decoder', iconName: 'ChevronRight', color: 'from-amber-500 to-yellow-500' },
    { id: 'causal', name: 'Causal Mask', iconName: 'Clock', color: 'from-indigo-500 to-blue-500' },
    { id: 'rope', name: 'RoPE', iconName: 'Zap', color: 'from-pink-500 to-rose-500' },
    { id: 'advanced', name: 'Advanced', iconName: 'Brain', color: 'from-violet-500 to-purple-500' },
    { id: 'token', name: 'Tokenization', iconName: 'BookOpen', color: 'from-teal-500 to-cyan-500' },
    { id: 'training', name: 'Training', iconName: 'Zap', color: 'from-red-500 to-pink-500' },
  ]
}

export const attentionMultiAngle = {
  zh: {
    conceptName: '注意力机制',
    angles: [
      {
        id: 'math',
        iconName: 'Calculator',
        name: '数学视角',
        title: '加权求和与 Softmax',
        description: 'Attention(Q,K,V) = softmax(QK^T/√d)V。本质是对 V 的加权求和，权重由 Q 和 K 的相似度决定。',
        example: '每个 Query 都要和所有 Key 计算相似度，相似度越高，对应的 Value 权重越大。这就是"注意"的本质。',
        color: 'text-blue-400'
      },
      {
        id: 'info',
        iconName: 'Eye',
        name: '信息检索',
        title: '软性检索系统',
        description: '想象一个图书馆：Query 是问题，Key 是书籍的索引，Value 是书籍内容。软性匹配意味着不完全匹配的也可能有贡献。',
        example: '问"深度学习"时，系统会软性地匹配所有相关书籍（不只是完全匹配的），综合各本书的内容给出答案。',
        color: 'text-purple-400'
      },
      {
        id: 'neuro',
        iconName: 'Brain',
        name: '神经科学',
        title: '注意力选择机制',
        description: '人脑处理信息时也会"选择性注意"。视觉、听觉都有限，神经系统会过滤不重要的信息。',
        example: '在嘈杂的咖啡厅打电话，大脑会自动"屏蔽"背景噪音，聚焦于电话里的声音。注意力机制类似。',
        color: 'text-accent'
      },
      {
        id: 'eng',
        iconName: 'Grid3X3',
        name: '工程视角',
        title: '矩阵运算并行化',
        description: '注意力可以完全矩阵化，利用 GPU 并行计算。O(L²·d) 复杂度，但完全可并行化。',
        example: 'Transformer 的核心优势：虽然 O(L²) 看起来大，但 GPU 可以同时计算所有位置的注意力。',
        color: 'text-emerald-400'
      }
    ]
  },
  en: {
    conceptName: 'Attention Mechanism',
    angles: [
      {
        id: 'math',
        iconName: 'Calculator',
        name: 'Mathematical',
        title: 'Weighted Sum & Softmax',
        description: 'Attention(Q,K,V) = softmax(QK^T/√d)V. Essentially a weighted sum of V, where weights are determined by Q-K similarity.',
        example: 'Each Query computes similarity with all Keys. Higher similarity = higher weight for the corresponding Value. This is the essence of "attention".',
        color: 'text-blue-400'
      },
      {
        id: 'info',
        iconName: 'Eye',
        name: 'Information Retrieval',
        title: 'Soft Retrieval System',
        description: 'Imagine a library: Query is the question, Key is book index, Value is book content. Soft matching means partial matches also contribute.',
        example: 'When asking "deep learning", the system softly matches all related books (not just exact matches) and synthesizes their content.',
        color: 'text-purple-400'
      },
      {
        id: 'neuro',
        iconName: 'Brain',
        name: 'Neuroscience',
        title: 'Selective Attention',
        description: 'Human brains also perform "selective attention". Vision and hearing are limited, so the nervous system filters unimportant information.',
        example: 'On a call in a noisy cafe, your brain automatically "blocks" background noise and focuses on the voice on the phone. Attention is similar.',
        color: 'text-accent'
      },
      {
        id: 'eng',
        iconName: 'Grid3X3',
        name: 'Engineering',
        title: 'Matrix Parallelization',
        description: 'Attention can be fully matrixized, leveraging GPU parallel computation. O(L²·d) complexity but fully parallelizable.',
        example: 'Transformer\'s core advantage: although O(L²) seems large, GPU can compute attention for all positions simultaneously.',
        color: 'text-emerald-400'
      }
    ]
  }
}

export const attentionQuizzes = {
  zh: [
    {
      id: 'a1',
      question: '注意力公式中为什么要除以 √d？',
      options: ['防止数值溢出', '控制方差，使 softmax 梯度稳定', '加快计算速度', '使 Q 和 K 尺度一致'],
      correctIndex: 1,
      explanation: '当 d 很大时，QK^T 的方差会很大，导致 softmax 进入饱和区，梯度接近零。除以 √d 可以将方差稳定在 1 左右。',
      hint: '考虑 softmax 在极端值时的行为'
    },
    {
      id: 'a2',
      question: '多头注意力的主要优势是什么？',
      options: ['减少计算量', '允许模型同时关注不同类型的特征', '加快推理速度', '减少参数量'],
      correctIndex: 1,
      explanation: '每个注意力头可以学习不同的注意力模式（语法、语义、指代等），增加模型表达的多样性。',
      hint: '8 个专家同时看一篇文章'
    },
    {
      id: 'a3',
      question: '残差连接的主要作用是什么？',
      options: ['减少参数量', '缓解梯度消失，让信息直接流动', '加快推理速度', '实现注意力机制'],
      correctIndex: 1,
      explanation: '残差连接允许梯度直接流过恒等路径，使得深层网络的训练更加稳定。F(x) = H(x) - x 使得学习残差比直接学习 H(x) 更容易。'
    },
    {
      id: 'a4',
      question: 'Causal Mask 的作用是什么？',
      options: ['加速训练', '防止看到未来信息', '减少内存使用', '增加模型层数'],
      correctIndex: 1,
      explanation: '在解码器中，Causal Mask 确保生成第 i 个 token 时只能看到位置 1 到 i 的信息，不能"作弊"看到后面的答案。'
    },
    {
      id: 'a5',
      question: 'RoPE 与绝对位置编码的主要区别是？',
      options: ['RoPE 计算更快', 'RoPE 通过旋转实现位置感知，理论上能泛化到更长序列', 'RoPE 使用更少参数', 'RoPE 是最新的，没有任何优势'],
      correctIndex: 1,
      explanation: 'RoPE 通过将位置信息编码为旋转矩阵来融入注意力计算。这种方法使得模型在学习的位置范围内表现更好，理论上也能更好地泛化到未见过的位置。'
    }
  ],
  en: [
    {
      id: 'a1',
      question: 'Why divide by √d in the attention formula?',
      options: ['Prevent numerical overflow', 'Control variance, stabilize softmax gradient', 'Speed up computation', 'Align Q and K scales'],
      correctIndex: 1,
      explanation: 'When d is large, QK^T has large variance, causing softmax to enter saturation with near-zero gradients. Dividing by √d stabilizes variance to ~1.',
      hint: 'Consider softmax behavior at extreme values'
    },
    {
      id: 'a2',
      question: 'What is the main advantage of multi-head attention?',
      options: ['Reduce computation', 'Allow model to attend to different feature types', 'Speed up inference', 'Reduce parameters'],
      correctIndex: 1,
      explanation: 'Each attention head learns different attention patterns (syntax, semantics, coreference), increasing model expressive diversity.',
      hint: '8 experts reading the same article'
    },
    {
      id: 'a3',
      question: 'What is the main role of residual connections?',
      options: ['Reduce parameters', 'Alleviate vanishing gradients, allow direct information flow', 'Speed up inference', 'Implement attention'],
      correctIndex: 1,
      explanation: 'Residual connections allow gradients to flow directly through identity paths, stabilizing training of deep networks. F(x) = H(x) - x makes learning residuals easier.'
    },
    {
      id: 'a4',
      question: 'What is the purpose of Causal Mask?',
      options: ['Speed up training', 'Prevent seeing future information', 'Reduce memory usage', 'Increase model layers'],
      correctIndex: 1,
      explanation: 'In the decoder, Causal Mask ensures generating token i only sees positions 1 to i, preventing "cheating" by looking at future tokens.'
    },
    {
      id: 'a5',
      question: 'What is the main difference between RoPE and absolute positional encoding?',
      options: ['RoPE is faster', 'RoPE achieves position awareness via rotation, theoretically generalizing to longer sequences', 'RoPE uses fewer parameters', 'RoPE is newer, no actual advantage'],
      correctIndex: 1,
      explanation: 'RoPE encodes position information via rotation matrices into attention computation. This enables better performance within learned position range and better generalization to unseen positions.'
    }
  ]
}

export const attentionContent = {
  zh: {
    heroTitle: '自注意力机制',
    heroDesc: 'Transformer 架构的核心。从数学原理到工程实现，深入理解注意力机制的一切。',
    coreFormula: '核心公式',
    learn: '学习',
    interactive: '交互演示',
    quiz: '测验',
    params: '参数调节',
    seqLength: '序列长度',
    headDim: '头维度',
    scaleFactor: '缩放因子',
    steps: '计算步骤',
    heatmap: '注意力热力图',
    complexityTitle: '复杂度分析',
    timeComplexity: '时间复杂度',
    spaceComplexity: '空间复杂度',
    seqLengthDesc: 'L 是序列长度，d 是维度',
    spaceDesc: '存储注意力矩阵',
    bottleneck: 'O(L²) 是 Transformer 的主要瓶颈。长序列场景下（如长文档、视频）需要特殊优化。',
    whyChunkTitle: '💡 为什么要切割文档？',
    contextLimit: '📏 上下文长度限制',
    contextLimitDesc: 'LLM 有最大上下文长度（如 4K、16K、128K tokens）。大文档必须切割才能放入。',
    precision: '🎯 提高检索精度',
    precisionDesc: '小块更精确匹配查询。太长的块会引入噪声，降低相关性。',
    cost: '💰 降低成本',
    costDesc: '按用量付费。检索少量相关块比传输整个文档便宜得多。',
  },
  en: {
    heroTitle: 'Self-Attention Mechanism',
    heroDesc: 'The core of Transformer architecture. From mathematical principles to engineering implementation, understand everything about attention.',
    coreFormula: 'Core Formula',
    learn: 'Learn',
    interactive: 'Interactive Demo',
    quiz: 'Quiz',
    params: 'Parameters',
    seqLength: 'Sequence Length',
    headDim: 'Head Dimension',
    scaleFactor: 'Scale Factor',
    steps: 'Computation Steps',
    heatmap: 'Attention Heatmap',
    complexityTitle: 'Complexity Analysis',
    timeComplexity: 'Time Complexity',
    spaceComplexity: 'Space Complexity',
    seqLengthDesc: 'L is sequence length, d is dimension',
    spaceDesc: 'Storing attention matrix',
    bottleneck: 'O(L²) is the main bottleneck of Transformer. Special optimization needed for long sequences (e.g., long documents, video).',
    whyChunkTitle: '💡 Why Chunk Documents?',
    contextLimit: '📏 Context Length Limit',
    contextLimitDesc: 'LLMs have max context length (e.g., 4K, 16K, 128K tokens). Large docs must be chunked to fit.',
    precision: '🎯 Better Retrieval Precision',
    precisionDesc: 'Smaller chunks = precise matches. Long chunks add noise, reduce relevance.',
    cost: '💰 Reduce Cost',
    costDesc: 'Pay-per-use. Retrieving small relevant chunks is much cheaper than full doc.',
  }
}
