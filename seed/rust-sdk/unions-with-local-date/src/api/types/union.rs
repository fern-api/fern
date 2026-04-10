pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Union {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo {
        #[serde(skip_serializing_if = "Option::is_none")]
        foo: Option<Foo>,
    },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar {
        #[serde(skip_serializing_if = "Option::is_none")]
        bar: Option<Bar>,
    },
}

impl Union {
    pub fn foo() -> Self {
        Self::Foo { foo: None }
    }

    pub fn bar() -> Self {
        Self::Bar { bar: None }
    }

    pub fn foo_with_foo(foo: Foo) -> Self {
        Self::Foo { foo: Some(foo) }
    }

    pub fn bar_with_bar(bar: Bar) -> Self {
        Self::Bar { bar: Some(bar) }
    }
}
