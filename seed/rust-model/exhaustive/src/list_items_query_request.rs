pub use crate::prelude::*;

/// Query parameters for listItems
#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq, Eq, Hash)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct ListItemsQueryRequest {
    /// The cursor for pagination
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into, strip_option))]
    pub cursor: Option<String>,
    /// Maximum number of items to return
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into, strip_option))]
    pub limit: Option<i64>,
}
