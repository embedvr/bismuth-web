import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const users = sqliteTable('users', {
	id: text('id').notNull().primaryKey(),
	username: text('username').notNull(),
	avatar: text('avatar').notNull(),
	subscribed: integer('subscribed', { mode: 'boolean' }).default(false),
	banned: integer('banned', { mode: 'boolean' }).default(false),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});

export const minecraft = sqliteTable('minecraft', {
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	username: text('username').notNull(),
	uuid: text('uuid').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date())
});

export const logs = sqliteTable('logs', {
	id: text('id')
		.notNull()
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	action: text('action').notNull(),
	data: text('data', { mode: 'json' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date())
});

export const sessions = sqliteTable('sessions', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull()
});
