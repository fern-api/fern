pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2CustomFiles {
    V2CustomFilesZero(V2CustomFilesZero),

    V2CustomFilesType(V2CustomFilesType),
}

impl V2CustomFiles {
    pub fn is_v2custom_files_zero(&self) -> bool {
        matches!(self, Self::V2CustomFilesZero(_))
    }

    pub fn is_v2custom_files_type(&self) -> bool {
        matches!(self, Self::V2CustomFilesType(_))
    }

    pub fn as_v2custom_files_zero(&self) -> Option<&V2CustomFilesZero> {
        match self {
            Self::V2CustomFilesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2custom_files_zero(self) -> Option<V2CustomFilesZero> {
        match self {
            Self::V2CustomFilesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_v2custom_files_type(&self) -> Option<&V2CustomFilesType> {
        match self {
            Self::V2CustomFilesType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2custom_files_type(self) -> Option<V2CustomFilesType> {
        match self {
            Self::V2CustomFilesType(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for V2CustomFiles {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2CustomFilesZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::V2CustomFilesType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
