pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum MyUnion {
    VariantA(VariantA),

    VariantB(VariantB),

    VariantC(VariantC),
}

impl MyUnion {
    pub fn is_variant_a(&self) -> bool {
        matches!(self, Self::VariantA(_))
    }

    pub fn is_variant_b(&self) -> bool {
        matches!(self, Self::VariantB(_))
    }

    pub fn is_variant_c(&self) -> bool {
        matches!(self, Self::VariantC(_))
    }

    pub fn as_variant_a(&self) -> Option<&VariantA> {
        match self {
            Self::VariantA(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variant_a(self) -> Option<VariantA> {
        match self {
            Self::VariantA(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variant_b(&self) -> Option<&VariantB> {
        match self {
            Self::VariantB(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variant_b(self) -> Option<VariantB> {
        match self {
            Self::VariantB(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variant_c(&self) -> Option<&VariantC> {
        match self {
            Self::VariantC(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variant_c(self) -> Option<VariantC> {
        match self {
            Self::VariantC(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for MyUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::VariantA(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariantB(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::VariantC(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
