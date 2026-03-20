pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo {
    #[serde(default)]
    pub normal: String,
    #[serde(default)]
    pub read: String,
    #[serde(default)]
    pub write: String,
}
