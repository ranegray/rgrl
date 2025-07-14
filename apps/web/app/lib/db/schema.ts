import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, index, decimal } from 'drizzle-orm/pg-core';
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

export const modules = pgTable("modules", {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull().default(0),
    isSequential: boolean('is_sequential').notNull().default(false), // Must complete in order
    estimatedDuration: integer('estimated_duration'), // minutes
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('modules_course_idx').on(table.courseId),
    ];
});

export const moduleContent = pgTable("module_content", {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id').notNull().references(() => modules.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    contentType: text('content_type').notNull().$type<'lesson' | 'video' | 'quiz' | 'article' | 'project'>(),
    orderIndex: integer('order_index').notNull().default(0),
    estimatedDuration: integer('estimated_duration'), // minutes
    isPublished: boolean('is_published').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<string, any>>().default({}), // Type-specific data
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('module_content_module_idx').on(table.moduleId),
        index('module_content_type_idx').on(table.contentType),
    ];
});

// Lessons - for interactive coding environments
// TODO needs work
export const lessons = pgTable("lessons", {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleContentId: uuid('module_content_id').notNull().references(() => moduleContent.id),
    executionEnvironment: text('execution_environment').default('ros2-gazebo-classic'),
    environmentConfig: jsonb('environment_config').$type<Record<string, any>>().default({}),
    content: text('content'), // Markdown content for instructions
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('lessons_content_idx').on(table.moduleContentId),
    ];
});

// Exercises within lessons
export const exercises = pgTable("exercises", {
    id: uuid('id').primaryKey().defaultRandom(),
    lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull().default(0),
    initialCode: text('initial_code'),
    solutionCode: text('solution_code'),
    estimatedDuration: integer('estimated_duration'), // minutes
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('exercises_lesson_idx').on(table.lessonId),
    ];
});

// Steps within exercises (your existing structure)
export const steps = pgTable("steps", {
    id: uuid('id').primaryKey().defaultRandom(),
    exerciseId: uuid('exercise_id').notNull().references(() => exercises.id),
    title: text('title').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
    instructions: text('instructions').notNull(), // Markdown
    hint: text('hint'), // Optional hint text
    codeHint: text('code_hint'), // Optional code snippet hint
    validationType: text('validation_type').notNull().default('string_contains'), // 'string_contains', 'regex', 'custom'
    validationConfig: jsonb('validation_config').$type<{
        validationStrings?: string[];
        regexPattern?: string;
        customValidator?: string;
    }>().default({}),
    isRequired: boolean('is_required').notNull().default(true),
    points: integer('points').default(10),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('steps_exercise_idx').on(table.exerciseId),
    ];
});

// Quizzes
export const quizzes = pgTable("quizzes", {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleContentId: uuid('module_content_id').notNull().references(() => moduleContent.id),
    passingScore: decimal('passing_score', { precision: 5, scale: 2 }).default('70.00'), // Percentage
    allowRetakes: boolean('allow_retakes').notNull().default(true),
    timeLimit: integer('time_limit'), // minutes, null = no limit
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('quizzes_content_idx').on(table.moduleContentId),
    ];
});

export const quizQuestions = pgTable("quiz_questions", {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id').notNull().references(() => quizzes.id),
    questionText: text('question_text').notNull(),
    questionType: text('question_type').notNull().$type<'multiple_choice' | 'true_false' | 'short_answer'>(),
    orderIndex: integer('order_index').notNull().default(0),
    points: integer('points').default(10),
    correctAnswers: jsonb('correct_answers').$type<string[]>().notNull(),
    options: jsonb('options').$type<string[]>(), // For multiple choice
    explanation: text('explanation'), // Optional explanation of correct answer
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('quiz_questions_quiz_idx').on(table.quizId),
    ];
});

