pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithBaseProperties {
    #[serde(rename = "integer")]
    #[non_exhaustive]
    Integer { value: i64, id: String },

    #[serde(rename = "string")]
    #[non_exhaustive]
    r#String { value: String, id: String },

    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo {
        #[serde(flatten)]
        data: Foo,
        id: String,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithBaseProperties {
    pub fn integer(value: i64, id: String) -> Self {
        Self::Integer { value, id }
    }

    pub fn string(value: String, id: String) -> Self {
        Self::r#String { value, id }
    }

    pub fn foo(data: Foo, id: String) -> Self {
        Self::Foo { data, id }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_id(&self) -> &str {
        match self {
            Self::Integer { id, .. } => id,
            Self::String { id, .. } => id,
            Self::Foo { id, .. } => id,
            Self::__Unknown(_) => {
                panic!("get_id() called on __Unknown variant; inspect the raw JSON value directly")
            }
        }
    }
}
