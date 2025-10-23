pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum TorU {
        T(T),

        U(U),
}

impl TorU {
    pub fn is_t(&self) -> bool {
        matches!(self, Self::T(_))
    }

    pub fn is_u(&self) -> bool {
        matches!(self, Self::U(_))
    }


    pub fn as_t(&self) -> Option<&T> {
        match self {
                    Self::T(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_t(self) -> Option<T> {
        match self {
                    Self::T(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_u(&self) -> Option<&U> {
        match self {
                    Self::U(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_u(self) -> Option<U> {
        match self {
                    Self::U(value) => Some(value),
                    _ => None,
                }
    }

}

impl fmt::Display for TorU {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::T(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::U(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
