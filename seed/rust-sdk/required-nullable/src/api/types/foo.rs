pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Foo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bar: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_bar: Option<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_required_bar: Option<String>,
    pub required_bar: String,
}