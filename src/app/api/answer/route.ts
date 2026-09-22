import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

export async function POST(request:NextRequest) {
    try {
        const {questionId, answer, authorId} = await request.json();

        const response = await databases.createDocument(db, answerCollection, ID.unique(), {
            content: answer,
            authorId: authorId,
            questionId: questionId
        })
        
        // Increase author reputation
        const prefs = await users.getPrefs<UserPrefs>(authorId)
        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation) + 1
        })

        return NextResponse.json(response, {
            status: 201
        })

    } catch(error: unknown) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Error creating answer"
            },
            {
                status: getErrorStatus(error)
            }
        )
    }
}

export async function DELETE(request:NextRequest) {
    try {
       const {answerId} = await request.json()
       
      const answer = await databases.getDocument(db, answerCollection, answerId)

      const response = await databases.getDocument(db, answerCollection, answerId)

      // Decrease the reputation
      const prefs = await users.getPrefs<UserPrefs>(answer.authorId)
        await users.updatePrefs(answer.authorId, {
            reputation: Number(prefs.reputation) - 1
        })

        return NextResponse.json( 
            {
                data: response
            },
            {
                status: 200
            }
        )

    } catch (error: unknown) {
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : "Error deleting the answer"
            },
            {
                status: getErrorStatus(error)
            }
        )
    }
}

function getErrorStatus(error: unknown) {
    if (typeof error === "object" && error !== null) {
        if ("status" in error && typeof error.status === "number") return error.status;
        if ("code" in error && typeof error.code === "number") return error.code;
    }

    return 500;
}