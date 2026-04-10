pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithOptionalReference {
        #[serde(rename = "foo")]
        #[non_exhaustive]
        Foo {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<Foo>,
        },

        #[serde(rename = "bar")]
        #[non_exhaustive]
        Bar {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<Bar>,
        },
}

impl UnionWithOptionalReference {
    pub fn foo() -> Self {
        Self::Foo { value: None }
    }

    pub fn bar() -> Self {
        Self::Bar { value: None }
    }

    pub fn foo_with_value(value: Foo) -> Self {
        Self::Foo { value: Some(value) }
    }

    pub fn bar_with_value(value: Bar) -> Self {
        Self::Bar { value: Some(value) }
    }
}
