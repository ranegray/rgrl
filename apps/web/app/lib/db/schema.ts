import { pgTable } from "drizzle-orm/pg-core";

// extends clerk user data
export const userProfile = pgTable("user_profile", {
});

export const courses = pgTable("courses", {
});

export const lessons = pgTable("lessons", {
});

export const exercises = pgTable("exercises", {
});

export const steps = pgTable("steps", {
});

// user progress tracking
// course enrollment tracking
// lesson progress tracking
// exercise progress tracking
// step progress tracking
