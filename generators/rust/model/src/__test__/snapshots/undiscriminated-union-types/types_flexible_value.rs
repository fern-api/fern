pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FlexibleValue {
        #[serde(rename = "string")]
        r#String {
            value: String,
        },

        #[serde(rename = "integer")]
        Integer {
            value: i64,
        },

        #[serde(rename = "double")]
        Double {
            value: f64,
        },

        #[serde(rename = "boolean")]
        Boolean {
            value: bool,
        },

        #[serde(rename = "stringList")]
        StringList {
            value: Vec<String>,
        },
}
