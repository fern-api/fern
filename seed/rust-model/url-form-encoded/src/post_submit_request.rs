pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PostSubmitRequest {
    pub username: String,
    pub email: String,
}
