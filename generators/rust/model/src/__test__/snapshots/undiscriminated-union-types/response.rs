use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
