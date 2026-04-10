pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2V3CustomFiles {
        V2V3CustomFilesZero(V2V3CustomFilesZero),

        V2V3CustomFilesType(V2V3CustomFilesType),
}

impl V2V3CustomFiles {
    pub fn is_v2v3custom_files_zero(&self) -> bool {
        matches!(self, Self::V2V3CustomFilesZero(_))
    }

    pub fn is_v2v3custom_files_type(&self) -> bool {
        matches!(self, Self::V2V3CustomFilesType(_))
    }


    pub fn as_v2v3custom_files_zero(&self) -> Option<&V2V3CustomFilesZero> {
        match self {
                    Self::V2V3CustomFilesZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3custom_files_zero(self) -> Option<V2V3CustomFilesZero> {
        match self {
                    Self::V2V3CustomFilesZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_v2v3custom_files_type(&self) -> Option<&V2V3CustomFilesType> {
        match self {
                    Self::V2V3CustomFilesType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3custom_files_type(self) -> Option<V2V3CustomFilesType> {
        match self {
                    Self::V2V3CustomFilesType(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for V2V3CustomFiles {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2V3CustomFilesZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::V2V3CustomFilesType(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
