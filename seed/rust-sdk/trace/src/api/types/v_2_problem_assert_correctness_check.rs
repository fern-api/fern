pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum AssertCorrectnessCheck {
    #[serde(rename = "deepEquality")]
    #[non_exhaustive]
    DeepEquality {
        #[serde(rename = "expectedValueParameterId")]
        #[serde(default)]
        expected_value_parameter_id: ParameterId,
    },

    #[serde(rename = "custom")]
    #[non_exhaustive]
    Custom {
        #[serde(rename = "additionalParameters")]
        #[serde(default)]
        additional_parameters: Vec<Parameter>,
        #[serde(default)]
        code: FunctionImplementationForMultipleLanguages,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl AssertCorrectnessCheck {
    pub fn deep_equality(expected_value_parameter_id: ParameterId) -> Self {
        Self::DeepEquality {
            expected_value_parameter_id,
        }
    }

    pub fn custom(
        additional_parameters: Vec<Parameter>,
        code: FunctionImplementationForMultipleLanguages,
    ) -> Self {
        Self::Custom {
            additional_parameters,
            code,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
