export type Locale = "zh-CN" | "en";
export type LocalizedText = Record<Locale, string>;
export type DimensionId = "SF" | "AI" | "HL";
export type Pole = "S" | "F" | "A" | "I" | "H" | "L";
export type PersonalityType = `${"S" | "F"}${"A" | "I"}${"H" | "L"}`;
export type ScaleValue = 1 | 2 | 3 | 4;

export interface DimensionDefinition {
  id: DimensionId;
  highPole: Pole;
  lowPole: Pole;
  label: LocalizedText;
  description: LocalizedText;
  highLabel: LocalizedText;
  lowLabel: LocalizedText;
  tieBreakQuestionId: string;
}

export interface StrainQuestion {
  id: string;
  number: number;
  dimension: DimensionId;
  reversed: boolean;
  prompt: LocalizedText;
  knowledgeKey: keyof typeof GLOSSARY;
}

export interface GlossaryEntry {
  term: LocalizedText;
  summary: LocalizedText;
  explanation: LocalizedText;
}

export interface ResultProfile {
  title: LocalizedText;
  summary: LocalizedText;
  projectLink: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
}

const localized = (zh: string, en: string): LocalizedText => ({
  "zh-CN": zh,
  en,
});

export const QINGLAN_COVER_IMAGE = new URL(
  "../assets/strain-personality/qinglan-bay-guide.webp",
  import.meta.url,
).href;

const RESULT_IMAGES: Record<PersonalityType, string> = {
  SAH: new URL(
    "../assets/strain-personality/qinglan-sah.webp",
    import.meta.url,
  ).href,
  SAL: new URL(
    "../assets/strain-personality/qinglan-sal.webp",
    import.meta.url,
  ).href,
  SIH: new URL(
    "../assets/strain-personality/qinglan-sih.webp",
    import.meta.url,
  ).href,
  SIL: new URL(
    "../assets/strain-personality/qinglan-sil.webp",
    import.meta.url,
  ).href,
  FAH: new URL(
    "../assets/strain-personality/qinglan-fah.webp",
    import.meta.url,
  ).href,
  FAL: new URL(
    "../assets/strain-personality/qinglan-fal.webp",
    import.meta.url,
  ).href,
  FIH: new URL(
    "../assets/strain-personality/qinglan-fih.webp",
    import.meta.url,
  ).href,
  FIL: new URL(
    "../assets/strain-personality/qinglan-fil.webp",
    import.meta.url,
  ).href,
};

export const QUIZ_META = {
  questionCount: 24,
  questionsPerDimension: 8,
  duration: localized("约 5 分钟", "About 5 minutes"),
} as const;

export const QINGLAN_INTRO = localized(
  "欢迎来到青澜湾。这是一座温润安静的滨海小城，一侧依偎着连绵和缓的浅山，草木常年葱郁；另一侧铺展着绵长柔和的沙滩，海岸线弯成一道舒缓的弧线。晴日里，海湾的阳光清透不灼人，海风带着淡淡的咸湿气息。沿着海岸，有条开阔的滨海步道与沙滩草坪；往山林深处走，树荫堆叠出成片阴凉，藏着幽静的慢行栈道。临海一带也设有展览馆、临海咖啡馆，可供游人避开日晒，静坐小憩。这里依海而生，渔业兴盛，街边餐馆常备刚捕捞上来的鲜鱼，也常有溏心蛋、鲜奶与本地奶制品。现在，请想象你即将开启一场青澜湾短途度假。下面所有描述，都是你在这座小城游玩时可能做出的选择、生出的真实感受，请凭第一直觉选出符合你的程度。",
  "Welcome to Qinglan Bay, a mild and quiet coastal town between gentle green hills and a long curving beach. A broad waterfront path and beach lawn follow the shore; shaded woodland boardwalks wind inland, while a gallery and seaside cafe offer places to pause away from the sun. Local restaurants serve freshly caught fish, soft-boiled eggs, milk, and regional dairy foods. Imagine that you are about to begin a short holiday here. For each scene, choose the response that best matches your first instinct.",
);

