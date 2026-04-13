pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTenType {
    #[serde(rename = "popularLimit")]
    PopularLimit,
}
impl fmt::Display for BigUnionTenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PopularLimit => "popularLimit",
        };
        write!(f, "{}", s)
    }
}
