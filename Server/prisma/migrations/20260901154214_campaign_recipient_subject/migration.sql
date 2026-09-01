-- AlterTable
ALTER TABLE "campaign_recipient" ADD COLUMN "subject" TEXT NOT NULL DEFAULT '';

ALTER TABLE "campaign_recipient" ALTER COLUMN "subject" DROP DEFAULT;
