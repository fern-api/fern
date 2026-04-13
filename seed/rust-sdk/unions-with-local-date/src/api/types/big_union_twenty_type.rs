pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyType {
    #[serde(rename = "unwillingSmoke")]
    UnwillingSmoke,
}
impl fmt::Display for BigUnionTwentyType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::UnwillingSmoke => "unwillingSmoke",
        };
        write!(f, "{}", s)
    }
}
