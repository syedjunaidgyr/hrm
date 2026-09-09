CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`contact_name` varchar(255),
	`contact_email` varchar(255),
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disciplines` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `disciplines_id` PRIMARY KEY(`id`),
	CONSTRAINT `disciplines_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `job_descriptions` MODIFY COLUMN `department` varchar(100);--> statement-breakpoint
ALTER TABLE `job_descriptions` MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE `candidate_submissions` MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'NEW';--> statement-breakpoint
ALTER TABLE `vendors` ADD `contact_name` varchar(255);--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD `project_id` varchar(36);--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD `discipline_id` varchar(36);--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD `delivered_qty` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD `date_received` date;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD `date_closed` date;--> statement-breakpoint
ALTER TABLE `candidates` ADD `date_submitted` date;--> statement-breakpoint
ALTER TABLE `candidates` ADD `date_closed` date;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD `interview_date_time` timestamp;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_vendors_id_fk` FOREIGN KEY (`client_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD CONSTRAINT `job_descriptions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD CONSTRAINT `job_descriptions_discipline_id_disciplines_id_fk` FOREIGN KEY (`discipline_id`) REFERENCES `disciplines`(`id`) ON DELETE no action ON UPDATE no action;