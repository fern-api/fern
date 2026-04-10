pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2TestCaseImplementationReferenceOneType {
    #[serde(rename = "implementation")]
    Implementation,
}
impl fmt::Display for V2TestCaseImplementationReferenceOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Implementation => "implementation",
        };
        write!(f, "{}", s)
    }
}
