CREATE TABLE `status_masters` (
	`id` varchar(36) NOT NULL,
	`entity_type` varchar(20) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	`result` varchar(20) NOT NULL DEFAULT 'PENDING',
	`client_id` varchar(36),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_system` boolean NOT NULL DEFAULT false,
	`allowed_next` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `status_masters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_titles` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_titles_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_titles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_projects` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `access_all_projects` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD `notified_at` timestamp;--> statement-breakpoint
ALTER TABLE `status_masters` ADD CONSTRAINT `status_masters_client_id_vendors_id_fk` FOREIGN KEY (`client_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_projects` ADD CONSTRAINT `user_projects_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_projects` ADD CONSTRAINT `user_projects_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX `status_entity_code_client_uniq` ON `status_masters` (`entity_type`,`code`,`client_id`);--> statement-breakpoint
CREATE INDEX `status_entity_type_idx` ON `status_masters` (`entity_type`);--> statement-breakpoint
CREATE INDEX `status_client_id_idx` ON `status_masters` (`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_project_uniq_idx` ON `user_projects` (`user_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `up_user_id_idx` ON `user_projects` (`user_id`);--> statement-breakpoint
CREATE INDEX `up_project_id_idx` ON `user_projects` (`project_id`);
