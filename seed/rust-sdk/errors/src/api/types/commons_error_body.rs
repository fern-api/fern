pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CommonsErrorBody {
    pub message: String,
    pub code: i64,
}
