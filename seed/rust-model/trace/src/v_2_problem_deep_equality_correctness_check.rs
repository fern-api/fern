pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2ProblemDeepEqualityCorrectnessCheck {
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: V2ProblemParameterId,
}
