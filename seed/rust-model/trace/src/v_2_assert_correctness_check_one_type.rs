pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2AssertCorrectnessCheckOneType {
    #[serde(rename = "custom")]
    Custom,
}
impl fmt::Display for V2AssertCorrectnessCheckOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Custom => "custom",
        };
        write!(f, "{}", s)
    }
}
