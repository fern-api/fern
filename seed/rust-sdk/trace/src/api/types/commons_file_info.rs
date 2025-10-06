pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CommonsFileInfo {
    pub filename: String,
    pub contents: String,
}
