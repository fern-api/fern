pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithOptionalReference {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo { value: Option<Foo> },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar { value: Option<Bar> },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithOptionalReference {
    pub fn foo(value: Option<Foo>) -> Self {
        Self::Foo { value }
    }

    pub fn bar(value: Option<Bar>) -> Self {
        Self::Bar { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
