import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================
  // Classes + Specs
  // ============================================
  const classes = [
    {
      name: "Heavy Guardian", nameJa: "ヘヴィガーディアン", role: "Tank", mainStat: "Strength", sortOrder: 1,
      specs: [{ name: "Block", nameJa: "ブロック", sortOrder: 1 }, { name: "Earthfort", nameJa: "アースフォート", sortOrder: 2 }],
    },
    {
      name: "Shield Knight", nameJa: "シールドナイト", role: "Tank", mainStat: "Strength", sortOrder: 2,
      specs: [{ name: "Recovery", nameJa: "リカバリー", sortOrder: 1 }, { name: "Shield", nameJa: "シールド", sortOrder: 2 }],
    },
    {
      name: "Stormblade", nameJa: "ストームブレード", role: "DPS", mainStat: "Agility", sortOrder: 3,
      specs: [{ name: "Iaido", nameJa: "居合", sortOrder: 1 }, { name: "Moonstrike", nameJa: "月撃", sortOrder: 2 }],
    },
    {
      name: "Wind Knight", nameJa: "ウィンドナイト", role: "DPS", mainStat: "Agility", sortOrder: 4,
      specs: [{ name: "Vanguard", nameJa: "ヴァンガード", sortOrder: 1 }, { name: "Skyward", nameJa: "スカイワード", sortOrder: 2 }],
    },
    {
      name: "Marksman", nameJa: "マークスマン", role: "DPS", mainStat: "Agility", sortOrder: 5,
      specs: [{ name: "Wildpack", nameJa: "ワイルドパック", sortOrder: 1 }, { name: "Falconry", nameJa: "ファルコンリー", sortOrder: 2 }],
    },
    {
      name: "Frost Mage", nameJa: "フロストメイジ", role: "DPS", mainStat: "Intellect", sortOrder: 6,
      specs: [{ name: "Icicle", nameJa: "アイシクル", sortOrder: 1 }, { name: "Frostbeam", nameJa: "フロストビーム", sortOrder: 2 }],
    },
    {
      name: "Verdant Oracle", nameJa: "ヴァーダントオラクル", role: "Healer", mainStat: "Intellect", sortOrder: 7,
      specs: [{ name: "Lifebind", nameJa: "ライフバインド", sortOrder: 1 }, { name: "Smite", nameJa: "スマイト", sortOrder: 2 }],
    },
    {
      name: "Beat Performer", nameJa: "ビートパフォーマー", role: "Support", mainStat: "Intellect", sortOrder: 8,
      specs: [{ name: "Dissonance", nameJa: "ディソナンス", sortOrder: 1 }, { name: "Concerto", nameJa: "コンチェルト", sortOrder: 2 }],
    },
  ];

  for (const cls of classes) {
    const { specs, ...classData } = cls;
    await prisma.dictClass.create({
      data: { ...classData, specs: { create: specs } },
    });
  }

  // ============================================
  // Season 1 Dungeons — Chaotic Realm
  // ============================================
  const s1Dungeons = [
    { name: "Goblin Nest", nameJa: "ゴブリンネスト", season: "SEASON_1" as const, partySize: 4, sortOrder: 1, description: "Gauntlets + Earrings" },
    { name: "Tina's Mindrealm", nameJa: "ティナの精神領域", season: "SEASON_1" as const, partySize: 4, sortOrder: 2, description: "Helmet + Necklace" },
    { name: "Towering Ruin", nameJa: "塔立つ遺跡", season: "SEASON_1" as const, partySize: 4, sortOrder: 3, description: "Armor + Ring" },
    { name: "Kanamia Trial", nameJa: "カナミアの試練", season: "SEASON_1" as const, partySize: 4, sortOrder: 4, description: "Boots + Charm" },
    { name: "Dragon Claw Valley", nameJa: "ドラゴンクロー渓谷", season: "SEASON_1" as const, partySize: 4, sortOrder: 5, description: "Left/Right Bracelets" },
    { name: "Dark Mist Fortress", nameJa: "暗霧の砦", season: "SEASON_1" as const, partySize: 4, sortOrder: 6, description: "Weapon" },
  ];

  for (const d of s1Dungeons) {
    await prisma.dictContent.create({ data: { contentType: "DUNGEON", ...d } });
  }

  // ============================================
  // Season 2 Dungeons — Shadow of Dreams
  // ============================================
  const s2Dungeons = [
    { name: "Depths of Decay", nameJa: "腐敗の深淵", season: "SEASON_2" as const, partySize: 4, sortOrder: 7, dreamStrengthNormal: 0, dreamStrengthHard: 220, dreamStrengthMaster1: 1480, dreamStrengthMaster6: 1790 },
    { name: "Rock Serpent Lair", nameJa: "岩蛇の巣窟", season: "SEASON_2" as const, partySize: 4, sortOrder: 8 },
    { name: "Wraith Shrine", nameJa: "亡霊の祠", season: "SEASON_2" as const, partySize: 4, sortOrder: 9, dreamStrengthNormal: 640, dreamStrengthHard: 820, dreamStrengthMaster1: 1480, dreamStrengthMaster6: 1790 },
    { name: "Soundless City", nameJa: "無音の都市", season: "SEASON_2" as const, partySize: 4, sortOrder: 10, dreamStrengthNormal: 800, dreamStrengthHard: 950, dreamStrengthMaster1: 1480, dreamStrengthMaster6: 1790 },
    { name: "Devourer Cage", nameJa: "捕食者の檻", season: "SEASON_2" as const, partySize: 4, sortOrder: 11 },
    { name: "Illusory Moonveil Wilds", nameJa: "幻影の月霞野", season: "SEASON_2" as const, partySize: 4, sortOrder: 12 },
  ];

  for (const d of s2Dungeons) {
    await prisma.dictContent.create({ data: { contentType: "DUNGEON", ...d } });
  }

  // ============================================
  // Raids
  // ============================================
  const raids = [
    { name: "Dragon Shackles Raid 1", nameJa: "竜の枷鎖 レイド1", season: "SEASON_1" as const, partySize: 20, sortOrder: 1 },
    { name: "Dragon Shackles Raid 2", nameJa: "竜の枷鎖 レイド2", season: "SEASON_1" as const, partySize: 20, sortOrder: 2 },
    { name: "Dragon Shackles Raid 3", nameJa: "竜の枷鎖 レイド3", season: "SEASON_1" as const, partySize: 20, sortOrder: 3 },
    { name: "Dreambloom Ruins: Caprahorn", nameJa: "夢幻廃墟：カプラホーン", season: "SEASON_2" as const, partySize: 20, sortOrder: 4 },
    { name: "Dreambloom Ruins: Withered Bloomshard", nameJa: "夢幻廃墟：枯れし夢幻の欠片", season: "SEASON_2" as const, partySize: 20, sortOrder: 5 },
    { name: "Dreambloom Ruins: Erosion Bloom Afterimage", nameJa: "夢幻廃墟：浸蝕の夢幻の残像", season: "SEASON_2" as const, partySize: 20, sortOrder: 6 },
  ];

  for (const r of raids) {
    await prisma.dictContent.create({ data: { contentType: "RAID", ...r } });
  }

  // ============================================
  // Other Content
  // ============================================
  const otherContent = [
    { name: "World Boss", nameJa: "ワールドボス", contentType: "WORLD_BOSS" as const, partySize: 20, sortOrder: 13 },
    { name: "Rush Battle", nameJa: "ラッシュバトル", contentType: "RUSH_BATTLE" as const, partySize: 4, sortOrder: 14 },
    { name: "Training Ruins", nameJa: "修練の遺跡", contentType: "TRAINING_RUINS" as const, partySize: 6, sortOrder: 15 },
    { name: "Stimen Vaults", nameJa: "スティメン金庫", contentType: "STIMEN_VAULT" as const, partySize: 4, sortOrder: 16 },
    { name: "Unstable Space", nameJa: "不安定空間", contentType: "OTHER" as const, partySize: 4, sortOrder: 17 },
  ];

  for (const c of otherContent) {
    await prisma.dictContent.create({ data: c });
  }

  // ============================================
  // Difficulties
  // ============================================
  const difficulties = [
    { name: "Normal", nameJa: "ノーマル", contentType: "DUNGEON" as const, sortOrder: 1 },
    { name: "Hard", nameJa: "ハード", contentType: "DUNGEON" as const, sortOrder: 2 },
    { name: "Master", nameJa: "マスター", contentType: "DUNGEON" as const, levelBased: true, minLevel: 1, maxLevel: 20, sortOrder: 3 },
    { name: "Normal", nameJa: "ノーマル", contentType: "RAID" as const, sortOrder: 1 },
    { name: "Difficult", nameJa: "ディフィカルト", contentType: "RAID" as const, sortOrder: 2 },
    { name: "Nightmare", nameJa: "ナイトメア", contentType: "RAID" as const, sortOrder: 3 },
  ];

  for (const d of difficulties) {
    await prisma.dictDifficulty.create({ data: d });
  }

  // ============================================
  // Servers
  // ============================================
  const servers = [
    { name: "NA East", region: "NA", sortOrder: 1 },
    { name: "NA West", region: "NA", sortOrder: 2 },
    { name: "EU West", region: "EU", sortOrder: 3 },
    { name: "Asia (JP)", nameJa: "アジア（日本）", region: "JP", sortOrder: 4 },
    { name: "Asia (CN)", nameJa: "アジア（中国）", region: "CN", sortOrder: 5 },
    { name: "SA East", region: "SA", sortOrder: 6 },
  ];

  for (const s of servers) {
    await prisma.dictServer.create({ data: s });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
