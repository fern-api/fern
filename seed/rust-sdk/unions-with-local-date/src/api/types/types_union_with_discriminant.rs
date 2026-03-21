pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "_type")]
pub enum UnionWithDiscriminant {
        #[serde(rename = "foo")]
        #[non_exhaustive]
        Foo {
            foo: Foo,
        },

        #[serde(rename = "bar")]
        #[non_exhaustive]
        Bar {
            bar: Bar,
        },
}

impl UnionWithDiscriminant {
    pub fn foo(foo: Foo) -> Self {
        Self::Foo { foo }
    }

    pub fn bar(bar: Bar) -> Self {
        Self::Bar { bar }
    }
}
