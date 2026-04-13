pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithNoProperties {
    UnionWithNoPropertiesZero(UnionWithNoPropertiesZero),

    UnionWithNoPropertiesType(UnionWithNoPropertiesType),
}

impl UnionWithNoProperties {
    pub fn is_union_with_no_properties_zero(&self) -> bool {
        matches!(self, Self::UnionWithNoPropertiesZero(_))
    }

    pub fn is_union_with_no_properties_type(&self) -> bool {
        matches!(self, Self::UnionWithNoPropertiesType(_))
    }

    pub fn as_union_with_no_properties_zero(&self) -> Option<&UnionWithNoPropertiesZero> {
        match self {
            Self::UnionWithNoPropertiesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_no_properties_zero(self) -> Option<UnionWithNoPropertiesZero> {
        match self {
            Self::UnionWithNoPropertiesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_union_with_no_properties_type(&self) -> Option<&UnionWithNoPropertiesType> {
        match self {
            Self::UnionWithNoPropertiesType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_no_properties_type(self) -> Option<UnionWithNoPropertiesType> {
        match self {
            Self::UnionWithNoPropertiesType(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithNoProperties {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithNoPropertiesZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::UnionWithNoPropertiesType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