export const UI_COPY: Record<string, LocalizedText> = {
  brand: localized("青澜湾菌株人格测评", "Qinglan Bay Strain Profile"),
  localOnly: localized("仅本地保存 · 不上传答案", "LOCAL ONLY · NO ANSWERS UPLOADED"),
  languageGroup: localized("切换显示语言", "Change display language"),
  landingEyebrow: localized("一段滨海科普漫游", "A coastal science field note"),
  landingTitle: localized("你的青澜湾菌株人格是哪一型？", "Which Qinglan Bay strain profile are you?"),
  landingDescription: localized(
    "24 个旅行情境，组成 S/F、A/I、H/L 三条创意科普维度。",
    "Twenty-four travel scenes across three creative science dimensions: S/F, A/I, and H/L.",
  ),
  creativeTitle: localized("创意隐喻，不是医学结论", "A creative metaphor, not a medical result"),
  creativeBody: localized(
    "这些代码只服务于项目科普叙事，不代表真实维生素D水平、7-DHC储备、营养状态或任何医学诊断。",
    "These codes support a project storytelling activity. They do not represent real vitamin D levels, 7-DHC reserves, nutritional status, or a medical diagnosis.",
  ),
  guideAlt: localized(
    "青澜湾导览图，标有沙滩、滨海步道、山林栈道、展览馆和临海咖啡馆",
    "Illustrated guide to Qinglan Bay showing the beach, waterfront path, woodland boardwalk, gallery, and seaside cafe",
  ),
  guideCaption: localized("青澜湾导览图 · 来源原图", "Qinglan Bay visitor map · original supplied artwork"),
  guideEnglishNote: localized(
    "导览：海湾沙滩、滨海步道与草坪在海岸一侧；山林慢行栈道位于内陆；展览馆与临海咖啡馆提供室内休息点。",
    "Map guide: the bay beach, waterfront path, and lawn follow the coast; the woodland boardwalk runs inland; the gallery and seaside cafe provide indoor rest stops.",
  ),
  assessmentFacts: localized("24 题 · 3 个维度 · 4 档选择", "24 questions · 3 dimensions · 4 choices"),
  start: localized("开始青澜湾旅程", "Begin the Qinglan Bay journey"),
  resume: localized("继续上次旅程", "Continue your journey"),
  privacy: localized(
    "答案与进度只保存在当前浏览器中。",
    "Answers and progress stay only in this browser.",
  ),
  dimensionGroup: localized("选择题目维度", "Choose a question dimension"),
  questionGroup: localized("选择本维度题目", "Choose a question in this dimension"),
  overallProgress: localized("总体进度", "Overall progress"),
  answered: localized("已答", "answered"),
  unanswered: localized("未答", "unanswered"),
  question: localized("问题", "Question"),
  responsePrompt: localized("请选择最符合你的程度", "Choose the response that fits you best"),
  responseGroup: localized("四档回答选项", "Four response choices"),
  knowledgeEyebrow: localized("旅行知识点", "FIELD NOTE"),
  openKnowledge: localized("打开完整知识库", "Open the full knowledge base"),
  knowledgeDialogEyebrow: localized("青澜湾知识库", "QINGLAN BAY KNOWLEDGE BASE"),
  knowledgeDialogTitle: localized("旅途中用到的科学概念", "Science concepts used on this journey"),
  close: localized("关闭", "Close"),
  previous: localized("上一题", "Previous"),
  next: localized("保存并下一题", "Save and continue"),
  goUnanswered: localized("前往未答题", "Go to unanswered"),
  viewResult: localized("查看我的类型", "View my profile"),
  restart: localized("重新开始", "Restart"),
  resetConfirm: localized("清除这次旅程的全部答案？", "Clear every answer from this journey?"),
  storageUnavailable: localized(
    "当前标签页仍可继续，但浏览器本地存储暂不可用。",
    "You can continue in this tab, but browser storage is unavailable.",
  ),
  resultEyebrow: localized("你的青澜湾菌株人格", "Your Qinglan Bay strain profile"),
  resultSummary: localized("24 个旅行情境已完成", "All 24 travel scenes completed"),
  projectConnection: localized("项目联动", "Project connection"),
  dimensionReading: localized("三维旅程记录", "Three-dimension journey record"),
  preference: localized("倾向", "lean"),
  review: localized("回看答案", "Review answers"),
  backHome: localized("返回封面", "Back to cover"),
  disclaimerTitle: localized("非诊断声明", "Non-diagnostic notice"),
  disclaimer: localized(
    "本测评是围绕项目知识设计的创意科普互动，不是医学诊断、营养处方、心理测评或真实生理检测。结果只表达叙事型偏好与项目隐喻，不能判断维生素D水平、7-DHC储备或健康状态；如有健康疑问，请咨询合格医疗专业人士。",
    "This is a creative science activity built around the project. It is not a medical diagnosis, nutrition prescription, psychological assessment, or physiological test. Results express narrative preferences and project metaphors only; they cannot determine vitamin D level, 7-DHC reserve, or health status. Consult a qualified healthcare professional for health concerns.",
  ),
};

