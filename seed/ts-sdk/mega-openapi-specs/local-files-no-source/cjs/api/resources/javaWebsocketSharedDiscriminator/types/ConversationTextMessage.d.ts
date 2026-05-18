export interface ConversationTextMessage {
    type: ConversationTextMessage.Type;
    text: string;
    confidence: number;
}
export declare namespace ConversationTextMessage {
    const Type: {
        readonly ConversationText: "ConversationText";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
