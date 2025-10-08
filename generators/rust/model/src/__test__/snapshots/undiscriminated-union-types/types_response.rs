pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Response {
        Success {
            #[serde(flatten)]
            data: SuccessResponse,
        },

        Error {
            #[serde(flatten)]
            data: ErrorResponse,
        },
}
