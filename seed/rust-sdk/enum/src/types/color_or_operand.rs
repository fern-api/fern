use crate::color::Color;
use crate::operand::Operand;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
