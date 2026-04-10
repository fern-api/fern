pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UndiscriminatedLiteralTwo {
    #[serde(
        rename = "10 non-alphanumeric string literals you're going to love & why (number 8 will surprise you)"
    )]
    TenNonAlphanumericStringLiteralsYoureGoingToLoveWhyNumber8WillSurpriseYou,
}
impl fmt::Display for UndiscriminatedLiteralTwo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::TenNonAlphanumericStringLiteralsYoureGoingToLoveWhyNumber8WillSurpriseYou => "10 non-alphanumeric string literals you're going to love & why (number 8 will surprise you)",
        };
        write!(f, "{}", s)
    }
}
