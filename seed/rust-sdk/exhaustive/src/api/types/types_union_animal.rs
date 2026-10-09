pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "animal")]
#[non_exhaustive]
pub enum Animal {
    #[serde(rename = "dog")]
    #[non_exhaustive]
    Dog {
        #[serde(default)]
        name: String,
        #[serde(rename = "likesToWoof")]
        #[serde(default)]
        likes_to_woof: bool,
    },

    #[serde(rename = "cat")]
    #[non_exhaustive]
    Cat {
        #[serde(default)]
        name: String,
        #[serde(rename = "likesToMeow")]
        #[serde(default)]
        likes_to_meow: bool,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Animal {
    pub fn dog(name: String, likes_to_woof: bool) -> Self {
        Self::Dog {
            name,
            likes_to_woof,
        }
    }

    pub fn cat(name: String, likes_to_meow: bool) -> Self {
        Self::Cat {
            name,
            likes_to_meow,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
