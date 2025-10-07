pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Response {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<Foo>,
}
