pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithSameNumberTypes {
        #[serde(rename = "positiveInt")]
        #[non_exhaustive]
        PositiveInt {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<i64>,
        },

        #[serde(rename = "negativeInt")]
        #[non_exhaustive]
        NegativeInt {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<i64>,
        },

        #[serde(rename = "anyNumber")]
        #[non_exhaustive]
        AnyNumber {
            #[serde(skip_serializing_if = "Option::is_none")]
            #[serde(default)]
            #[serde(with = "crate::core::number_serializers::option")]
            value: Option<f64>,
        },
}

impl UnionWithSameNumberTypes {
    pub fn positive_int() -> Self {
        Self::PositiveInt { value: None }
    }

    pub fn negative_int() -> Self {
        Self::NegativeInt { value: None }
    }

    pub fn any_number() -> Self {
        Self::AnyNumber { value: None }
    }

    pub fn positive_int_with_value(value: i64) -> Self {
        Self::PositiveInt { value: Some(value) }
    }

    pub fn negative_int_with_value(value: i64) -> Self {
        Self::NegativeInt { value: Some(value) }
    }

    pub fn any_number_with_value(value: f64) -> Self {
        Self::AnyNumber { value: Some(value) }
    }
}
