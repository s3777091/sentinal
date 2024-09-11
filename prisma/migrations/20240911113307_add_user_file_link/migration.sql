-- CreateTable
CREATE TABLE "UserFileLink" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFileLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFileLink_userId_idx" ON "UserFileLink"("userId");

-- CreateIndex
CREATE INDEX "UserFileLink_createdAt_idx" ON "UserFileLink"("createdAt");

-- AddForeignKey
ALTER TABLE "UserFileLink" ADD CONSTRAINT "UserFileLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;
