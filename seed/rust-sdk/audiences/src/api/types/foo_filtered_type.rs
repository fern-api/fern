pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FooFilteredType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_property: Option<String>,
    pub private_property: i64,
}
