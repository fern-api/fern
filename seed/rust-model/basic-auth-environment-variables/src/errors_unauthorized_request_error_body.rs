pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ErrorsUnauthorizedRequestErrorBody {
    pub message: String,
}