export const LANGUAGE_OPTIONS: Array<{ locale: Locale; label: string }> = [
  { locale: "zh-CN", label: "中文" },
  { locale: "en", label: "EN" },
];

export const SCALE_OPTIONS: Array<{
  value: ScaleValue;
  label: LocalizedText;
}> = [
  { value: 1, label: localized("非常不同意", "Strongly disagree") },
  { value: 2, label: localized("不太同意", "Somewhat disagree") },
  { value: 3, label: localized("比较同意", "Somewhat agree") },
  { value: 4, label: localized("非常同意", "Strongly agree") },
];

export const DIMENSIONS: DimensionDefinition[] = [
  {
    id: "SF",
    highPole: "S",
    lowPole: "F",
    label: localized("向阳 / 避光", "Sun-seeking / Shade-seeking"),
    description: localized("旅行中的日光路线偏好", "Daylight route preferences while travelling"),
    highLabel: localized("S 向阳型", "S Sun-seeking"),
    lowLabel: localized("F 避光型", "F Shade-seeking"),
    tieBreakQuestionId: "qinglan-sf-07",
  },
  {
    id: "AI",
    highPole: "A",
    lowPole: "I",
    label: localized("充足 / 易缺", "Supplied / At-risk metaphor"),
    description: localized("饮食、补给与日常感受的叙事分类", "A narrative classification of food, supplements, and daily feelings"),
    highLabel: localized("A 维D充足隐喻", "A Supplied metaphor"),
    lowLabel: localized("I 维D易缺隐喻", "I At-risk metaphor"),
    tieBreakQuestionId: "qinglan-ai-08",
  },
  {
    id: "HL",
    highPole: "H",
    lowPole: "L",
    label: localized("高储备 / 低储备", "High-reserve / Low-reserve"),
    description: localized("7-DHC 项目概念的创意映射", "A creative mapping of the project's 7-DHC concept"),
    highLabel: localized("H 高储备隐喻", "H High-reserve metaphor"),
    lowLabel: localized("L 低储备隐喻", "L Low-reserve metaphor"),
    tieBreakQuestionId: "qinglan-hl-01",
  },
];

