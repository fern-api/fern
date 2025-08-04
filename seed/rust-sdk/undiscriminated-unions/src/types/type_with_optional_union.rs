use crate::my_union::MyUnion;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypeWithOptionalUnion {
    #[serde(rename = "myUnion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub my_union: Option<MyUnion>,
}