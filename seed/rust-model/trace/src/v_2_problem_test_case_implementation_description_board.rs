use crate::v_2_problem_parameter_id::ParameterId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TestCaseImplementationDescriptionBoard {
        Html {
            value: String,
        },

        ParamId {
            value: ParameterId,
        },
}
