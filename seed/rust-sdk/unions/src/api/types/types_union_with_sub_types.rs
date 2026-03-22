pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSubTypes {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    #[serde(rename = "fooExtended")]
    #[non_exhaustive]
    FooExtended {
        #[serde(default)]
        age: i64,
    },
}

impl UnionWithSubTypes {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn foo_extended(age: i64) -> Self {
        Self::FooExtended { age }
    }
}
