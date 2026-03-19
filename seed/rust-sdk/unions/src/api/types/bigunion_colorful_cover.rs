pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ColorfulCover {
    #[serde(default)]
    pub value: String,
}
