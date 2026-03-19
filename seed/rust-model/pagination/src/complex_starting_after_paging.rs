pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StartingAfterPaging {
    #[serde(default)]
    pub per_page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}