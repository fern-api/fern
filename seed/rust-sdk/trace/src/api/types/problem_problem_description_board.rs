use crate::commons_variable_value::VariableValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ProblemDescriptionBoard {
    Html { value: String },

    Variable { value: VariableValue },

    TestCaseId { value: String },
}
