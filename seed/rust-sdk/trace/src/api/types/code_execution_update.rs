pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum CodeExecutionUpdate {
    CodeExecutionUpdateZero(CodeExecutionUpdateZero),

    CodeExecutionUpdateOne(CodeExecutionUpdateOne),

    CodeExecutionUpdateTwo(CodeExecutionUpdateTwo),

    CodeExecutionUpdateThree(CodeExecutionUpdateThree),

    CodeExecutionUpdateFour(CodeExecutionUpdateFour),

    CodeExecutionUpdateFive(CodeExecutionUpdateFive),

    CodeExecutionUpdateSix(CodeExecutionUpdateSix),

    CodeExecutionUpdateSeven(CodeExecutionUpdateSeven),

    CodeExecutionUpdateEight(CodeExecutionUpdateEight),

    CodeExecutionUpdateNine(CodeExecutionUpdateNine),

    CodeExecutionUpdateTen(CodeExecutionUpdateTen),
}

impl CodeExecutionUpdate {
    pub fn is_code_execution_update_zero(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateZero(_))
    }

    pub fn is_code_execution_update_one(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateOne(_))
    }

    pub fn is_code_execution_update_two(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateTwo(_))
    }

    pub fn is_code_execution_update_three(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateThree(_))
    }

    pub fn is_code_execution_update_four(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateFour(_))
    }

    pub fn is_code_execution_update_five(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateFive(_))
    }

    pub fn is_code_execution_update_six(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateSix(_))
    }

    pub fn is_code_execution_update_seven(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateSeven(_))
    }

    pub fn is_code_execution_update_eight(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateEight(_))
    }

    pub fn is_code_execution_update_nine(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateNine(_))
    }

    pub fn is_code_execution_update_ten(&self) -> bool {
        matches!(self, Self::CodeExecutionUpdateTen(_))
    }

    pub fn as_code_execution_update_zero(&self) -> Option<&CodeExecutionUpdateZero> {
        match self {
            Self::CodeExecutionUpdateZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_zero(self) -> Option<CodeExecutionUpdateZero> {
        match self {
            Self::CodeExecutionUpdateZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_one(&self) -> Option<&CodeExecutionUpdateOne> {
        match self {
            Self::CodeExecutionUpdateOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_one(self) -> Option<CodeExecutionUpdateOne> {
        match self {
            Self::CodeExecutionUpdateOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_two(&self) -> Option<&CodeExecutionUpdateTwo> {
        match self {
            Self::CodeExecutionUpdateTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_two(self) -> Option<CodeExecutionUpdateTwo> {
        match self {
            Self::CodeExecutionUpdateTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_three(&self) -> Option<&CodeExecutionUpdateThree> {
        match self {
            Self::CodeExecutionUpdateThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_three(self) -> Option<CodeExecutionUpdateThree> {
        match self {
            Self::CodeExecutionUpdateThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_four(&self) -> Option<&CodeExecutionUpdateFour> {
        match self {
            Self::CodeExecutionUpdateFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_four(self) -> Option<CodeExecutionUpdateFour> {
        match self {
            Self::CodeExecutionUpdateFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_five(&self) -> Option<&CodeExecutionUpdateFive> {
        match self {
            Self::CodeExecutionUpdateFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_five(self) -> Option<CodeExecutionUpdateFive> {
        match self {
            Self::CodeExecutionUpdateFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_six(&self) -> Option<&CodeExecutionUpdateSix> {
        match self {
            Self::CodeExecutionUpdateSix(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_six(self) -> Option<CodeExecutionUpdateSix> {
        match self {
            Self::CodeExecutionUpdateSix(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_seven(&self) -> Option<&CodeExecutionUpdateSeven> {
        match self {
            Self::CodeExecutionUpdateSeven(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_seven(self) -> Option<CodeExecutionUpdateSeven> {
        match self {
            Self::CodeExecutionUpdateSeven(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_eight(&self) -> Option<&CodeExecutionUpdateEight> {
        match self {
            Self::CodeExecutionUpdateEight(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_eight(self) -> Option<CodeExecutionUpdateEight> {
        match self {
            Self::CodeExecutionUpdateEight(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_nine(&self) -> Option<&CodeExecutionUpdateNine> {
        match self {
            Self::CodeExecutionUpdateNine(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_nine(self) -> Option<CodeExecutionUpdateNine> {
        match self {
            Self::CodeExecutionUpdateNine(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_code_execution_update_ten(&self) -> Option<&CodeExecutionUpdateTen> {
        match self {
            Self::CodeExecutionUpdateTen(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_code_execution_update_ten(self) -> Option<CodeExecutionUpdateTen> {
        match self {
            Self::CodeExecutionUpdateTen(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for CodeExecutionUpdate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::CodeExecutionUpdateZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateFive(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateSix(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateSeven(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateEight(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateNine(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CodeExecutionUpdateTen(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
