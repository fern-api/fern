use crate::acai::Acai;
use crate::fig::Fig;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Fruit {
        Acai(Acai),

        Fig(Fig),
}

impl Fruit {
    pub fn is_acai(&self) -> bool {
        matches!(self, Self::Acai(_))
    }

    pub fn is_fig(&self) -> bool {
        matches!(self, Self::Fig(_))
    }


    pub fn as_acai(&self) -> Option<&Acai> {
        match self {
                    Self::Acai(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_acai(self) -> Option<Acai> {
        match self {
                    Self::Acai(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_fig(&self) -> Option<&Fig> {
        match self {
                    Self::Fig(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_fig(self) -> Option<Fig> {
        match self {
                    Self::Fig(value) => Some(value),
                    _ => None,
                }
    }

}
