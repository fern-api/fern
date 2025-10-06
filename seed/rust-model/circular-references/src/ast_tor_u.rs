pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum AstTorU {
        T(AstT),

        U(AstU),
}

impl AstTorU {
    pub fn is_t(&self) -> bool {
        matches!(self, Self::T(_))
    }

    pub fn is_u(&self) -> bool {
        matches!(self, Self::U(_))
    }


    pub fn as_t(&self) -> Option<&AstT> {
        match self {
                    Self::T(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_t(self) -> Option<AstT> {
        match self {
                    Self::T(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_u(&self) -> Option<&AstU> {
        match self {
                    Self::U(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_u(self) -> Option<AstU> {
        match self {
                    Self::U(value) => Some(value),
                    _ => None,
                }
    }

}
