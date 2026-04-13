pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithBaseProperties {
        UnionWithBasePropertiesZero(UnionWithBasePropertiesZero),

        UnionWithBasePropertiesOne(UnionWithBasePropertiesOne),

        UnionWithBasePropertiesTwo(UnionWithBasePropertiesTwo),
}

impl UnionWithBaseProperties {
    pub fn is_union_with_base_properties_zero(&self) -> bool {
        matches!(self, Self::UnionWithBasePropertiesZero(_))
    }

    pub fn is_union_with_base_properties_one(&self) -> bool {
        matches!(self, Self::UnionWithBasePropertiesOne(_))
    }

    pub fn is_union_with_base_properties_two(&self) -> bool {
        matches!(self, Self::UnionWithBasePropertiesTwo(_))
    }


    pub fn as_union_with_base_properties_zero(&self) -> Option<&UnionWithBasePropertiesZero> {
        match self {
                    Self::UnionWithBasePropertiesZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_union_with_base_properties_zero(self) -> Option<UnionWithBasePropertiesZero> {
        match self {
                    Self::UnionWithBasePropertiesZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_union_with_base_properties_one(&self) -> Option<&UnionWithBasePropertiesOne> {
        match self {
                    Self::UnionWithBasePropertiesOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_union_with_base_properties_one(self) -> Option<UnionWithBasePropertiesOne> {
        match self {
                    Self::UnionWithBasePropertiesOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_union_with_base_properties_two(&self) -> Option<&UnionWithBasePropertiesTwo> {
        match self {
                    Self::UnionWithBasePropertiesTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_union_with_base_properties_two(self) -> Option<UnionWithBasePropertiesTwo> {
        match self {
                    Self::UnionWithBasePropertiesTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for UnionWithBaseProperties {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithBasePropertiesZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UnionWithBasePropertiesOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UnionWithBasePropertiesTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
