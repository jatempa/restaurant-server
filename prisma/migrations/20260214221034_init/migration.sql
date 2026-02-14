-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "firstLastName" VARCHAR(60) NOT NULL,
    "secondLastName" VARCHAR(60),
    "cellphoneNumber" VARCHAR(30) NOT NULL,
    "username" VARCHAR(180) NOT NULL,
    "username_canonical" VARCHAR(180) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "email_canonical" VARCHAR(180) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "salt" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "last_login" TIMESTAMP(3),
    "confirmation_token" VARCHAR(180),
    "password_requested_at" TIMESTAMP(3),
    "roles" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "account_id" SERIAL NOT NULL,
    "user" INTEGER NOT NULL,
    "name" VARCHAR(20),
    "checkin" TIMESTAMP(3),
    "checkout" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(85) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "notes" (
    "note_id" SERIAL NOT NULL,
    "user" INTEGER NOT NULL,
    "account" INTEGER NOT NULL,
    "numberNote" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "checkin" TIMESTAMP(3),
    "checkout" TIMESTAMP(3),

    CONSTRAINT "notes_pkey" PRIMARY KEY ("note_id")
);

-- CreateTable
CREATE TABLE "note_product" (
    "id" SERIAL NOT NULL,
    "note" INTEGER NOT NULL,
    "product" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "total" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "note_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_canonical_key" ON "users"("username_canonical");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_canonical_key" ON "users"("email_canonical");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_account_fkey" FOREIGN KEY ("account") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_product" ADD CONSTRAINT "note_product_note_fkey" FOREIGN KEY ("note") REFERENCES "notes"("note_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_product" ADD CONSTRAINT "note_product_product_fkey" FOREIGN KEY ("product") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
