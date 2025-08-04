use crate::success_response::SuccessResponse;
use crate::error_response::ErrorResponse;
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
