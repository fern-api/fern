pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Level1AddressCountry {
    #[serde(rename = "USA")]
    Usa,
}
impl fmt::Display for Level1AddressCountry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Usa => "USA",
        };
        write!(f, "{}", s)
    }
}
