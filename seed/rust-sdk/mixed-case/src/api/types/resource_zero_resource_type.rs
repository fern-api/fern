pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ResourceZeroResourceType {
    #[serde(rename = "user")]
    User,
}
impl fmt::Display for ResourceZeroResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::User => "user",
        };
        write!(f, "{}", s)
    }
}
