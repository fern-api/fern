pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SearchResult {
        #[serde(rename = "user")]
        User {
            #[serde(flatten)]
            data: UserResponse,
        },

        #[serde(rename = "organization")]
        Organization {
            #[serde(flatten)]
            data: Organization,
        },

        #[serde(rename = "document")]
        Document {
            #[serde(flatten)]
            data: Document,
        },
}
