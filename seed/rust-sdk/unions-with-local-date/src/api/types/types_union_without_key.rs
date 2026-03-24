pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithoutKey {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar {
        #[serde(flatten)]
        data: Bar,
    },
}

impl UnionWithoutKey {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn bar(data: Bar) -> Self {
        Self::Bar { data }
    }
}
