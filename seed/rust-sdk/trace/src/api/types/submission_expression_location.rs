pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionExpressionLocation {
    pub start: i64,
    pub offset: i64,
}
