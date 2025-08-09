use serde::{Deserialize, Serialize};
use std::fmt;

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
impl fmt::Display for SingleFilterSearchRequestOperator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Equals => "=",
            Self::NotEquals => "!=",
            Self::In => "IN",
            Self::NotIn => "NIN",
            Self::LessThan => "<",
            Self::GreaterThan => ">",
            Self::Contains => "~",
            Self::DoesNotContain => "!~",
            Self::StartsWith => "^",
            Self::EndsWith => "$",
        };
        write!(f, "{}", s)
    }
}
