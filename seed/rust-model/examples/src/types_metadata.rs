pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Metadata2 {
        #[serde(rename = "html")]
        Html {
            value: String,
            extra: HashMap<String, String>,
            tags: HashSet<String>,
        },

        #[serde(rename = "markdown")]
        Markdown {
            value: String,
            extra: HashMap<String, String>,
            tags: HashSet<String>,
        },
}

impl Metadata2 {
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
