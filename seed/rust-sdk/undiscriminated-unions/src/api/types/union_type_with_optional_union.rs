pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnionTypeWithOptionalUnion {
    #[serde(rename = "myUnion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub my_union: Option<UnionMyUnion>,
}
