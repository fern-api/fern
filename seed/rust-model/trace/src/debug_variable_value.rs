pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum DebugVariableValue {
        DebugVariableValueZero(DebugVariableValueZero),

        DebugVariableValueOne(DebugVariableValueOne),

        DebugVariableValueTwo(DebugVariableValueTwo),

        DebugVariableValueThree(DebugVariableValueThree),

        DebugVariableValueFour(DebugVariableValueFour),

        DebugVariableValueFive(DebugVariableValueFive),

        DebugVariableValueSix(Box<DebugVariableValueSix>),

        DebugVariableValueSeven(DebugVariableValueSeven),

        DebugVariableValueEight(DebugVariableValueEight),

        DebugVariableValueNine(DebugVariableValueNine),

        DebugVariableValueTen(DebugVariableValueTen),

        DebugVariableValueEleven(DebugVariableValueEleven),

        DebugVariableValueTwelve(DebugVariableValueTwelve),
}

impl DebugVariableValue {
    pub fn is_debug_variable_value_zero(&self) -> bool {
        matches!(self, Self::DebugVariableValueZero(_))
    }

    pub fn is_debug_variable_value_one(&self) -> bool {
        matches!(self, Self::DebugVariableValueOne(_))
    }

    pub fn is_debug_variable_value_two(&self) -> bool {
        matches!(self, Self::DebugVariableValueTwo(_))
    }

    pub fn is_debug_variable_value_three(&self) -> bool {
        matches!(self, Self::DebugVariableValueThree(_))
    }

    pub fn is_debug_variable_value_four(&self) -> bool {
        matches!(self, Self::DebugVariableValueFour(_))
    }

    pub fn is_debug_variable_value_five(&self) -> bool {
        matches!(self, Self::DebugVariableValueFive(_))
    }

    pub fn is_debug_variable_value_six(&self) -> bool {
        matches!(self, Self::DebugVariableValueSix(_))
    }

    pub fn is_debug_variable_value_seven(&self) -> bool {
        matches!(self, Self::DebugVariableValueSeven(_))
    }

    pub fn is_debug_variable_value_eight(&self) -> bool {
        matches!(self, Self::DebugVariableValueEight(_))
    }

    pub fn is_debug_variable_value_nine(&self) -> bool {
        matches!(self, Self::DebugVariableValueNine(_))
    }

    pub fn is_debug_variable_value_ten(&self) -> bool {
        matches!(self, Self::DebugVariableValueTen(_))
    }

    pub fn is_debug_variable_value_eleven(&self) -> bool {
        matches!(self, Self::DebugVariableValueEleven(_))
    }

    pub fn is_debug_variable_value_twelve(&self) -> bool {
        matches!(self, Self::DebugVariableValueTwelve(_))
    }


    pub fn as_debug_variable_value_zero(&self) -> Option<&DebugVariableValueZero> {
        match self {
                    Self::DebugVariableValueZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_zero(self) -> Option<DebugVariableValueZero> {
        match self {
                    Self::DebugVariableValueZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_one(&self) -> Option<&DebugVariableValueOne> {
        match self {
                    Self::DebugVariableValueOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_one(self) -> Option<DebugVariableValueOne> {
        match self {
                    Self::DebugVariableValueOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_two(&self) -> Option<&DebugVariableValueTwo> {
        match self {
                    Self::DebugVariableValueTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_two(self) -> Option<DebugVariableValueTwo> {
        match self {
                    Self::DebugVariableValueTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_three(&self) -> Option<&DebugVariableValueThree> {
        match self {
                    Self::DebugVariableValueThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_three(self) -> Option<DebugVariableValueThree> {
        match self {
                    Self::DebugVariableValueThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_four(&self) -> Option<&DebugVariableValueFour> {
        match self {
                    Self::DebugVariableValueFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_four(self) -> Option<DebugVariableValueFour> {
        match self {
                    Self::DebugVariableValueFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_five(&self) -> Option<&DebugVariableValueFive> {
        match self {
                    Self::DebugVariableValueFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_five(self) -> Option<DebugVariableValueFive> {
        match self {
                    Self::DebugVariableValueFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_six(&self) -> Option<&Box<DebugVariableValueSix>> {
        match self {
                    Self::DebugVariableValueSix(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_six(self) -> Option<DebugVariableValueSix> {
        match self {
                    Self::DebugVariableValueSix(value) => Some(*value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_seven(&self) -> Option<&DebugVariableValueSeven> {
        match self {
                    Self::DebugVariableValueSeven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_seven(self) -> Option<DebugVariableValueSeven> {
        match self {
                    Self::DebugVariableValueSeven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_eight(&self) -> Option<&DebugVariableValueEight> {
        match self {
                    Self::DebugVariableValueEight(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_eight(self) -> Option<DebugVariableValueEight> {
        match self {
                    Self::DebugVariableValueEight(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_nine(&self) -> Option<&DebugVariableValueNine> {
        match self {
                    Self::DebugVariableValueNine(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_nine(self) -> Option<DebugVariableValueNine> {
        match self {
                    Self::DebugVariableValueNine(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_ten(&self) -> Option<&DebugVariableValueTen> {
        match self {
                    Self::DebugVariableValueTen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_ten(self) -> Option<DebugVariableValueTen> {
        match self {
                    Self::DebugVariableValueTen(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_eleven(&self) -> Option<&DebugVariableValueEleven> {
        match self {
                    Self::DebugVariableValueEleven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_eleven(self) -> Option<DebugVariableValueEleven> {
        match self {
                    Self::DebugVariableValueEleven(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_debug_variable_value_twelve(&self) -> Option<&DebugVariableValueTwelve> {
        match self {
                    Self::DebugVariableValueTwelve(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_debug_variable_value_twelve(self) -> Option<DebugVariableValueTwelve> {
        match self {
                    Self::DebugVariableValueTwelve(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for DebugVariableValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DebugVariableValueZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueThree(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueFour(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueFive(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueSix(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueSeven(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueEight(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueNine(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueTen(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueEleven(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DebugVariableValueTwelve(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
