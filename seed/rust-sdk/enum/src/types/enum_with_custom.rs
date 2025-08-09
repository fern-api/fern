use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EnumWithCustom {
    #[serde(rename = "safe")]
    Safe,
    Custom,
}
impl fmt::Display for EnumWithCustom {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Safe => "safe",
            Self::Custom => "Custom",
        };
        write!(f, "{}", s)
    }
}
