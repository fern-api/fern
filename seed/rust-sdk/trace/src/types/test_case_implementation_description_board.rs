use crate::parameter_id::ParameterId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationDescriptionBoard {
        Html {
            value: String,
        },

        ParamId {
            value: ParameterId,
        },
}
