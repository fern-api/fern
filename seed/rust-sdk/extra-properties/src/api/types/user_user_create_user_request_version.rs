pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UserCreateUserRequestVersion {
    #[serde(rename = "v1")]
    V1,
}
impl fmt::Display for UserCreateUserRequestVersion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::V1 => "v1",
        };
        write!(f, "{}", s)
    }
}
