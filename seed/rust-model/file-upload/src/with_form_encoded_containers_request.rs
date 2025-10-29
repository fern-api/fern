pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WithFormEncodedContainersRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    pub integer: i64,
    pub file: String,
    pub file_list: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_file: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_file_list: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list_of_strings: Option<Vec<String>>,
    pub list_of_objects: Vec<MyObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_metadata: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object_type: Option<ObjectType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_id: Option<Id>,
    pub list_of_objects_with_optionals: Vec<MyObjectWithOptional>,
    pub alias_object: MyAliasObject,
    pub list_of_alias_object: Vec<MyAliasObject>,
    pub alias_list_of_object: MyCollectionAliasObject,
}
