pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicateTypes {
    #[serde(rename = "foo1")]
    #[non_exhaustive]
    Foo1 {
        #[serde(flatten)]
        data: Foo,
    },

    #[serde(rename = "foo2")]
    #[non_exhaustive]
    Foo2 {
        #[serde(flatten)]
        data: Foo,
    },
}

impl UnionWithDuplicateTypes {
    pub fn foo_1(data: Foo) -> Self {
        Self::Foo1 { data }
    }

    pub fn foo_2(data: Foo) -> Self {
        Self::Foo2 { data }
    }
}