export const GLOSSARY = {
  "sunlight-exposure": {
    term: localized("日光与维生素D", "Sunlight and vitamin D"),
    summary: localized(
      "皮肤可在紫外线B参与下合成维生素D，但实际效果受多种因素影响。",
      "Skin can make vitamin D with UVB exposure, but real-world production varies with many factors.",
    ),
    explanation: localized(
      "日照季节、纬度、云量、衣着、防晒方式、肤色、年龄与个人健康都会影响皮肤合成维生素D。旅行偏好题不能计算个人所需日晒量，也不应替代本地防晒建议。",
      "Season, latitude, cloud cover, clothing, sun protection, skin tone, age, and individual health can all affect vitamin D synthesis in skin. A travel-preference question cannot calculate anyone's required sun exposure and should not replace local sun-safety guidance.",
    ),
  },
  "sun-protection": {
    term: localized("防晒选择", "Sun-protection choices"),
    summary: localized(
      "遮阳、衣物与防晒用品都是减少紫外线暴露的常见方式。",
      "Shade, clothing, and sunscreen are common ways to reduce ultraviolet exposure.",
    ),
    explanation: localized(
      "紫外线强度会随时间、地点和天气变化。是否停留在户外以及采取何种防护，应结合当地紫外线指数、活动时长和个人情况判断；本测评不提供具体日晒时长或防晒处方。",
      "UV intensity changes with time, place, and weather. Decisions about outdoor time and protection should account for the local UV index, activity duration, and personal circumstances. This activity does not prescribe exposure duration or sun-protection treatment.",
    ),
  },
  "food-sources": {
    term: localized("膳食来源", "Dietary sources"),
    summary: localized(
      "鱼类、蛋黄和部分强化食品可以为膳食提供维生素D。",
      "Fish, egg yolk, and some fortified foods can contribute vitamin D to a diet.",
    ),
    explanation: localized(
      "不同食品与品牌的维生素D含量差异很大，奶制品是否强化也取决于地区和产品。选择某类餐食并不能证明个人维生素D状态，均衡饮食建议应结合当地指南和专业意见。",
      "Vitamin D content varies widely by food and brand, and dairy fortification differs by region and product. Choosing a food cannot establish someone's vitamin D status; balanced-diet guidance should follow local recommendations and professional advice.",
    ),
  },
  "vitamin-d-status": {
    term: localized("维生素D状态", "Vitamin D status"),
    summary: localized(
      "真实维生素D状态需要合适的实验室检测与专业解读。",
      "Real vitamin D status requires an appropriate laboratory test and professional interpretation.",
    ),
    explanation: localized(
      "临床通常结合血液中的 25-羟维生素D 检测、病史及其他信息判断维生素D状态。补剂使用与检测结果都不能由娱乐问卷推断；如有疑问，应由合格医疗专业人士评估。",
      "Clinical assessment commonly considers a blood 25-hydroxyvitamin D test together with medical history and other information. Supplement use and test results cannot be inferred from an entertainment quiz; a qualified healthcare professional should assess concerns.",
    ),
  },
  "nonspecific-signals": {
    term: localized("非特异性感受", "Nonspecific feelings"),
    summary: localized(
      "疲惫、情绪变化或肌肉不适可能有许多原因，不能单独指向维生素D状态。",
      "Fatigue, mood changes, or muscle discomfort can have many causes and do not identify vitamin D status on their own.",
    ),
    explanation: localized(
      "旅行中的睡眠、活动量、饮食、压力、天气和既有健康状况都可能影响感受。若症状持续、加重或令人担忧，应寻求医疗评估，而不是依赖本测评结果。",
      "Sleep, activity, food, stress, weather, and existing health conditions can all shape how someone feels while travelling. Persistent, worsening, or concerning symptoms warrant medical assessment rather than reliance on this result.",
    ),
  },
  "skin-response": {
    term: localized("皮肤日晒反应", "Skin response to sunlight"),
    summary: localized(
      "晒红、晒黑、干燥或敏感反应因人而异，并不是营养检测。",
      "Redness, tanning, dryness, and sensitivity vary between people and are not nutritional tests.",
    ),
    explanation: localized(
      "皮肤对日晒的反应与肤色、暴露强度和时长、护理方式及其他因素有关。是否容易晒红或产生舒适感，不能测量维生素D水平，也不能推断人体 7-DHC 储备。",
      "Skin response depends on skin tone, exposure intensity and duration, care practices, and other factors. Redness or a feeling of comfort cannot measure vitamin D level or infer a person's 7-DHC reserve.",
    ),
  },
  "seven-dhc": {
    term: localized("7-DHC", "7-DHC"),
    summary: localized(
      "7-脱氢胆固醇是维生素D3形成过程中的前体，也是本项目关注的目标甾醇。",
      "7-dehydrocholesterol is a precursor in vitamin D3 formation and the target sterol highlighted by this project.",
    ),
    explanation: localized(
      "本项目用解脂耶氏酵母细胞工厂研究 7-DHC 生产。测评中的 H/L 只是把“底物储备”转化为角色叙事，问卷无法检测或估计体验者体内真实 7-DHC。",
      "The project studies 7-DHC production using a Yarrowia lipolytica cell factory. H/L turns the idea of substrate reserve into character storytelling only; the quiz cannot detect or estimate a participant's actual bodily 7-DHC.",
    ),
  },
  "creative-metaphor": {
    term: localized("创意科普隐喻", "Creative science metaphor"),
    summary: localized(
      "三字母类型用于连接旅行选择与项目概念，不是人体分类。",
      "The three-letter types connect travel choices with project concepts; they do not classify human biology.",
    ),
    explanation: localized(
      "S/F、A/I、H/L 是本活动为讲解日光、膳食与 7-DHC 项目而设计的叙事坐标。结果不应被用于医疗、营养、心理或生活决策。",
      "S/F, A/I, and H/L are narrative coordinates designed to discuss sunlight, diet, and the 7-DHC project. Results should not guide medical, nutritional, psychological, or lifestyle decisions.",
    ),
  },
} satisfies Record<string, GlossaryEntry>;

