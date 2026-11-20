-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'EDITOR', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "RoomVisibility" AS ENUM ('PRIVATE', 'LINK');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocumentSnapshotKind" AS ENUM ('CHECKPOINT', 'RESTORE');

-- CreateEnum
CREATE TYPE "RoomActivityType" AS ENUM ('ROOM_CREATED', 'ROOM_ARCHIVED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'MEMBER_REMOVED', 'MEMBER_ROLE_CHANGED', 'INVITATION_CREATED', 'JOIN_CODE_ROTATED', 'DOCUMENT_SNAPSHOT_CREATED', 'CHALLENGE_CREATED', 'SUBMISSION_CREATED', 'PREDICTION_ROUND_SCORED');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMED_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TestOutcome" AS ENUM ('PASS', 'FAIL', 'ERROR', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PredictionRoundStatus" AS ENUM ('OPEN', 'LOCKED', 'SCORED', 'VOID');

-- CreateEnum
CREATE TYPE "PredictionOutcome" AS ENUM ('PASS', 'FAIL');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320),
    "username" VARCHAR(32),
    "displayName" VARCHAR(80) NOT NULL,
    "avatarUrl" VARCHAR(2048),
    "bio" VARCHAR(500),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordCredential" (
    "userId" UUID NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "passwordUpdatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "lastSeenAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "userId" UUID NOT NULL,
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "editorFontSize" INTEGER NOT NULL DEFAULT 14,
    "editorTabSize" INTEGER NOT NULL DEFAULT 2,
    "editorLineNumbers" BOOLEAN NOT NULL DEFAULT true,
    "notifyRoomInvitations" BOOLEAN NOT NULL DEFAULT true,
    "notifyChallengeUpdates" BOOLEAN NOT NULL DEFAULT true,
    "notifyProductUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "visibility" "RoomVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "archivedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMembership" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitationId" UUID,
    "joinCodeId" UUID,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(6),

    CONSTRAINT "RoomMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomInvitation" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "invitedById" UUID NOT NULL,
    "invitedUserId" UUID,
    "invitedEmail" VARCHAR(320),
    "tokenHash" CHAR(64),
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomJoinCode" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomJoinCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomDocument" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "documentKey" VARCHAR(80) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "languageId" UUID,
    "lastUpdateSequence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RoomDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomDocumentSnapshot" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "snapshotSequence" INTEGER NOT NULL,
    "updateSequence" INTEGER NOT NULL,
    "kind" "DocumentSnapshotKind" NOT NULL DEFAULT 'CHECKPOINT',
    "snapshotData" BYTEA NOT NULL,
    "stateVector" BYTEA,
    "checksum" CHAR(64) NOT NULL,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomDocumentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomDocumentUpdate" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "updateData" BYTEA NOT NULL,
    "checksum" CHAR(64) NOT NULL,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomDocumentUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomActivity" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "actorUserId" UUID,
    "targetUserId" UUID,
    "type" "RoomActivityType" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMessage" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "authorUserId" UUID,
    "body" TEXT,
    "editedAt" TIMESTAMPTZ(6),
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammingLanguage" (
    "id" UUID NOT NULL,
    "key" VARCHAR(40) NOT NULL,
    "displayName" VARCHAR(80) NOT NULL,
    "runtimeIdentifier" VARCHAR(100),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProgrammingLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "currentPublishedVersionId" UUID,
    "title" VARCHAR(160) NOT NULL,
    "archivedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeVersion" (
    "id" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,
    "starterCode" TEXT,
    "createdById" UUID NOT NULL,
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" UUID NOT NULL,
    "challengeVersionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSubmission" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "challengeVersionId" UUID NOT NULL,
    "documentId" UUID,
    "languageId" UUID NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "sourceHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionAttempt" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "challengeVersionId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "providerJobId" VARCHAR(128),
    "status" "ExecutionStatus" NOT NULL DEFAULT 'QUEUED',
    "stdout" TEXT,
    "stderr" TEXT,
    "compileOutput" TEXT,
    "exitCode" INTEGER,
    "runTimeMs" INTEGER,
    "memoryKb" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(6),
    "finishedAt" TIMESTAMPTZ(6),

    CONSTRAINT "ExecutionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionTestResult" (
    "id" UUID NOT NULL,
    "executionAttemptId" UUID NOT NULL,
    "testCaseId" UUID NOT NULL,
    "challengeVersionId" UUID NOT NULL,
    "outcome" "TestOutcome" NOT NULL,
    "actualOutput" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionRound" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "challengeVersionId" UUID NOT NULL,
    "status" "PredictionRoundStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMPTZ(6),
    "scoredAt" TIMESTAMPTZ(6),
    "voidedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PredictionRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionParticipant" (
    "id" UUID NOT NULL,
    "predictionRoundId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "roomMembershipId" UUID NOT NULL,
    "submittedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" UUID NOT NULL,
    "predictionRoundId" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "testCaseId" UUID NOT NULL,
    "challengeVersionId" UUID NOT NULL,
    "predictedOutcome" "PredictionOutcome" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreAward" (
    "id" UUID NOT NULL,
    "predictionRoundId" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "executionAttemptId" UUID NOT NULL,
    "points" INTEGER NOT NULL,
    "correctPredictionCount" INTEGER NOT NULL,
    "evaluatedPredictionCount" INTEGER NOT NULL,
    "scoringRuleVersion" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");

-- CreateIndex
CREATE INDEX "UserSession_userId_expiresAt_idx" ON "UserSession"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Room_archivedAt_createdAt_idx" ON "Room"("archivedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Room_createdById_createdAt_idx" ON "Room"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Room_visibility_archivedAt_idx" ON "Room"("visibility", "archivedAt");

-- CreateIndex
CREATE INDEX "RoomMembership_roomId_status_joinedAt_idx" ON "RoomMembership"("roomId", "status", "joinedAt");

-- CreateIndex
CREATE INDEX "RoomMembership_userId_status_joinedAt_idx" ON "RoomMembership"("userId", "status", "joinedAt");

-- CreateIndex
CREATE INDEX "RoomMembership_invitationId_roomId_userId_idx" ON "RoomMembership"("invitationId", "roomId", "userId");

-- CreateIndex
CREATE INDEX "RoomMembership_joinCodeId_roomId_idx" ON "RoomMembership"("joinCodeId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomMembership_id_userId_roomId_key" ON "RoomMembership"("id", "userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomMembership_invitationId_roomId_key" ON "RoomMembership"("invitationId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomInvitation_tokenHash_key" ON "RoomInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "RoomInvitation_roomId_status_expiresAt_idx" ON "RoomInvitation"("roomId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "RoomInvitation_invitedUserId_status_idx" ON "RoomInvitation"("invitedUserId", "status");

-- CreateIndex
CREATE INDEX "RoomInvitation_invitedEmail_status_idx" ON "RoomInvitation"("invitedEmail", "status");

-- CreateIndex
CREATE INDEX "RoomInvitation_invitedById_idx" ON "RoomInvitation"("invitedById");

-- CreateIndex
CREATE UNIQUE INDEX "RoomInvitation_id_roomId_key" ON "RoomInvitation"("id", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomJoinCode_tokenHash_key" ON "RoomJoinCode"("tokenHash");

-- CreateIndex
CREATE INDEX "RoomJoinCode_roomId_revokedAt_expiresAt_idx" ON "RoomJoinCode"("roomId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "RoomJoinCode_createdById_idx" ON "RoomJoinCode"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "RoomJoinCode_id_roomId_key" ON "RoomJoinCode"("id", "roomId");

-- CreateIndex
CREATE INDEX "RoomDocument_roomId_updatedAt_idx" ON "RoomDocument"("roomId", "updatedAt");

-- CreateIndex
CREATE INDEX "RoomDocument_languageId_idx" ON "RoomDocument"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomDocument_roomId_documentKey_key" ON "RoomDocument"("roomId", "documentKey");

-- CreateIndex
CREATE UNIQUE INDEX "RoomDocument_id_roomId_key" ON "RoomDocument"("id", "roomId");

-- CreateIndex
CREATE INDEX "RoomDocumentSnapshot_documentId_updateSequence_idx" ON "RoomDocumentSnapshot"("documentId", "updateSequence");

-- CreateIndex
CREATE UNIQUE INDEX "RoomDocumentSnapshot_documentId_snapshotSequence_key" ON "RoomDocumentSnapshot"("documentId", "snapshotSequence");

-- CreateIndex
CREATE INDEX "RoomDocumentUpdate_documentId_createdAt_idx" ON "RoomDocumentUpdate"("documentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoomDocumentUpdate_documentId_sequence_key" ON "RoomDocumentUpdate"("documentId", "sequence");

-- CreateIndex
CREATE INDEX "RoomActivity_roomId_createdAt_idx" ON "RoomActivity"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "RoomActivity_actorUserId_createdAt_idx" ON "RoomActivity"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "RoomActivity_targetUserId_createdAt_idx" ON "RoomActivity"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "RoomMessage_roomId_createdAt_idx" ON "RoomMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "RoomMessage_authorUserId_createdAt_idx" ON "RoomMessage"("authorUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammingLanguage_key_key" ON "ProgrammingLanguage"("key");

-- CreateIndex
CREATE INDEX "Challenge_roomId_archivedAt_createdAt_idx" ON "Challenge"("roomId", "archivedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Challenge_createdById_idx" ON "Challenge"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_id_currentPublishedVersionId_key" ON "Challenge"("id", "currentPublishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_id_roomId_key" ON "Challenge"("id", "roomId");

-- CreateIndex
CREATE INDEX "ChallengeVersion_challengeId_createdAt_idx" ON "ChallengeVersion"("challengeId", "createdAt");

-- CreateIndex
CREATE INDEX "ChallengeVersion_createdById_idx" ON "ChallengeVersion"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeVersion_challengeId_version_key" ON "ChallengeVersion"("challengeId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeVersion_challengeId_id_key" ON "ChallengeVersion"("challengeId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeVersion_id_roomId_key" ON "ChallengeVersion"("id", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_challengeVersionId_position_key" ON "TestCase"("challengeVersionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_id_challengeVersionId_key" ON "TestCase"("id", "challengeVersionId");

-- CreateIndex
CREATE INDEX "CodeSubmission_roomId_createdAt_idx" ON "CodeSubmission"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeSubmission_authorUserId_createdAt_idx" ON "CodeSubmission"("authorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeSubmission_challengeVersionId_createdAt_idx" ON "CodeSubmission"("challengeVersionId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeSubmission_documentId_idx" ON "CodeSubmission"("documentId");

-- CreateIndex
CREATE INDEX "CodeSubmission_languageId_idx" ON "CodeSubmission"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeSubmission_id_challengeVersionId_key" ON "CodeSubmission"("id", "challengeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeSubmission_id_roomId_challengeVersionId_key" ON "CodeSubmission"("id", "roomId", "challengeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionAttempt_providerJobId_key" ON "ExecutionAttempt"("providerJobId");

-- CreateIndex
CREATE INDEX "ExecutionAttempt_status_createdAt_idx" ON "ExecutionAttempt"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionAttempt_submissionId_attemptNumber_key" ON "ExecutionAttempt"("submissionId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionAttempt_id_submissionId_key" ON "ExecutionAttempt"("id", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionAttempt_id_challengeVersionId_key" ON "ExecutionAttempt"("id", "challengeVersionId");

-- CreateIndex
CREATE INDEX "ExecutionTestResult_testCaseId_idx" ON "ExecutionTestResult"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionTestResult_executionAttemptId_testCaseId_key" ON "ExecutionTestResult"("executionAttemptId", "testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionRound_submissionId_key" ON "PredictionRound"("submissionId");

-- CreateIndex
CREATE INDEX "PredictionRound_roomId_status_openedAt_idx" ON "PredictionRound"("roomId", "status", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionRound_id_submissionId_key" ON "PredictionRound"("id", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionRound_id_roomId_key" ON "PredictionRound"("id", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionRound_id_challengeVersionId_key" ON "PredictionRound"("id", "challengeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionRound_submissionId_roomId_challengeVersionId_key" ON "PredictionRound"("submissionId", "roomId", "challengeVersionId");

-- CreateIndex
CREATE INDEX "PredictionParticipant_userId_createdAt_idx" ON "PredictionParticipant"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionParticipant_predictionRoundId_userId_key" ON "PredictionParticipant"("predictionRoundId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionParticipant_id_predictionRoundId_userId_key" ON "PredictionParticipant"("id", "predictionRoundId", "userId");

-- CreateIndex
CREATE INDEX "Prediction_participantId_idx" ON "Prediction"("participantId");

-- CreateIndex
CREATE INDEX "Prediction_testCaseId_idx" ON "Prediction"("testCaseId");

-- CreateIndex
CREATE INDEX "Prediction_userId_idx" ON "Prediction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_predictionRoundId_userId_testCaseId_key" ON "Prediction"("predictionRoundId", "userId", "testCaseId");

-- CreateIndex
CREATE INDEX "ScoreAward_userId_createdAt_idx" ON "ScoreAward"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ScoreAward_predictionRoundId_userId_idx" ON "ScoreAward"("predictionRoundId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreAward_predictionRoundId_userId_key" ON "ScoreAward"("predictionRoundId", "userId");

-- AddForeignKey
ALTER TABLE "PasswordCredential" ADD CONSTRAINT "PasswordCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMembership" ADD CONSTRAINT "RoomMembership_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMembership" ADD CONSTRAINT "RoomMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMembership" ADD CONSTRAINT "RoomMembership_invitationId_roomId_fkey" FOREIGN KEY ("invitationId", "roomId") REFERENCES "RoomInvitation"("id", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMembership" ADD CONSTRAINT "RoomMembership_joinCodeId_roomId_fkey" FOREIGN KEY ("joinCodeId", "roomId") REFERENCES "RoomJoinCode"("id", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomJoinCode" ADD CONSTRAINT "RoomJoinCode_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomJoinCode" ADD CONSTRAINT "RoomJoinCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDocument" ADD CONSTRAINT "RoomDocument_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDocument" ADD CONSTRAINT "RoomDocument_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "ProgrammingLanguage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDocumentSnapshot" ADD CONSTRAINT "RoomDocumentSnapshot_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "RoomDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDocumentSnapshot" ADD CONSTRAINT "RoomDocumentSnapshot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDocumentUpdate" ADD CONSTRAINT "RoomDocumentUpdate_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "RoomDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDocumentUpdate" ADD CONSTRAINT "RoomDocumentUpdate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomActivity" ADD CONSTRAINT "RoomActivity_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomActivity" ADD CONSTRAINT "RoomActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomActivity" ADD CONSTRAINT "RoomActivity_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessage" ADD CONSTRAINT "RoomMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessage" ADD CONSTRAINT "RoomMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_id_currentPublishedVersionId_fkey" FOREIGN KEY ("id", "currentPublishedVersionId") REFERENCES "ChallengeVersion"("challengeId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeVersion" ADD CONSTRAINT "ChallengeVersion_challengeId_roomId_fkey" FOREIGN KEY ("challengeId", "roomId") REFERENCES "Challenge"("id", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeVersion" ADD CONSTRAINT "ChallengeVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_challengeVersionId_fkey" FOREIGN KEY ("challengeVersionId") REFERENCES "ChallengeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_challengeVersionId_roomId_fkey" FOREIGN KEY ("challengeVersionId", "roomId") REFERENCES "ChallengeVersion"("id", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_documentId_roomId_fkey" FOREIGN KEY ("documentId", "roomId") REFERENCES "RoomDocument"("id", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "ProgrammingLanguage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionAttempt" ADD CONSTRAINT "ExecutionAttempt_submissionId_challengeVersionId_fkey" FOREIGN KEY ("submissionId", "challengeVersionId") REFERENCES "CodeSubmission"("id", "challengeVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTestResult" ADD CONSTRAINT "ExecutionTestResult_executionAttemptId_challengeVersionId_fkey" FOREIGN KEY ("executionAttemptId", "challengeVersionId") REFERENCES "ExecutionAttempt"("id", "challengeVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTestResult" ADD CONSTRAINT "ExecutionTestResult_testCaseId_challengeVersionId_fkey" FOREIGN KEY ("testCaseId", "challengeVersionId") REFERENCES "TestCase"("id", "challengeVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionRound" ADD CONSTRAINT "PredictionRound_submissionId_roomId_challengeVersionId_fkey" FOREIGN KEY ("submissionId", "roomId", "challengeVersionId") REFERENCES "CodeSubmission"("id", "roomId", "challengeVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionRound" ADD CONSTRAINT "PredictionRound_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionParticipant" ADD CONSTRAINT "PredictionParticipant_predictionRoundId_roomId_fkey" FOREIGN KEY ("predictionRoundId", "roomId") REFERENCES "PredictionRound"("id", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionParticipant" ADD CONSTRAINT "PredictionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionParticipant" ADD CONSTRAINT "PredictionParticipant_roomMembershipId_userId_roomId_fkey" FOREIGN KEY ("roomMembershipId", "userId", "roomId") REFERENCES "RoomMembership"("id", "userId", "roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_predictionRoundId_challengeVersionId_fkey" FOREIGN KEY ("predictionRoundId", "challengeVersionId") REFERENCES "PredictionRound"("id", "challengeVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_participantId_predictionRoundId_userId_fkey" FOREIGN KEY ("participantId", "predictionRoundId", "userId") REFERENCES "PredictionParticipant"("id", "predictionRoundId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_testCaseId_challengeVersionId_fkey" FOREIGN KEY ("testCaseId", "challengeVersionId") REFERENCES "TestCase"("id", "challengeVersionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreAward" ADD CONSTRAINT "ScoreAward_predictionRoundId_submissionId_fkey" FOREIGN KEY ("predictionRoundId", "submissionId") REFERENCES "PredictionRound"("id", "submissionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreAward" ADD CONSTRAINT "ScoreAward_participantId_predictionRoundId_userId_fkey" FOREIGN KEY ("participantId", "predictionRoundId", "userId") REFERENCES "PredictionParticipant"("id", "predictionRoundId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreAward" ADD CONSTRAINT "ScoreAward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreAward" ADD CONSTRAINT "ScoreAward_executionAttemptId_submissionId_fkey" FOREIGN KEY ("executionAttemptId", "submissionId") REFERENCES "ExecutionAttempt"("id", "submissionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PostgreSQL-only integrity constraints not representable in Prisma schema syntax.
ALTER TABLE "UserPreference"
  ADD CONSTRAINT "UserPreference_editorFontSize_positive"
  CHECK ("editorFontSize" > 0),
  ADD CONSTRAINT "UserPreference_editorTabSize_positive"
  CHECK ("editorTabSize" > 0);

ALTER TABLE "ChallengeVersion"
  ADD CONSTRAINT "ChallengeVersion_version_positive"
  CHECK ("version" > 0);

ALTER TABLE "TestCase"
  ADD CONSTRAINT "TestCase_position_positive"
  CHECK ("position" > 0);

ALTER TABLE "ExecutionAttempt"
  ADD CONSTRAINT "ExecutionAttempt_attemptNumber_positive"
    CHECK ("attemptNumber" > 0),
  ADD CONSTRAINT "ExecutionAttempt_metrics_nonnegative"
    CHECK (
      ("runTimeMs" IS NULL OR "runTimeMs" >= 0)
      AND ("memoryKb" IS NULL OR "memoryKb" >= 0)
    );

ALTER TABLE "RoomDocument"
  ADD CONSTRAINT "RoomDocument_lastUpdateSequence_nonnegative"
  CHECK ("lastUpdateSequence" >= 0);

ALTER TABLE "RoomDocumentUpdate"
  ADD CONSTRAINT "RoomDocumentUpdate_sequence_positive"
  CHECK ("sequence" > 0);

ALTER TABLE "RoomDocumentSnapshot"
  ADD CONSTRAINT "RoomDocumentSnapshot_sequences_nonnegative"
  CHECK ("snapshotSequence" >= 0 AND "updateSequence" >= 0);

ALTER TABLE "ScoreAward"
  ADD CONSTRAINT "ScoreAward_counts_and_points_nonnegative"
  CHECK (
    "points" >= 0
    AND "correctPredictionCount" >= 0
    AND "evaluatedPredictionCount" >= 0
    AND "correctPredictionCount" <= "evaluatedPredictionCount"
  );

ALTER TABLE "RoomMembership"
  ADD CONSTRAINT "RoomMembership_single_join_source"
  CHECK ("invitationId" IS NULL OR "joinCodeId" IS NULL);

ALTER TABLE "RoomInvitation"
  ADD CONSTRAINT "RoomInvitation_exactly_one_target"
  CHECK (("invitedUserId" IS NOT NULL) <> ("invitedEmail" IS NOT NULL));

ALTER TABLE "RoomMembership"
  ADD CONSTRAINT "RoomMembership_status_ended_at_consistent"
  CHECK (("status" = 'ACTIVE') = ("endedAt" IS NULL));

CREATE UNIQUE INDEX "RoomMembership_one_active_period"
  ON "RoomMembership" ("roomId", "userId")
  WHERE "status" = 'ACTIVE' AND "endedAt" IS NULL;
