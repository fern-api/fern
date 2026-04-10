pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnauthorizedErrorBodyErrorName {
    UnauthorizedError,
}
impl fmt::Display for UnauthorizedErrorBodyErrorName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::UnauthorizedError => "UnauthorizedError",
        };
        write!(f, "{}", s)
    }
}