type KnowledgeKey = keyof typeof GLOSSARY;
type QuestionSeed = readonly [
  number,
  boolean,
  LocalizedText,
  KnowledgeKey,
];

function buildQuestions(
  dimension: DimensionId,
  firstNumber: number,
  seeds: readonly QuestionSeed[],
): StrainQuestion[] {
  return seeds.map(([number, reversed, prompt, knowledgeKey]) => ({
    id: `qinglan-${dimension.toLowerCase()}-${String(number - firstNumber + 1).padStart(2, "0")}`,
    number,
    dimension,
    reversed,
    prompt,
    knowledgeKey,
  }));
}

const SF_QUESTIONS: readonly QuestionSeed[] = [
  [1, false, localized("在青澜湾度假，天气舒适时，我会安排沙滩漫步、露天步道这类可以晒到阳光的行程", "During a Qinglan Bay getaway, when the weather is comfortable, I would plan beach walks or open-air paths where I can get some sunlight."), "sunlight-exposure"],
  [2, true, localized("如果正午去青澜湾的沙滩，我会备好遮阳伞、长袖、墨镜，做好防晒", "If I went to Qinglan Bay beach at noon, I would bring a parasol, long sleeves, and sunglasses for sun protection."), "sun-protection"],
  [3, false, localized("比起临海室内展馆，我更想去沙滩、山间露天步道这类户外景点游玩", "I would rather visit the beach or an open-air mountain path than a seaside indoor gallery."), "sunlight-exposure"],
  [4, false, localized("在青澜湾遇上正午强光，我会尽快躲进山林树荫里，不打算长时间暴晒", "If I encountered strong midday light in Qinglan Bay, I would move into woodland shade rather than remain exposed for long."), "sun-protection"],
  [5, false, localized("在青澜湾中途休息时，我更愿意坐在沙滩向阳的区域放松", "When taking a break in Qinglan Bay, I would rather relax in a sunny part of the beach."), "sunlight-exposure"],
  [6, true, localized("夏季到访青澜湾，我会刻意避开正午长时间的沙滩户外活动", "On a summer visit to Qinglan Bay, I would deliberately avoid long outdoor beach activities at noon."), "sun-protection"],
  [7, false, localized("在青澜湾遇见柔和的海边日光，我不会刻意遮挡皮肤，愿意自然感受日晒", "In gentle seaside light at Qinglan Bay, I would not deliberately cover my skin and would be comfortable experiencing the sunlight naturally."), "sunlight-exposure"],
  [8, true, localized("前往青澜湾度假，我的穿搭会优先选择长袖、宽檐帽，减少皮肤直接接触阳光", "For a Qinglan Bay holiday, I would prioritize long sleeves and a wide-brimmed hat to reduce direct sunlight on my skin."), "sun-protection"],
];

