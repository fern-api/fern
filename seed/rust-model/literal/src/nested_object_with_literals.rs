use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NestedObjectWithLiterals {
    #[serde(rename = "literal1")]
    pub literal_1: String,
    #[serde(rename = "literal2")]
    pub literal_2: String,
    #[serde(rename = "strProp")]
    pub str_prop: String,
}