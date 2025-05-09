-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "user_Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "apiServerId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiServer" (
    "id" SERIAL NOT NULL,
    "apiUrl" VARCHAR(255) NOT NULL,
    "status" VARCHAR(10) NOT NULL,

    CONSTRAINT "ApiServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanData" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "level" TEXT,
    "more_detail" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ScanData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "room" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_Id_key" ON "User"("user_Id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_apiServerId_idx" ON "User"("apiServerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_username_key" ON "User"("email", "username");

-- CreateIndex
CREATE INDEX "ApiServer_apiUrl_idx" ON "ApiServer"("apiUrl");

-- CreateIndex
CREATE INDEX "ScanData_userId_idx" ON "ScanData"("userId");

-- CreateIndex
CREATE INDEX "ScanData_title_idx" ON "ScanData"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Post_room_key" ON "Post"("room");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_apiServerId_fkey" FOREIGN KEY ("apiServerId") REFERENCES "ApiServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanData" ADD CONSTRAINT "ScanData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;
