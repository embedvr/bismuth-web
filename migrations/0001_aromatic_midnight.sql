CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer DEFAULT '"2024-08-02T22:19:29.925Z"',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `minecraft` (
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`uuid` text NOT NULL,
	`updated_at` integer,
	`created_at` integer DEFAULT '"2024-08-02T22:19:29.925Z"',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `banned` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` integer DEFAULT '"2024-08-02T22:19:29.924Z"';