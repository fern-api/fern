/* eslint-disable no-console */
import { SQSEvent, SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const messageBody = record.body;
        console.log("Received message:", messageBody);

        // Process the message here
        // e.g., parse JSON, save to database, etc.
    }
};
