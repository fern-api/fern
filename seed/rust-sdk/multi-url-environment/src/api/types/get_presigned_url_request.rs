pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetPresignedUrlRequest {
    #[serde(rename = "s3Key")]
    #[serde(default)]
    pub s_3_key: String,
}
