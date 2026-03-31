pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Union {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo { foo: Foo },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar { bar: Bar },
}

impl Union {
    pub fn foo(foo: Foo) -> Self {
        Self::Foo { foo }
    }

    pub fn bar(bar: Bar) -> Self {
        Self::Bar { bar }
    }
}
