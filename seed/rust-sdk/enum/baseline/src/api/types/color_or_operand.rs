pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum ColorOrOperand {
    Color(Color),

    Operand(Operand),
}

impl ColorOrOperand {
    pub fn is_color(&self) -> bool {
        matches!(self, Self::Color(_))
    }

    pub fn is_operand(&self) -> bool {
        matches!(self, Self::Operand(_))
    }

    pub fn as_color(&self) -> Option<&Color> {
        match self {
            Self::Color(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_color(self) -> Option<Color> {
        match self {
            Self::Color(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_operand(&self) -> Option<&Operand> {
        match self {
            Self::Operand(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_operand(self) -> Option<Operand> {
        match self {
            Self::Operand(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for ColorOrOperand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Color(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::Operand(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
