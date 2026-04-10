pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Level1Level2AddressCountry {
    #[serde(rename = "USA")]
    Usa,
}
impl fmt::Display for Level1Level2AddressCountry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Usa => "USA",
        };
        write!(f, "{}", s)
    }
}
