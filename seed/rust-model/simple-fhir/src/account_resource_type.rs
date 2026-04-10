pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AccountResourceType {
    Account,
}
impl fmt::Display for AccountResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Account => "Account",
        };
        write!(f, "{}", s)
    }
}
