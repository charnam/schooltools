BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "icons" (
	"id"	TEXT NOT NULL UNIQUE,
	"filepath"	TEXT NOT NULL UNIQUE,
	"mimetype"	TEXT NOT NULL,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "sets" (
	"id"	TEXT NOT NULL UNIQUE,
	"userid"	TEXT NOT NULL,
	"title"	TEXT NOT NULL,
	"creation"	INTEGER NOT NULL,
	"modification"	INTEGER NOT NULL DEFAULT creation,
	PRIMARY KEY("id"),
	FOREIGN KEY("userid") REFERENCES "users"("id")
);
CREATE TABLE IF NOT EXISTS "terms" (
	"id"	TEXT NOT NULL UNIQUE,
	"setid"	TEXT NOT NULL,
	"hint"	TEXT NOT NULL,
	"definition"	TEXT NOT NULL,
	"position"	INTEGER NOT NULL,
	"creation"	INTEGER NOT NULL,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "tokens" (
	"token"	TEXT NOT NULL UNIQUE,
	"userid"	INTEGER NOT NULL,
	FOREIGN KEY("userid") REFERENCES "users"("id")
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	TEXT NOT NULL UNIQUE,
	"icon"	TEXT,
	"username"	TEXT NOT NULL,
	"guestname"	TEXT,
	"theme"	TEXT,
	"password"	TEXT NOT NULL,
	"creation"	INTEGER NOT NULL,
	PRIMARY KEY("id")
);
COMMIT;
