pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PaymentCurrency {
    #[serde(rename = "USD")]
    Usd,
    #[serde(rename = "YEN")]
    Yen,
}
impl fmt::Display for PaymentCurrency {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Usd => "USD",
            Self::Yen => "YEN",
        };
        write!(f, "{}", s)
    }
}
