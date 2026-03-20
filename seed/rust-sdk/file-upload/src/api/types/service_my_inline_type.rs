pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MyInlineType {
    #[serde(default)]
    pub bar: String,
}
