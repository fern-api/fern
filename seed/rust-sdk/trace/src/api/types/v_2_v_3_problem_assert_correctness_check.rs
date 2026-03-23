pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AssertCorrectnessCheck2 {
    #[serde(rename = "deepEquality")]
    #[non_exhaustive]
    DeepEquality {
        #[serde(rename = "expectedValueParameterId")]
        #[serde(default)]
        expected_value_parameter_id: ParameterId2,
    },

    #[serde(rename = "custom")]
    #[non_exhaustive]
    Custom {
        #[serde(rename = "additionalParameters")]
        #[serde(default)]
        additional_parameters: Vec<Parameter2>,
        #[serde(default)]
        code: FunctionImplementationForMultipleLanguages2,
    },
}

impl AssertCorrectnessCheck2 {
    pub fn deep_equality(expected_value_parameter_id: ParameterId2) -> Self {
        Self::DeepEquality {
            expected_value_parameter_id,
        }
    }

    pub fn custom(
        additional_parameters: Vec<Parameter2>,
        code: FunctionImplementationForMultipleLanguages2,
    ) -> Self {
        Self::Custom {
            additional_parameters,
            code,
        }
    }
}
