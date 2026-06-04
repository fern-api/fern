pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithoutKey {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn bar(data: Bar) -> Self {
        Self::Bar { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
