pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSameStringTypes {
    CustomFormat { value: String },

    RegularString { value: String },

    PatternString { value: String },
}
