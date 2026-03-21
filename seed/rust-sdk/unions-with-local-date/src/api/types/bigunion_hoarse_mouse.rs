pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HoarseMouse {
    #[serde(default)]
    pub value: String,
}
