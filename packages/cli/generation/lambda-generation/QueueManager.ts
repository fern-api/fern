import { SQS } from "aws-sdk";

class QueueManager {
    private sqs: SQS;
    private queueUrl: string;

    constructor(queueName: string) {
        this.sqs = new SQS();
        this.queueUrl = "";
    }

    private async createQueue(queueName: string): Promise<string> {
        const params = {
            QueueName: queueName,
            Attributes: {
                DelaySeconds: "0",
                MessageRetentionPeriod: "86400"
            }
        };

        const result = await this.sqs.createQueue(params).promise();
        return result.QueueUrl;
    }

    public async addToQueue(messageBody: string): Promise<void> {
        const params = {
            QueueUrl: this.queueUrl,
            MessageBody: messageBody
        };

        await this.sqs.sendMessage(params).promise();
    }
}
