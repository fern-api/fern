pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ScriptResourceType {
    Script,
}
impl fmt::Display for ScriptResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Script => "Script",
        };
        write!(f, "{}", s)
    }
}
