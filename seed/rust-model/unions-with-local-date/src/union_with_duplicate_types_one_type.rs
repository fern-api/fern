pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithDuplicateTypesOneType {
    #[serde(rename = "foo2")]
    Foo2,
}
impl fmt::Display for UnionWithDuplicateTypesOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Foo2 => "foo2",
        };
        write!(f, "{}", s)
    }
}
