pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct A {
    #[serde(flatten)]
    pub root_type_fields: RootType,
}
