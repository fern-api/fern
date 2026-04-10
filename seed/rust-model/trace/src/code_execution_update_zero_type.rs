pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CodeExecutionUpdateZeroType {
    #[serde(rename = "buildingExecutor")]
    BuildingExecutor,
}
impl fmt::Display for CodeExecutionUpdateZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::BuildingExecutor => "buildingExecutor",
        };
        write!(f, "{}", s)
    }
}
