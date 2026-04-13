pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TypeEighteen {
    #[serde(rename = "eighteen")]
    Eighteen,
}
impl fmt::Display for TypeEighteen {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Eighteen => "eighteen",
        };
        write!(f, "{}", s)
    }
}
