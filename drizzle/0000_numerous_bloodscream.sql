CREATE TABLE "todos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"description" text DEFAULT '',
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"due_date" varchar(50),
	"start_time" varchar(10),
	"end_time" varchar(10),
	"category" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
