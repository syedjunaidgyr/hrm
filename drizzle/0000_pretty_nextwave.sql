CREATE TABLE `vendors` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`contact_email` varchar(255) NOT NULL,
	`contact_phone` varchar(50),
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendors_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`vendor_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'VENDOR',
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`avatar_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `job_descriptions` (
	`id` varchar(36) NOT NULL,
	`vendor_id` varchar(36) NOT NULL,
	`job_code` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`department` varchar(100) NOT NULL,
	`location` varchar(255) NOT NULL,
	`employment_type` varchar(50) NOT NULL DEFAULT 'FULL_TIME',
	`work_mode` varchar(50) NOT NULL DEFAULT 'ON_SITE',
	`min_experience` int NOT NULL DEFAULT 0,
	`max_experience` int NOT NULL DEFAULT 0,
	`num_positions` int NOT NULL DEFAULT 1,
	`min_salary` decimal(12,2),
	`max_salary` decimal(12,2),
	`required_skills` text NOT NULL,
	`preferred_skills` text,
	`description` text NOT NULL,
	`responsibilities` text,
	`requirements` text,
	`education` varchar(255),
	`notice_period` varchar(100),
	`priority` varchar(20) NOT NULL DEFAULT 'MEDIUM',
	`target_joining_date` date,
	`additional_notes` text,
	`status` varchar(20) NOT NULL DEFAULT 'DRAFT',
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_descriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_descriptions_job_code_unique` UNIQUE(`job_code`)
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`total_experience` decimal(4,1) NOT NULL DEFAULT '0.0',
	`relevant_experience` decimal(4,1) NOT NULL DEFAULT '0.0',
	`current_company` varchar(255),
	`current_designation` varchar(255),
	`current_location` varchar(255),
	`preferred_location` varchar(255),
	`skills` text NOT NULL,
	`notice_period` varchar(100),
	`current_salary` decimal(12,2),
	`expected_salary` decimal(12,2),
	`source` varchar(100),
	`recruiter` varchar(255),
	`notes` text,
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidates_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` varchar(36) NOT NULL,
	`candidate_id` varchar(36) NOT NULL,
	`submission_id` varchar(36),
	`file_name` varchar(255) NOT NULL,
	`storage_key` varchar(500) NOT NULL,
	`storage_provider` varchar(50) NOT NULL DEFAULT 'local',
	`mime_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`uploaded_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidate_submissions` (
	`id` varchar(36) NOT NULL,
	`job_id` varchar(36) NOT NULL,
	`candidate_id` varchar(36) NOT NULL,
	`vendor_id` varchar(36) NOT NULL,
	`resume_file_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'SUBMITTED',
	`submitted_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidate_job_uniq_idx` UNIQUE(`candidate_id`,`job_id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`overall_rating` int NOT NULL,
	`technical_rating` int NOT NULL,
	`communication_rating` int NOT NULL,
	`experience_fit` int NOT NULL,
	`strengths` text,
	`concerns` text,
	`comments` text,
	`recommendation` varchar(50) NOT NULL,
	`submitted_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`from_status` varchar(50) NOT NULL,
	`to_status` varchar(50) NOT NULL,
	`reason` text,
	`changed_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` varchar(36) NOT NULL,
	`submission_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`comment` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`link` varchar(500),
	`is_read` boolean NOT NULL DEFAULT false,
	`type` varchar(50) NOT NULL DEFAULT 'INFO',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(100),
	`old_value` text,
	`new_value` text,
	`ip_address` varchar(100),
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD CONSTRAINT `job_descriptions_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD CONSTRAINT `job_descriptions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_candidate_id_candidates_id_fk` FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD CONSTRAINT `candidate_submissions_job_id_job_descriptions_id_fk` FOREIGN KEY (`job_id`) REFERENCES `job_descriptions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD CONSTRAINT `candidate_submissions_candidate_id_candidates_id_fk` FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD CONSTRAINT `candidate_submissions_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD CONSTRAINT `candidate_submissions_resume_file_id_files_id_fk` FOREIGN KEY (`resume_file_id`) REFERENCES `files`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_submissions` ADD CONSTRAINT `candidate_submissions_submitted_by_users_id_fk` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_submission_id_candidate_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `candidate_submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_submitted_by_users_id_fk` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `status_history` ADD CONSTRAINT `status_history_submission_id_candidate_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `candidate_submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `status_history` ADD CONSTRAINT `status_history_changed_by_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_submission_id_candidate_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `candidate_submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `vendor_id_idx` ON `users` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `job_vendor_id_idx` ON `job_descriptions` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `job_status_idx` ON `job_descriptions` (`status`);--> statement-breakpoint
CREATE INDEX `job_priority_idx` ON `job_descriptions` (`priority`);--> statement-breakpoint
CREATE INDEX `candidate_email_idx` ON `candidates` (`email`);--> statement-breakpoint
CREATE INDEX `candidate_phone_idx` ON `candidates` (`phone`);--> statement-breakpoint
CREATE INDEX `file_candidate_id_idx` ON `files` (`candidate_id`);--> statement-breakpoint
CREATE INDEX `file_submission_id_idx` ON `files` (`submission_id`);--> statement-breakpoint
CREATE INDEX `sub_job_id_idx` ON `candidate_submissions` (`job_id`);--> statement-breakpoint
CREATE INDEX `sub_vendor_id_idx` ON `candidate_submissions` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `sub_candidate_id_idx` ON `candidate_submissions` (`candidate_id`);--> statement-breakpoint
CREATE INDEX `sub_status_idx` ON `candidate_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `fb_submission_id_idx` ON `feedback` (`submission_id`);--> statement-breakpoint
CREATE INDEX `sh_submission_id_idx` ON `status_history` (`submission_id`);--> statement-breakpoint
CREATE INDEX `cmt_submission_id_idx` ON `comments` (`submission_id`);--> statement-breakpoint
CREATE INDEX `cmt_user_id_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `notif_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notif_read_idx` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `audit_user_id_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);