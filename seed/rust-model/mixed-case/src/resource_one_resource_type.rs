pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ResourceOneResourceType {
    Organization,
}
impl fmt::Display for ResourceOneResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Organization => "Organization",
        };
        write!(f, "{}", s)
    }
}
