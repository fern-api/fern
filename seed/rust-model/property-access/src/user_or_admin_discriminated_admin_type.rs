pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UserOrAdminDiscriminatedAdminType {
    #[serde(rename = "admin")]
    Admin,
}
impl fmt::Display for UserOrAdminDiscriminatedAdminType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Admin => "admin",
        };
        write!(f, "{}", s)
    }
}
