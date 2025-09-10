use crate::nullable_optional_user_response::UserResponse;
use crate::nullable_optional_organization::Organization;
use crate::nullable_optional_document::Document;
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