const AI_QUESTIONS: readonly QuestionSeed[] = [
  [9, false, localized("在青澜湾就餐，我会主动选择本地鲜鱼、煎蛋、鲜奶这类特色餐食", "When dining in Qinglan Bay, I would actively choose local fresh fish, fried eggs, and milk."), "food-sources"],
  [10, true, localized("在青澜湾游玩，我更偏爱室内展馆打卡，白天很少在沙滩、山间接触自然光", "While exploring Qinglan Bay, I would favor indoor galleries and spend little daytime at the beach or in the hills."), "sunlight-exposure"],
  [11, false, localized("如果在青澜湾连续多日待在阴凉室内、少见阳光，我容易疲惫、情绪低落", "If I spent several days in shaded indoor places in Qinglan Bay with little sunlight, I would tend to feel tired or low."), "nonspecific-signals"],
  [12, false, localized("长途前往青澜湾度假，我有规律服用维D补剂的习惯", "For a long journey to Qinglan Bay, I have a routine of taking vitamin D supplements regularly."), "vitamin-d-status"],
  [13, false, localized("在青澜湾长时间赶路观光、缺少运动时，我的肌肉容易酸胀乏力", "After long hours of sightseeing in Qinglan Bay with little exercise, my muscles tend to feel sore or weak."), "nonspecific-signals"],
  [14, true, localized("在青澜湾用餐，我很少选择海鱼、蛋奶这类本地特色食物", "When dining in Qinglan Bay, I would rarely choose local foods such as sea fish, eggs, or dairy."), "food-sources"],
  [15, true, localized("在青澜湾游玩，我大多选择室内场馆，白天几乎不接触户外自然光", "In Qinglan Bay, I would mostly choose indoor venues and have almost no outdoor daylight exposure during the day."), "sunlight-exposure"],
  [16, false, localized("日常体检中，我的维生素D指标长期维持在健康理想区间", "In routine health checks, my vitamin D measure has remained in a healthy target range over time."), "vitamin-d-status"],
];

const HL_QUESTIONS: readonly QuestionSeed[] = [
  [17, false, localized("在青澜湾适度晒沙滩阳光后，我的皮肤更容易均匀晒出柔和底色，不容易立刻发红刺痛", "After moderate beach sunlight in Qinglan Bay, my skin tends to tan evenly rather than becoming red or stinging immediately."), "seven-dhc"],
  [18, false, localized("如果整趟青澜湾行程全程躲在室内、避开日晒，我很难靠自身状态抵消缺光带来的乏力感", "If I stayed indoors and avoided sunlight throughout the Qinglan Bay trip, I would find it hard to shake off the tiredness I associate with low light."), "nonspecific-signals"],
  [19, false, localized("在青澜湾海边偏干燥的环境度假，我的皮肤不容易干痒、起皮敏感", "In the relatively dry seaside environment of Qinglan Bay, my skin is not prone to itching, flaking, or sensitivity."), "skin-response"],
  [20, true, localized("就算在青澜湾沙滩晒过太阳，我也很难感受到放松、精力变好的感觉", "Even after spending time in the sun on Qinglan Bay beach, I find it hard to feel more relaxed or energetic."), "nonspecific-signals"],
  [21, false, localized("在青澜湾晒一会儿柔和的海边日光，我会明显觉得心情和舒适感提升", "After a little gentle seaside light in Qinglan Bay, I would notice an improvement in my mood and comfort."), "sunlight-exposure"],
  [22, false, localized("如果整趟青澜湾旅程长期待在阴凉室内，我很容易疲惫、提不起精神", "If I spent most of the Qinglan Bay trip in shaded indoor spaces, I would easily feel tired and unmotivated."), "nonspecific-signals"],
  [23, false, localized("在青澜湾旅行，我不抗拒点蛋黄、奶制品这类餐品", "While travelling in Qinglan Bay, I would be open to ordering foods such as egg yolk and dairy products."), "food-sources"],
  [24, true, localized("和同行同伴在青澜湾沙滩晒相同时长的太阳，我更少感受到日晒带来的舒缓感", "Compared with a companion spending the same amount of time in the sun on Qinglan Bay beach, I am less likely to feel a soothing effect."), "seven-dhc"],
];

