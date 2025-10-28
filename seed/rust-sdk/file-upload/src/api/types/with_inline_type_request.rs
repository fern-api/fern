pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithInlineTypeRequest {
    pub file: String,
    pub request: MyInlineType,
}
