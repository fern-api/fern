use crate::optional_alias::OptionalAlias;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DoubleOptional {
    #[serde(rename = "optionalAlias")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_alias: Option<OptionalAlias>,
}