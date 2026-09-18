import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        // Grab the data
        const {votedById, voteStatus, type, typeId} = await request.json()

        // List document
        const response = await databases.listDocuments(
            db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("votedById", votedById),
            ]
        )

        if(response.documents.length > 0) {
            
            await databases.deleteDocument(db, voteCollection, response.documents[0].$id ) 

            // delete the reputation
            const QuestionOrAnswer = await databases.getDocument(
                db, 
                type === "question" ? questionCollection: answerCollection, typeId
            );

            const authorePrefs = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId)

            await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authoreId, {
                reputation: response.documents[0].voteStatus === "upvoted" 
                ? Number(authorePrefs.reputation) - 1 
                : Number(authorePrefs.reputation) + 1
            })
        }

        // That means prev vote does not exists or vote status changes
        if(response.documents[0]?.voteStatus !== voteStatus) {
            
            const doc = await databases.createDocument(db, voteCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById
            }); 

            // Increase or Decrease reputation

            const QuestionOrAnswer = await databases.getDocument(
                db, 
                type === "question" ? questionCollection: answerCollection, typeId
            );

            const authorePrefs = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId)

            // if vot was present
            if(response.documents[0]) {
                await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
                    // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
                    reputation: response.documents[0].voteStatus === "upvoted" 
                    ? Number(authorePrefs.reputation) - 1
                    : Number(authorePrefs.reputation) + 1
                });
            } else {
                await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
                    reputation: voteStatus === "upvoted"
                    ? Number(authorePrefs.reputation) + 1
                    : Number(authorePrefs.reputation) - 1,

                });
            }

        }


        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.equal("votedById", votedById),
                Query.limit(1),
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.equal("voteById", votedById),
                Query.limit(1),
            ])
        ])


        return NextResponse.json(
            {
                data: {
                    documents: null, voteResult: upvotes.total = downvotes.total
                },
                message: "vote handled"
            },
            {
                status: 200
            }
        )
    } catch (error: any) {
        return NextResponse.json(
            {
                error: error?.message || "Error creating voting"
            }, 
            {
                status: error?.status || error?.code || 500
            }
        )
    }
}