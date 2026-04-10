pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithDuplicateTypesZeroType {
    #[serde(rename = "foo1")]
    Foo1,
}
impl fmt::Display for UnionWithDuplicateTypesZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Foo1 => "foo1",
        };
        write!(f, "{}", s)
    }
}
