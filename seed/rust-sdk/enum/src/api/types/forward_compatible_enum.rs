pub use crate::prelude::*;

/// Tests forward-compatible enums that accept
/// both known values and arbitrary strings.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ForwardCompatibleEnum {
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "inactive")]
    Inactive,
}
impl fmt::Display for ForwardCompatibleEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Active => "active",
            Self::Inactive => "inactive",
        };
        write!(f, "{}", s)
    }
}