// User progress tracking
export const userProgress = pgTable('user_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(), // Clerk ID
    moduleContentId: uuid('module_content_id').notNull().references(() => moduleContent.id),
    status: text('status').notNull().$type<'not_started' | 'in_progress' | 'completed'>().default('not_started'),
    progressData: jsonb('progress_data').$type<Record<string, any>>().default({}), // Type-specific progress
    lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
}, (table) => {
    return [
        index('progress_user_content_idx').on(table.userId, table.moduleContentId),
    ];
});

// Detailed exercise progress (for lessons)
export const userExerciseProgress = pgTable('user_exercise_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(), // Clerk ID
    exerciseId: uuid('exercise_id').notNull().references(() => exercises.id),
    status: text('status').notNull().$type<'not_started' | 'in_progress' | 'completed'>().default('not_started'),
    currentStepIndex: integer('current_step_index').notNull().default(0),
    currentCode: text('current_code'), // Their current code
    completedSteps: jsonb('completed_steps').$type<string[]>().default([]), // Array of step IDs
    stepAttempts: jsonb('step_attempts').$type<Record<string, number>>().default({}), // stepId -> attempt count
    hintsUsed: jsonb('hints_used').$type<string[]>().default([]), // Array of step IDs where hints were used
    timeSpent: integer('time_spent').default(0), // seconds
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
}, (table) => {
    return [
        index('exercise_progress_user_exercise_idx').on(table.userId, table.exerciseId),
    ];
});

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
    modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
    course: one(courses, {
        fields: [modules.courseId],
        references: [courses.id],
    }),
    content: many(moduleContent),
}));

export const moduleContentRelations = relations(moduleContent, ({ one, many }) => ({
    module: one(modules, {
        fields: [moduleContent.moduleId],
        references: [modules.id],
    }),
    lesson: one(lessons),
    quiz: one(quizzes),
    progress: many(userProgress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    moduleContent: one(moduleContent, {
        fields: [lessons.moduleContentId],
        references: [moduleContent.id],
    }),
    exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [exercises.lessonId],
        references: [lessons.id],
    }),
    steps: many(steps),
    progress: many(userExerciseProgress),
}));

export const stepsRelations = relations(steps, ({ one }) => ({
    exercise: one(exercises, {
        fields: [steps.exerciseId],
        references: [exercises.id],
    }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
    moduleContent: one(moduleContent, {
        fields: [quizzes.moduleContentId],
        references: [moduleContent.id],
    }),
    questions: many(quizQuestions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
    quiz: one(quizzes, {
        fields: [quizQuestions.quizId],
        references: [quizzes.id],
    }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    moduleContent: one(moduleContent, {
        fields: [userProgress.moduleContentId],
        references: [moduleContent.id],
    }),
}));

export const userExerciseProgressRelations = relations(userExerciseProgress, ({ one }) => ({
    exercise: one(exercises, {
        fields: [userExerciseProgress.exerciseId],
        references: [exercises.id],
    }),
}));

// Types
export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = typeof courses.$inferInsert;

export type ModuleSelect = typeof modules.$inferSelect;
export type ModuleInsert = typeof modules.$inferInsert;

export type ModuleContentSelect = typeof moduleContent.$inferSelect;
export type ModuleContentInsert = typeof moduleContent.$inferInsert;

export type LessonSelect = typeof lessons.$inferSelect;
export type LessonInsert = typeof lessons.$inferInsert;

export type ExerciseSelect = typeof exercises.$inferSelect;
export type ExerciseInsert = typeof exercises.$inferInsert;

export type StepSelect = typeof steps.$inferSelect;
export type StepInsert = typeof steps.$inferInsert;

export type QuizSelect = typeof quizzes.$inferSelect;
export type QuizInsert = typeof quizzes.$inferInsert;

export type QuizQuestionSelect = typeof quizQuestions.$inferSelect;
export type QuizQuestionInsert = typeof quizQuestions.$inferInsert;

export type UserProgressSelect = typeof userProgress.$inferSelect;
export type UserProgressInsert = typeof userProgress.$inferInsert;

export type UserExerciseProgressSelect = typeof userExerciseProgress.$inferSelect;
export type UserExerciseProgressInsert = typeof userExerciseProgress.$inferInsert;
