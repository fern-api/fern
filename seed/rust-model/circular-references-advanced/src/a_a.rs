pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AA {
    #[serde(flatten)]
    pub root_type_fields: RootType,
}