pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SearchResult {
        User {
            #[serde(flatten)]
            data: UserResponse,
        },

        Organization {
            #[serde(flatten)]
            data: Organization,
        },

        Document {
            #[serde(flatten)]
            data: Document,
        },
}
