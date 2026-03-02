pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum PaymentMethodUnion {
    TokenizeCard(TokenizeCard),

    ConvertToken(ConvertToken),
}

impl PaymentMethodUnion {
    pub fn is_tokenizecard(&self) -> bool {
        matches!(self, Self::TokenizeCard(_))
    }

    pub fn is_converttoken(&self) -> bool {
        matches!(self, Self::ConvertToken(_))
    }

    pub fn as_tokenizecard(&self) -> Option<&TokenizeCard> {
        match self {
            Self::TokenizeCard(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_tokenizecard(self) -> Option<TokenizeCard> {
        match self {
            Self::TokenizeCard(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_converttoken(&self) -> Option<&ConvertToken> {
        match self {
            Self::ConvertToken(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_converttoken(self) -> Option<ConvertToken> {
        match self {
            Self::ConvertToken(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for PaymentMethodUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::TokenizeCard(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::ConvertToken(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
