use crate::user_response::UserResponse;
use crate::organization::Organization;
use crate::document::Document;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
