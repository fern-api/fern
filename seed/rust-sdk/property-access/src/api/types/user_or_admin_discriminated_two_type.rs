pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UserOrAdminDiscriminatedTwoType {
    #[serde(rename = "empty")]
    Empty,
}
impl fmt::Display for UserOrAdminDiscriminatedTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Empty => "empty",
        };
        write!(f, "{}", s)
    }
}
