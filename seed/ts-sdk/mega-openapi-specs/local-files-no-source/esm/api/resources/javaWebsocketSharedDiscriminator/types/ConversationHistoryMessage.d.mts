export interface ConversationHistoryMessage {
    type: ConversationHistoryMessage.Type;
    role: string;
    content: string;
}
export declare namespace ConversationHistoryMessage {
    const Type: {
        readonly History: "History";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
