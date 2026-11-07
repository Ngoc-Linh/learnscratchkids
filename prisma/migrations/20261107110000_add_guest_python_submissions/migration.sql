ALTER TABLE "Submission" ADD COLUMN "authorName" TEXT;
ALTER TABLE "Submission" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";
ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
