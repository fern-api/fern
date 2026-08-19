pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Union {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo { foo: Foo },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar { bar: Bar },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Union {
    pub fn foo(foo: Foo) -> Self {
        Self::Foo { foo }
    }

    pub fn bar(bar: Bar) -> Self {
        Self::Bar { bar }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
