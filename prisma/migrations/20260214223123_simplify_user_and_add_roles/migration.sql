/*
  Warnings:

  - You are about to drop the column `confirmation_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_canonical` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_requested_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username_canonical` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_email_canonical_key";

-- DropIndex
DROP INDEX "users_username_canonical_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "confirmation_token",
DROP COLUMN "email_canonical",
DROP COLUMN "password_requested_at",
DROP COLUMN "roles",
DROP COLUMN "salt",
DROP COLUMN "username_canonical",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "enabled" SET DEFAULT true;

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;
