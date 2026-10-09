pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithMultipleNoProperties {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    #[serde(rename = "empty1")]
    #[non_exhaustive]
    Empty1 {},

    #[serde(rename = "empty2")]
    #[non_exhaustive]
    Empty2 {},

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithMultipleNoProperties {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn empty1() -> Self {
        Self::Empty1 {}
    }

    pub fn empty2() -> Self {
        Self::Empty2 {}
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
