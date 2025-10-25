pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UploadFileRequest {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<String>,
}
