pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "animal")]
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
}

impl Animal {
    pub fn dog(name: String, likes_to_woof: bool) -> Self {
        Self::Dog { name, likes_to_woof }
    }

    pub fn cat(name: String, likes_to_meow: bool) -> Self {
        Self::Cat { name, likes_to_meow }
    }
}
