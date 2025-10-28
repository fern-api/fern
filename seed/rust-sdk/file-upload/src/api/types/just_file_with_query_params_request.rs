pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileWithQueryParamsRequest {
    pub file: String,
    #[serde(rename = "maybeString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    pub integer: i64,
    #[serde(rename = "maybeInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(rename = "listOfStrings")]
    pub list_of_strings: String,
    #[serde(rename = "optionalListOfStrings")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list_of_strings: Option<String>,
}
