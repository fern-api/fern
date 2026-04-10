pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2TestCaseFunctionZeroType {
    #[serde(rename = "withActualResult")]
    WithActualResult,
}
impl fmt::Display for V2TestCaseFunctionZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::WithActualResult => "withActualResult",
        };
        write!(f, "{}", s)
    }
}
