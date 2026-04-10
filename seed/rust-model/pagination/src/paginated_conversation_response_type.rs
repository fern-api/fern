pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PaginatedConversationResponseType {
    #[serde(rename = "conversation.list")]
    ConversationList,
}
impl fmt::Display for PaginatedConversationResponseType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ConversationList => "conversation.list",
        };
        write!(f, "{}", s)
    }
}
