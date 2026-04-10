pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum MyUnion {
        #[non_exhaustive]
        A {
            #[serde(rename = "valueA")]
            #[serde(default)]
            value_a: String,
        },

        #[non_exhaustive]
        B {
            #[serde(rename = "valueB")]
            #[serde(default)]
            value_b: i64,
        },

        #[non_exhaustive]
        C {
            #[serde(rename = "valueC")]
            #[serde(default)]
            value_c: bool,
        },
}

impl MyUnion {
    pub fn a(value_a: String) -> Self {
        Self::A { value_a }
    }

    pub fn b(value_b: i64) -> Self {
        Self::B { value_b }
    }

    pub fn c(value_c: bool) -> Self {
        Self::C { value_c }
    }
}
