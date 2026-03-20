pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DiligentDeal {
    #[serde(default)]
    pub value: String,
}
