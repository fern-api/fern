pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Metadata2 {
    #[serde(rename = "html")]
    #[non_exhaustive]
    Html {
        value: String,
        extra: HashMap<String, String>,
        tags: HashSet<String>,
    },

    #[serde(rename = "markdown")]
    #[non_exhaustive]
    Markdown {
        value: String,
        extra: HashMap<String, String>,
        tags: HashSet<String>,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Metadata2 {
    pub fn html(value: String, extra: HashMap<String, String>, tags: HashSet<String>) -> Self {
        Self::Html { value, extra, tags }
    }

    pub fn markdown(value: String, extra: HashMap<String, String>, tags: HashSet<String>) -> Self {
        Self::Markdown { value, extra, tags }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_extra(&self) -> &HashMap<String, String> {
        match self {
            Self::Html { extra, .. } => extra,
            Self::Markdown { extra, .. } => extra,
            Self::__Unknown(_) => panic!(
                "get_extra() called on __Unknown variant; inspect the raw JSON value directly"
            ),
        }
    }

    pub fn get_tags(&self) -> &HashSet<String> {
        match self {
            Self::Html { tags, .. } => tags,
            Self::Markdown { tags, .. } => tags,
            Self::__Unknown(_) => panic!(
                "get_tags() called on __Unknown variant; inspect the raw JSON value directly"
            ),
        }
    }
}
