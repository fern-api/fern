pub use crate::prelude::*;

/// Tests enum name and value can be
/// different.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Operand {
    #[serde(rename = ">")]
    GreaterThan,
    #[serde(rename = "=")]
    EqualTo,
    /// The name and value should be similar
    /// are similar for less than.
    #[serde(rename = "less_than")]
    LessThan,
}
impl fmt::Display for Operand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GreaterThan => ">",
            Self::EqualTo => "=",
            Self::LessThan => "less_than",
        };
        write!(f, "{}", s)
    }
}
