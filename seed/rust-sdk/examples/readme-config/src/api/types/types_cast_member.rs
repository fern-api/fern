pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum CastMember {
    Actor(Actor),

    Actress(Actress),

    StuntDouble(StuntDouble),
}

impl CastMember {
    pub fn is_actor(&self) -> bool {
        matches!(self, Self::Actor(_))
    }

    pub fn is_actress(&self) -> bool {
        matches!(self, Self::Actress(_))
    }

    pub fn is_stuntdouble(&self) -> bool {
        matches!(self, Self::StuntDouble(_))
    }

    pub fn as_actor(&self) -> Option<&Actor> {
        match self {
            Self::Actor(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_actor(self) -> Option<Actor> {
        match self {
            Self::Actor(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_actress(&self) -> Option<&Actress> {
        match self {
            Self::Actress(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_actress(self) -> Option<Actress> {
        match self {
            Self::Actress(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_stuntdouble(&self) -> Option<&StuntDouble> {
        match self {
            Self::StuntDouble(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stuntdouble(self) -> Option<StuntDouble> {
        match self {
            Self::StuntDouble(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for CastMember {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Actor(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::Actress(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::StuntDouble(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
