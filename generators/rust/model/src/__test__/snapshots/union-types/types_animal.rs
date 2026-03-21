pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Animal {
        #[serde(rename = "dog")]
        #[non_exhaustive]
        Dog {
            #[serde(default)]
            name: String,
            #[serde(default)]
            breed: String,
            #[serde(default)]
            age: i64,
        },

        #[serde(rename = "cat")]
        #[non_exhaustive]
        Cat {
            #[serde(default)]
            name: String,
            #[serde(default)]
            is_indoor: bool,
            #[serde(default)]
            lives_remaining: i64,
        },

        #[serde(rename = "bird")]
        #[non_exhaustive]
        Bird {
            #[serde(default)]
            name: String,
            #[serde(default)]
            can_fly: bool,
            #[serde(skip_serializing_if = "Option::is_none")]
            wing_span: Option<f64>,
        },
}

impl Animal {
    pub fn dog(name: String, breed: String, age: i64) -> Self {
        Self::Dog { name, breed, age }
    }

    pub fn cat(name: String, is_indoor: bool, lives_remaining: i64) -> Self {
        Self::Cat { name, is_indoor, lives_remaining }
    }

    pub fn bird(name: String, can_fly: bool) -> Self {
        Self::Bird { name, can_fly, wing_span: None }
    }
}
