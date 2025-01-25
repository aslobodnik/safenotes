CREATE TYPE "public"."transfer_type" AS ENUM('ETHER_TRANSFER', 'ERC20_TRANSFER');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "safes" (
	"address" text PRIMARY KEY NOT NULL,
	"removed" boolean DEFAULT false,
	"removed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transfer_categories" (
	"transfer_id" text NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "transfer_categories_transfer_id_category_id_pk" PRIMARY KEY("transfer_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"transfer_id" text PRIMARY KEY NOT NULL,
	"safe_address" text NOT NULL,
	"type" "transfer_type" NOT NULL,
	"execution_date" timestamp NOT NULL,
	"block_number" integer NOT NULL,
	"transaction_hash" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"value" text,
	"token_address" text,
	"token_name" text,
	"token_symbol" text,
	"token_decimals" integer,
	"token_logo_uri" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transfer_categories" ADD CONSTRAINT "transfer_categories_transfer_id_transfers_transfer_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("transfer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_categories" ADD CONSTRAINT "transfer_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_safe_address_safes_address_fk" FOREIGN KEY ("safe_address") REFERENCES "public"."safes"("address") ON DELETE no action ON UPDATE no action;