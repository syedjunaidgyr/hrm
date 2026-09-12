CREATE TABLE `file_blobs` (
	`storage_key` varchar(500) NOT NULL,
	`content` mediumblob NOT NULL,
	CONSTRAINT `file_blobs_storage_key` PRIMARY KEY(`storage_key`)
);
