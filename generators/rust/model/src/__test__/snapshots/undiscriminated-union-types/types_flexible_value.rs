use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FlexibleValue {
        String {
            value: String,
        },

        Integer {
            value: i32,
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
