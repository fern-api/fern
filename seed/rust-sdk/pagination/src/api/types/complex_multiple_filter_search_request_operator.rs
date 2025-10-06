pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ComplexMultipleFilterSearchRequestOperator {
    #[serde(rename = "AND")]
    And,
    #[serde(rename = "OR")]
    Or,
}
impl fmt::Display for ComplexMultipleFilterSearchRequestOperator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::And => "AND",
            Self::Or => "OR",
        };
        write!(f, "{}", s)
    }
}
