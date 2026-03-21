pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NextPage2 {
    #[serde(default)]
    pub page: i64,
    #[serde(default)]
    pub starting_after: String,
}
