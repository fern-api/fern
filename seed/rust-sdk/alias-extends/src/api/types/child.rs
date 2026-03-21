pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Child {
    #[serde(flatten)]
    pub parent_fields: Parent,
    #[serde(default)]
    pub child: String,
}
