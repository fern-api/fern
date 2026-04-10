pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum VariableType {
    VariableTypeZero(VariableTypeZero),

    VariableTypeOne(VariableTypeOne),

    VariableTypeTwo(VariableTypeTwo),

    VariableTypeThree(VariableTypeThree),

    VariableTypeFour(VariableTypeFour),

    VariableTypeFive(VariableTypeFive),

    VariableTypeSix(VariableTypeSix),

    VariableTypeSeven(VariableTypeSeven),

    VariableTypeEight(VariableTypeEight),

    VariableTypeNine(VariableTypeNine),
}

impl VariableType {
    pub fn is_variable_type_zero(&self) -> bool {
        matches!(self, Self::VariableTypeZero(_))
    }

    pub fn is_variable_type_one(&self) -> bool {
        matches!(self, Self::VariableTypeOne(_))
    }

    pub fn is_variable_type_two(&self) -> bool {
        matches!(self, Self::VariableTypeTwo(_))
    }

    pub fn is_variable_type_three(&self) -> bool {
        matches!(self, Self::VariableTypeThree(_))
    }

    pub fn is_variable_type_four(&self) -> bool {
        matches!(self, Self::VariableTypeFour(_))
    }

    pub fn is_variable_type_five(&self) -> bool {
        matches!(self, Self::VariableTypeFive(_))
    }

    pub fn is_variable_type_six(&self) -> bool {
        matches!(self, Self::VariableTypeSix(_))
    }

    pub fn is_variable_type_seven(&self) -> bool {
        matches!(self, Self::VariableTypeSeven(_))
    }

    pub fn is_variable_type_eight(&self) -> bool {
        matches!(self, Self::VariableTypeEight(_))
    }

    pub fn is_variable_type_nine(&self) -> bool {
        matches!(self, Self::VariableTypeNine(_))
    }

    pub fn as_variable_type_zero(&self) -> Option<&VariableTypeZero> {
        match self {
            Self::VariableTypeZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_zero(self) -> Option<VariableTypeZero> {
        match self {
            Self::VariableTypeZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_one(&self) -> Option<&VariableTypeOne> {
        match self {
            Self::VariableTypeOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_one(self) -> Option<VariableTypeOne> {
        match self {
            Self::VariableTypeOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_two(&self) -> Option<&VariableTypeTwo> {
        match self {
            Self::VariableTypeTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_two(self) -> Option<VariableTypeTwo> {
        match self {
            Self::VariableTypeTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_three(&self) -> Option<&VariableTypeThree> {
        match self {
            Self::VariableTypeThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_three(self) -> Option<VariableTypeThree> {
        match self {
            Self::VariableTypeThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_four(&self) -> Option<&VariableTypeFour> {
        match self {
            Self::VariableTypeFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_four(self) -> Option<VariableTypeFour> {
        match self {
            Self::VariableTypeFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_five(&self) -> Option<&VariableTypeFive> {
        match self {
            Self::VariableTypeFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_five(self) -> Option<VariableTypeFive> {
        match self {
            Self::VariableTypeFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_six(&self) -> Option<&VariableTypeSix> {
        match self {
            Self::VariableTypeSix(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_six(self) -> Option<VariableTypeSix> {
        match self {
            Self::VariableTypeSix(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_seven(&self) -> Option<&VariableTypeSeven> {
        match self {
            Self::VariableTypeSeven(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_seven(self) -> Option<VariableTypeSeven> {
        match self {
            Self::VariableTypeSeven(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_eight(&self) -> Option<&VariableTypeEight> {
        match self {
            Self::VariableTypeEight(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_eight(self) -> Option<VariableTypeEight> {
        match self {
            Self::VariableTypeEight(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_type_nine(&self) -> Option<&VariableTypeNine> {
        match self {
            Self::VariableTypeNine(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_type_nine(self) -> Option<VariableTypeNine> {
        match self {
            Self::VariableTypeNine(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for VariableType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::VariableTypeZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeFive(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeSix(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeSeven(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeEight(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableTypeNine(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
