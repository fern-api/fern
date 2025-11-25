pub use crate::prelude::*;

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

impl fmt::Display for Fruit {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Acai(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::Fig(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