export const QUESTIONS: StrainQuestion[] = [
  ...buildQuestions("SF", 1, SF_QUESTIONS),
  ...buildQuestions("AI", 9, AI_QUESTIONS),
  ...buildQuestions("HL", 17, HL_QUESTIONS),
];

const profile = (
  type: PersonalityType,
  title: LocalizedText,
  summary: LocalizedText,
  projectLink: LocalizedText,
  imageAlt: LocalizedText,
): ResultProfile => ({
  title,
  summary,
  projectLink,
  image: RESULT_IMAGES[type],
  imageAlt,
});

export const RESULT_PROFILES: Record<PersonalityType, ResultProfile> = {
  SAH: profile(
    "SAH",
    localized("向阳 · 充足 · 高储备", "Sun-seeking · supplied · high-reserve"),
    localized("在青澜湾的叙事里，你偏爱户外与阳光，也展现出补给充分、底物充足的角色倾向。", "In the Qinglan Bay story, you favor outdoor light and take on a character associated with strong supply and plentiful substrate."),
    localized("这是高效合成 7-DHC 的理想模型，也是解脂耶氏酵母细胞工厂追求的状态。", "This is the project's ideal model for efficient 7-DHC production and the state pursued in its Yarrowia lipolytica cell factory."),
    localized("SAH 角色站在晴朗海滩上，身边有贝壳与瓶子", "SAH character on a bright beach with shells and a bottle"),
  ),
  SAL: profile(
    "SAL",
    localized("向阳 · 充足 · 低储备", "Sun-seeking · supplied · low-reserve"),
    localized("在青澜湾的叙事里，你愿意接触日光，也有稳定补给倾向，但底物储备角色偏低。", "In the Qinglan Bay story, you welcome daylight and steady supply, while the character's substrate reserve is lower."),
    localized("光照充足但底物不足，外源供给 7-DHC 可以突破合成瓶颈。", "Light is available but substrate is limited; external 7-DHC supply represents a way past the production bottleneck."),
    localized("SAL 角色穿运动感服饰，在晴天海边做出点赞姿势", "SAL character in sporty clothes giving a thumbs-up by the sunny sea"),
  ),
  SIH: profile(
    "SIH",
    localized("向阳 · 易缺 · 高储备", "Sun-seeking · at-risk · high-reserve"),
    localized("在青澜湾的叙事里，你愿意接触日光，但日常补给线索偏弱；角色仍保有充足底物潜力。", "In the Qinglan Bay story, you welcome daylight but show weaker everyday supply cues, while the character retains plentiful substrate potential."),
    localized("优质底物储备已经具备，补齐外部条件即可帮助项目模型高效合成目标产物。", "Strong substrate reserve is already present; completing the external conditions helps the project model produce its target efficiently."),
    localized("SIH 角色戴着遮阳帽，身边有餐具与食物线索", "SIH character in a sun hat with tableware and food cues"),
  ),
  SIL: profile(
    "SIL",
    localized("向阳 · 易缺 · 低储备", "Sun-seeking · at-risk · low-reserve"),
    localized("在青澜湾的叙事里，你不抗拒阳光，但补给与底物两条角色线索都偏弱。", "In the Qinglan Bay story, you do not avoid sunlight, while both the supply and substrate cues are weaker."),
    localized("光照条件具备，但底物和补给形成双重短板；项目隐喻指向外源补充 7-DHC。", "Light is available, but substrate and supply form a double constraint; the project metaphor points to external 7-DHC supply."),
    localized("SIL 角色戴遮阳帽和黄色披肩，在海浪前活跃地跳起", "SIL character in a sun hat and yellow wrap jumping in front of the waves"),
  ),
  FAH: profile(
    "FAH",
    localized("避光 · 充足 · 高储备", "Shade-seeking · supplied · high-reserve"),
    localized("在青澜湾的叙事里，你偏好阴凉路线并重视防晒，同时呈现稳定补给与高底物储备角色。", "In the Qinglan Bay story, you favor shade and sun protection while taking on a character with steady supply and high substrate reserve."),
    localized("底物充足但缺少光照开关，项目模型更适合直接获得目标产物。", "Substrate is plentiful but the light switch is limited, so the project model is better matched with direct access to the target product."),
    localized("FAH 角色在海滩撑着遮阳伞，身边摆有防晒用品", "FAH character holding a parasol on the beach beside sun-protection items"),
  ),
  FAL: profile(
    "FAL",
    localized("避光 · 充足 · 低储备", "Shade-seeking · supplied · low-reserve"),
    localized("在青澜湾的叙事里，你习惯避光并依靠饮食或补给线索维持稳定，底物储备角色偏低。", "In the Qinglan Bay story, you tend to avoid light and rely on food or supply cues for stability, while the character's substrate reserve is lower."),
    localized("天然光合成通路利用率低，项目隐喻更适配外源直接补充。", "The natural light-driven pathway is used less, so the project metaphor fits direct external supply."),
    localized("FAL 角色坐在室内帘幕旁，桌上有餐盘与补给用品", "FAL character indoors by curtains with a plate and supply items on the table"),
  ),
  FIH: profile(
    "FIH",
    localized("避光 · 易缺 · 高储备", "Shade-seeking · at-risk · high-reserve"),
    localized("在青澜湾的叙事里，你偏爱阴凉环境、较少接触日光，补给线索偏弱，但底物潜力仍然充足。", "In the Qinglan Bay story, you favor shade and encounter less daylight, with weaker supply cues but plentiful substrate potential."),
    localized("底物已经具备但缺少光照触发；酵母工厂模型可以直接利用底物合成目标产物。", "Substrate is available but the light trigger is missing; the yeast-factory model can use the substrate directly to produce its target."),
    localized("FIH 角色裹着披毯和兜帽，夜色中放着补给瓶", "FIH character wrapped in a blanket and hood beside a bottle at night"),
  ),
  FIL: profile(
    "FIL",
    localized("避光 · 易缺 · 低储备", "Shade-seeking · at-risk · low-reserve"),
    localized("在青澜湾的叙事里，你偏好避光路线，补给与底物两条角色线索也都偏弱。", "In the Qinglan Bay story, you favor shade while both the supply and substrate cues are weaker."),
    localized("光照与底物双重受限，项目隐喻将外源 7-DHC 供给作为最匹配的解决方向。", "Both light and substrate are constrained, so the project metaphor treats external 7-DHC supply as the closest fit."),
    localized("FIL 角色穿雨衣背着背包，站在阴雨公园里并带着维D瓶", "FIL character in a raincoat and backpack standing in a rainy park with a vitamin D bottle"),
  ),
};

export function textFor(text: LocalizedText, locale: Locale) {
  return text[locale];
}
