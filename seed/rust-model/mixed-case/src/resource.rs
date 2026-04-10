pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Resource {
        ResourceZero(ResourceZero),

        ResourceOne(ResourceOne),
}

impl Resource {
    pub fn is_resource_zero(&self) -> bool {
        matches!(self, Self::ResourceZero(_))
    }

    pub fn is_resource_one(&self) -> bool {
        matches!(self, Self::ResourceOne(_))
    }


    pub fn as_resource_zero(&self) -> Option<&ResourceZero> {
        match self {
                    Self::ResourceZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_resource_zero(self) -> Option<ResourceZero> {
        match self {
                    Self::ResourceZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_resource_one(&self) -> Option<&ResourceOne> {
        match self {
                    Self::ResourceOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_resource_one(self) -> Option<ResourceOne> {
        match self {
                    Self::ResourceOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for Resource {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ResourceZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::ResourceOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
