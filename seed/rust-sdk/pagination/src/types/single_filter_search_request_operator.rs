use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SingleFilterSearchRequestOperator {
    #[serde(rename = "=")]
    Equals,
    #[serde(rename = "!=")]
    NotEquals,
    #[serde(rename = "IN")]
    In,
    #[serde(rename = "NIN")]
    NotIn,
    #[serde(rename = "<")]
    LessThan,
    #[serde(rename = ">")]
    GreaterThan,
    #[serde(rename = "~")]
    Contains,
    #[serde(rename = "!~")]
    DoesNotContain,
    #[serde(rename = "^")]
    StartsWith,
    #[serde(rename = "$")]
    EndsWith,
}