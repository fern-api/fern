pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum VariableValue {
    VariableValueZero(VariableValueZero),

    VariableValueOne(VariableValueOne),

    VariableValueTwo(VariableValueTwo),

    VariableValueThree(VariableValueThree),

    VariableValueFour(VariableValueFour),

    VariableValueFive(VariableValueFive),

    VariableValueSix(Box<VariableValueSix>),

    VariableValueSeven(VariableValueSeven),

    VariableValueEight(VariableValueEight),

    VariableValueNine(VariableValueNine),

    VariableValueType(VariableValueType),
}

impl VariableValue {
    pub fn is_variable_value_zero(&self) -> bool {
        matches!(self, Self::VariableValueZero(_))
    }

    pub fn is_variable_value_one(&self) -> bool {
        matches!(self, Self::VariableValueOne(_))
    }

    pub fn is_variable_value_two(&self) -> bool {
        matches!(self, Self::VariableValueTwo(_))
    }

    pub fn is_variable_value_three(&self) -> bool {
        matches!(self, Self::VariableValueThree(_))
    }

    pub fn is_variable_value_four(&self) -> bool {
        matches!(self, Self::VariableValueFour(_))
    }

    pub fn is_variable_value_five(&self) -> bool {
        matches!(self, Self::VariableValueFive(_))
    }

    pub fn is_variable_value_six(&self) -> bool {
        matches!(self, Self::VariableValueSix(_))
    }

    pub fn is_variable_value_seven(&self) -> bool {
        matches!(self, Self::VariableValueSeven(_))
    }

    pub fn is_variable_value_eight(&self) -> bool {
        matches!(self, Self::VariableValueEight(_))
    }

    pub fn is_variable_value_nine(&self) -> bool {
        matches!(self, Self::VariableValueNine(_))
    }

    pub fn is_variable_value_type(&self) -> bool {
        matches!(self, Self::VariableValueType(_))
    }

    pub fn as_variable_value_zero(&self) -> Option<&VariableValueZero> {
        match self {
            Self::VariableValueZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_zero(self) -> Option<VariableValueZero> {
        match self {
            Self::VariableValueZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_one(&self) -> Option<&VariableValueOne> {
        match self {
            Self::VariableValueOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_one(self) -> Option<VariableValueOne> {
        match self {
            Self::VariableValueOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_two(&self) -> Option<&VariableValueTwo> {
        match self {
            Self::VariableValueTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_two(self) -> Option<VariableValueTwo> {
        match self {
            Self::VariableValueTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_three(&self) -> Option<&VariableValueThree> {
        match self {
            Self::VariableValueThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_three(self) -> Option<VariableValueThree> {
        match self {
            Self::VariableValueThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_four(&self) -> Option<&VariableValueFour> {
        match self {
            Self::VariableValueFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_four(self) -> Option<VariableValueFour> {
        match self {
            Self::VariableValueFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_five(&self) -> Option<&VariableValueFive> {
        match self {
            Self::VariableValueFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_five(self) -> Option<VariableValueFive> {
        match self {
            Self::VariableValueFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_six(&self) -> Option<&Box<VariableValueSix>> {
        match self {
            Self::VariableValueSix(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_six(self) -> Option<VariableValueSix> {
        match self {
            Self::VariableValueSix(value) => Some(*value),
            _ => None,
        }
    }

    pub fn as_variable_value_seven(&self) -> Option<&VariableValueSeven> {
        match self {
            Self::VariableValueSeven(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_seven(self) -> Option<VariableValueSeven> {
        match self {
            Self::VariableValueSeven(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_eight(&self) -> Option<&VariableValueEight> {
        match self {
            Self::VariableValueEight(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_eight(self) -> Option<VariableValueEight> {
        match self {
            Self::VariableValueEight(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_nine(&self) -> Option<&VariableValueNine> {
        match self {
            Self::VariableValueNine(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_nine(self) -> Option<VariableValueNine> {
        match self {
            Self::VariableValueNine(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variable_value_type(&self) -> Option<&VariableValueType> {
        match self {
            Self::VariableValueType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variable_value_type(self) -> Option<VariableValueType> {
        match self {
            Self::VariableValueType(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for VariableValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::VariableValueZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueFive(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueSix(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueSeven(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueEight(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueNine(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariableValueType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
