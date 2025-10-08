pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DeepEqualityCorrectnessCheck2 {
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: ParameterId2,
}