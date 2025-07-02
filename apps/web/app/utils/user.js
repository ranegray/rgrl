// utils/user.js
import { supabase } from "../lib/supabase";

export async function initializeUserData(userId) {
  try {
    await supabase
      .from("user_profiles")
      .upsert({ id: userId, level: 1, xp: 0 });

    console.log("User data initialized successfully");
  } catch (error) {
    console.error("Error initializing user data:", error);
  }
}

export async function updateUserProgress(
  userId,
  missionId,
  lessonId,
  exerciseId,
) {
  const { data, error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      mission_id: missionId,
      lesson_id: lessonId,
      exercise_id: exerciseId,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) throw error;
  return data;
}
