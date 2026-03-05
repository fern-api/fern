pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum MyUnion {
    VariantA(VariantA),

    VariantB(VariantB),

    VariantC(VariantC),
}

impl MyUnion {
    pub fn is_varianta(&self) -> bool {
        matches!(self, Self::VariantA(_))
    }

    pub fn is_variantb(&self) -> bool {
        matches!(self, Self::VariantB(_))
    }

    pub fn is_variantc(&self) -> bool {
        matches!(self, Self::VariantC(_))
    }

    pub fn as_varianta(&self) -> Option<&VariantA> {
        match self {
            Self::VariantA(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_varianta(self) -> Option<VariantA> {
        match self {
            Self::VariantA(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variantb(&self) -> Option<&VariantB> {
        match self {
            Self::VariantB(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variantb(self) -> Option<VariantB> {
        match self {
            Self::VariantB(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_variantc(&self) -> Option<&VariantC> {
        match self {
            Self::VariantC(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_variantc(self) -> Option<VariantC> {
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
