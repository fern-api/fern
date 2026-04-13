pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithSubTypesOneType {
    #[serde(rename = "fooExtended")]
    FooExtended,
}
impl fmt::Display for UnionWithSubTypesOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::FooExtended => "fooExtended",
        };
        write!(f, "{}", s)
    }
}
