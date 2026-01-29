pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Response {
        #[serde(rename = "success")]
        Success {
            #[serde(flatten)]
            data: SuccessResponse,
        },

        #[serde(rename = "error")]
        Error {
            #[serde(flatten)]
            data: ErrorResponse,
        },
}
