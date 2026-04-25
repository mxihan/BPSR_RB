-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dict_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "role" TEXT NOT NULL,
    "mainStat" TEXT NOT NULL,
    "iconUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dict_specs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dict_specs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "dict_classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dict_contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "season" TEXT NOT NULL DEFAULT 'ANY',
    "partySize" INTEGER NOT NULL DEFAULT 4,
    "description" TEXT,
    "dreamStrengthNormal" INTEGER,
    "dreamStrengthHard" INTEGER,
    "dreamStrengthMaster1" INTEGER,
    "dreamStrengthMaster6" INTEGER,
    "iconUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dict_difficulties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "levelBased" BOOLEAN NOT NULL DEFAULT false,
    "minLevel" INTEGER,
    "maxLevel" INTEGER,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dict_servers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "region" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "player_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "serverId" TEXT,
    "adventurerLevel" INTEGER,
    "primaryClassId" TEXT,
    "primarySpecId" TEXT,
    "secondaryClassId" TEXT,
    "secondarySpecId" TEXT,
    "abilityScore" INTEGER,
    "dreamLevel" INTEGER,
    "illusionStrength" INTEGER,
    "adventurerRank" INTEGER,
    "about" TEXT,
    "timezone" TEXT,
    "preferredPlayTimes" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "player_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_profiles_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "dict_servers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "player_profiles_primaryClassId_fkey" FOREIGN KEY ("primaryClassId") REFERENCES "dict_classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "player_profiles_primarySpecId_fkey" FOREIGN KEY ("primarySpecId") REFERENCES "dict_specs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "player_profiles_secondaryClassId_fkey" FOREIGN KEY ("secondaryClassId") REFERENCES "dict_classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "player_profiles_secondarySpecId_fkey" FOREIGN KEY ("secondarySpecId") REFERENCES "dict_specs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT,
    "season" TEXT NOT NULL DEFAULT 'ANY',
    "difficultyId" TEXT,
    "masterLevel" INTEGER,
    "description" TEXT,
    "scheduledAt" DATETIME,
    "autoCloseAt" DATETIME,
    "maxPartySize" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teams_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "dict_contents" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "teams_difficultyId_fkey" FOREIGN KEY ("difficultyId") REFERENCES "dict_difficulties" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "role_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "preferredClassId" TEXT,
    "preferredSpecId" TEXT,
    "minAbilityScore" INTEGER,
    "minDreamLevel" INTEGER,
    "minIllusionStrength" INTEGER,
    "isFilled" BOOLEAN NOT NULL DEFAULT false,
    "filledById" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "role_slots_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "role_slots_preferredClassId_fkey" FOREIGN KEY ("preferredClassId") REFERENCES "dict_classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "role_slots_preferredSpecId_fkey" FOREIGN KEY ("preferredSpecId") REFERENCES "dict_specs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "role_slots_filledById_fkey" FOREIGN KEY ("filledById") REFERENCES "player_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "applications_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "role_slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "player_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "slotId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_members_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "player_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_members_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "role_slots" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_comments_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "dict_classes_name_key" ON "dict_classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "dict_specs_classId_name_key" ON "dict_specs"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "applications_teamId_slotId_profileId_key" ON "applications"("teamId", "slotId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_profileId_key" ON "team_members"("teamId", "profileId");
