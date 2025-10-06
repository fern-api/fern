pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TypesFlexibleValue {
        String {
            value: String,
        },

        Integer {
            value: i64,
        },

        Double {
            value: f64,
        },

        Boolean {
            value: bool,
        },

        StringList {
            value: Vec<String>,
        },
}
