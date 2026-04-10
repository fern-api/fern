pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DiscriminatedLiteralDefaultNameValue {
    Bob,
}
impl fmt::Display for DiscriminatedLiteralDefaultNameValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Bob => "Bob",
        };
        write!(f, "{}", s)
    }
}
