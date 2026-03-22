pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithNoProperties {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    #[serde(rename = "empty")]
    #[non_exhaustive]
    Empty {},
}

impl UnionWithNoProperties {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn empty() -> Self {
        Self::Empty {}
    }
}
