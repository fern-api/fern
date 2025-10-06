pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ComplexStartingAfterPaging {
    pub per_page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}
