use crate::parameter_id::ParameterId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DeepEqualityCorrectnessCheck {
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: ParameterId,
}