pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum SearchResult {
    #[serde(rename = "user")]
    #[non_exhaustive]
    User {
        #[serde(flatten)]
        data: UserResponse,
    },

    #[serde(rename = "organization")]
    #[non_exhaustive]
    Organization {
        #[serde(flatten)]
        data: Organization,
    },

    #[serde(rename = "document")]
    #[non_exhaustive]
    Document {
        #[serde(default)]
        id: String,
        #[serde(default)]
        title: String,
        #[serde(default)]
        content: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        author: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        tags: Option<Vec<String>>,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SearchResult {
    pub fn user(data: UserResponse) -> Self {
        Self::User { data }
    }

    pub fn organization(data: Organization) -> Self {
        Self::Organization { data }
    }

    pub fn document(id: String, title: String, content: String) -> Self {
        Self::Document {
            id,
            title,
            content,
            author: None,
            tags: None,
        }
    }

    pub fn document_with_author(
        id: String,
        title: String,
        content: String,
        author: String,
        tags: Option<Vec<String>>,
    ) -> Self {
        Self::Document {
            id,
            title,
            content,
            author: Some(author),
            tags,
        }
    }

    pub fn document_with_tags(
        id: String,
        title: String,
        content: String,
        author: Option<String>,
        tags: Vec<String>,
    ) -> Self {
        Self::Document {
            id,
            title,
            content,
            author,
            tags: Some(tags),
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
