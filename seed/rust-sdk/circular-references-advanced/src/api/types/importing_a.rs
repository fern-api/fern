pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ImportingA {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub a: Option<A>,
}
