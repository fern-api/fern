pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
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
}

impl Metadata2 {
    pub fn html(value: String, extra: HashMap<String, String>, tags: HashSet<String>) -> Self {
        Self::Html { value, extra, tags }
    }

    pub fn markdown(value: String, extra: HashMap<String, String>, tags: HashSet<String>) -> Self {
        Self::Markdown { value, extra, tags }
    }

    pub fn get_extra(&self) -> &HashMap<String, String> {
        match self {
                    Self::Html { extra, .. } => extra,
                    Self::Markdown { extra, .. } => extra,
                }
    }

    pub fn get_tags(&self) -> &HashSet<String> {
        match self {
                    Self::Html { tags, .. } => tags,
                    Self::Markdown { tags, .. } => tags,
                }
    }
}
