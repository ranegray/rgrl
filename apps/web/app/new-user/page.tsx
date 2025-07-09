import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "../lib/db/index"
import { user } from "../lib/db/schema"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
    const newUser = await currentUser()
    
    if (!newUser) {
        redirect("/sign-in")
    }
    
    const match = await db
        .select()
        .from(user)
        .where(eq(user.clerkId, newUser.id))
        .limit(1)

    if (match.length === 0) {
        await db.insert(user).values({
            clerkId: newUser.id,
            email: newUser.emailAddresses[0].emailAddress,
        })
    }

    redirect("/dashboard")
}
