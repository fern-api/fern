pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum AstFruit {
        Acai(AstAcai),

        Fig(AstFig),
}

impl AstFruit {
    pub fn is_acai(&self) -> bool {
        matches!(self, Self::Acai(_))
    }

    pub fn is_fig(&self) -> bool {
        matches!(self, Self::Fig(_))
    }


    pub fn as_acai(&self) -> Option<&AstAcai> {
        match self {
                    Self::Acai(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_acai(self) -> Option<AstAcai> {
        match self {
                    Self::Acai(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_fig(&self) -> Option<&AstFig> {
        match self {
                    Self::Fig(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_fig(self) -> Option<AstFig> {
        match self {
                    Self::Fig(value) => Some(value),
                    _ => None,
                }
    }

}
