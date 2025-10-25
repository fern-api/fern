pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithContentTypeRequest {
    pub file: String,
    pub foo: String,
    pub bar: MyObject,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo_bar: Option<MyObject>,
}
