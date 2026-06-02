pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithNoProperties {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn empty() -> Self {
        Self::Empty {}
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
