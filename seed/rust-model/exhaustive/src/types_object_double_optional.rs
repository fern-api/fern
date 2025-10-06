pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesObjectDoubleOptional {
    #[serde(rename = "optionalAlias")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_alias: Option<TypesObjectOptionalAlias>,
}