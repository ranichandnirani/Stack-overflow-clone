import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import React from "react";
import EditQues, { type Question } from "./EditQues";

const Page = async ({ params }: { params: { quesId: string; quesName: string } }) => {
    const question = await databases.getDocument(db, questionCollection, params.quesId);

    return <EditQues question={question as unknown as Question} />;
};

export default Page;