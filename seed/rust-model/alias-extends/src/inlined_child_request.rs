pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlinedChildRequest {
    pub child: String,
    pub parent: String,
}
