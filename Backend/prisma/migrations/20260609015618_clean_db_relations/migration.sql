/*
  Warnings:

  - You are about to drop the column `created_by` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `replies` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `replies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_created_by_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "replies" DROP CONSTRAINT "replies_created_by_fkey";

-- DropForeignKey
ALTER TABLE "replies" DROP CONSTRAINT "replies_updated_by_fkey";

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "created_by",
DROP COLUMN "updated_by";

-- AlterTable
ALTER TABLE "replies" DROP COLUMN "created_by",
DROP COLUMN "updated_by";
