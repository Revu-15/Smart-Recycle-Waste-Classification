-- CreateTable
CREATE TABLE "PredictionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT NOT NULL,
    "predictedLabel" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "material" TEXT NOT NULL,
    "recyclable" BOOLEAN NOT NULL,
    "contamination" TEXT NOT NULL,
    "cleaning" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "explanation" JSONB NOT NULL,
    "alternatives" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT NOT NULL,
    "predictedLabel" TEXT NOT NULL,
    "correctLabel" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userFeedback" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'stored'
);
