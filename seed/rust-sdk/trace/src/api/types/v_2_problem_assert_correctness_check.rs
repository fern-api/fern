pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
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
}
