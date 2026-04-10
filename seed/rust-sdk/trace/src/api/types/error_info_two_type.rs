pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ErrorInfoTwoType {
    #[serde(rename = "internalError")]
    InternalError,
}
impl fmt::Display for ErrorInfoTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::InternalError => "internalError",
        };
        write!(f, "{}", s)
    }
}
