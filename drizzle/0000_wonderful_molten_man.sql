CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`level` text NOT NULL,
	`file_type` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`object_key` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL
);
