pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetPresignedUrlRequest {
    #[serde(rename = "s3Key")]
    pub s_3_key: String,
}
