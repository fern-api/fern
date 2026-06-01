pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithDuplicateTypes {
    #[serde(rename = "foo1")]
    #[non_exhaustive]
    Foo1 {
        #[serde(flatten)]
        data: Foo,
    },

    #[serde(rename = "foo2")]
    #[non_exhaustive]
    Foo2 {
        #[serde(flatten)]
        data: Foo,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithDuplicateTypes {
    pub fn foo1(data: Foo) -> Self {
        Self::Foo1 { data }
    }

    pub fn foo2(data: Foo) -> Self {
        Self::Foo2 { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
