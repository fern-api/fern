pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithMultipleNoProperties {
        UnionWithMultipleNoPropertiesZero(UnionWithMultipleNoPropertiesZero),

        UnionWithMultipleNoPropertiesOne(UnionWithMultipleNoPropertiesOne),

        UnionWithMultipleNoPropertiesTwo(UnionWithMultipleNoPropertiesTwo),
}

impl UnionWithMultipleNoProperties {
    pub fn is_union_with_multiple_no_properties_zero(&self) -> bool {
        matches!(self, Self::UnionWithMultipleNoPropertiesZero(_))
    }

    pub fn is_union_with_multiple_no_properties_one(&self) -> bool {
        matches!(self, Self::UnionWithMultipleNoPropertiesOne(_))
    }

    pub fn is_union_with_multiple_no_properties_two(&self) -> bool {
        matches!(self, Self::UnionWithMultipleNoPropertiesTwo(_))
    }


    pub fn as_union_with_multiple_no_properties_zero(&self) -> Option<&UnionWithMultipleNoPropertiesZero> {
        match self {
                    Self::UnionWithMultipleNoPropertiesZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_union_with_multiple_no_properties_zero(self) -> Option<UnionWithMultipleNoPropertiesZero> {
        match self {
                    Self::UnionWithMultipleNoPropertiesZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_union_with_multiple_no_properties_one(&self) -> Option<&UnionWithMultipleNoPropertiesOne> {
        match self {
                    Self::UnionWithMultipleNoPropertiesOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_union_with_multiple_no_properties_one(self) -> Option<UnionWithMultipleNoPropertiesOne> {
        match self {
                    Self::UnionWithMultipleNoPropertiesOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_union_with_multiple_no_properties_two(&self) -> Option<&UnionWithMultipleNoPropertiesTwo> {
        match self {
                    Self::UnionWithMultipleNoPropertiesTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_union_with_multiple_no_properties_two(self) -> Option<UnionWithMultipleNoPropertiesTwo> {
        match self {
                    Self::UnionWithMultipleNoPropertiesTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for UnionWithMultipleNoProperties {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithMultipleNoPropertiesZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UnionWithMultipleNoPropertiesOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UnionWithMultipleNoPropertiesTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
