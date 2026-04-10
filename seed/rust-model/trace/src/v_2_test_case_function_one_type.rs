pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2TestCaseFunctionOneType {
    #[serde(rename = "custom")]
    Custom,
}
impl fmt::Display for V2TestCaseFunctionOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Custom => "custom",
        };
        write!(f, "{}", s)
    }
}
