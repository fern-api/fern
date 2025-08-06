use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Currency {
    #[serde(rename = "USD")]
    Usd,
    #[serde(rename = "YEN")]
    Yen,
}
impl fmt::Display for Currency {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Usd => "USD",
            Self::Yen => "YEN",
        };
        write!(f, "{}", s)
    }
}
