import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// TODO: extend clerk user data
export const user = pgTable("user", {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(), // Clerk user ID
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
    email: text('email').notNull().unique(), // User's email
});

export const courses = pgTable("courses", {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const lessons = pgTable("lessons", {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
    content: text('content'), // Markdown content for instructions
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('lessons_course_idx').on(table.courseId),
    ];
});

// export const exercises = pgTable("exercises", {
// });

export const steps = pgTable("steps", {
    id: uuid('id').primaryKey().defaultRandom(),
    lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
    title: text('title').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
    instructions: text('instructions').notNull(), // Markdown
    initialCode: text('initial_code'),
    solutionCode: text('solution_code'),
    // Simple validation for MVP - just check if code contains certain strings
    validationStrings: jsonb('validation_strings').$type<string[]>().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('steps_lesson_idx').on(table.lessonId),
    ];
});

export const userProgress = pgTable('user_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(), // Clerk ID
    lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
    currentStepIndex: integer('current_step_index').notNull().default(0),
    completedSteps: jsonb('completed_steps').$type<string[]>().default([]), // Array of step IDs
    currentCode: text('current_code'), // Their current code
    lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('progress_user_lesson_idx').on(table.userId, table.lessonId),
    ];
});

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
    lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    course: one(courses, {
        fields: [lessons.courseId],
        references: [courses.id],
    }),
    steps: many(steps),
    progress: many(userProgress),
}));

export const stepsRelations = relations(steps, ({ one }) => ({
    lesson: one(lessons, {
        fields: [steps.lessonId],
        references: [lessons.id],
    }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    lesson: one(lessons, {
        fields: [userProgress.lessonId],
        references: [lessons.id],
    }),
}));

// Types
export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = typeof courses.$inferInsert;

export type LessonSelect = typeof lessons.$inferSelect;
export type LessonInsert = typeof lessons.$inferInsert;

export type StepSelect = typeof steps.$inferSelect;
export type StepInsert = typeof steps.$inferInsert;

export type UserProgressSelect = typeof userProgress.$inferSelect;
export type UserProgressInsert = typeof userProgress.$inferInsert;
