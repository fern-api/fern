use crate::variable_value::VariableValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ProblemDescriptionBoard {
        Html {
            value: String,
        },

        Variable {
            value: VariableValue,
        },

        TestCaseId {
            value: String,
        },
}
