pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Metadata {
        #[serde(rename = "html")]
        #[non_exhaustive]
        Html {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
            extra: HashMap<String, String>,
            tags: Vec<String>,
        },

        #[serde(rename = "markdown")]
        #[non_exhaustive]
        Markdown {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
            extra: HashMap<String, String>,
            tags: Vec<String>,
        },
}

impl Metadata {
    pub fn html(extra: HashMap<String, String>, tags: Vec<String>) -> Self {
        Self::Html { value: None, extra, tags }
    }

    pub fn markdown(extra: HashMap<String, String>, tags: Vec<String>) -> Self {
        Self::Markdown { value: None, extra, tags }
    }

    pub fn html_with_value(value: String, extra: HashMap<String, String>, tags: Vec<String>) -> Self {
        Self::Html { value: Some(value), extra, tags }
    }

    pub fn markdown_with_value(value: String, extra: HashMap<String, String>, tags: Vec<String>) -> Self {
        Self::Markdown { value: Some(value), extra, tags }
    }

    pub fn get_extra(&self) -> &HashMap<String, String> {
        match self {
                    Self::Html { extra, .. } => extra,
                    Self::Markdown { extra, .. } => extra,
                }
    }

    pub fn get_tags(&self) -> &Vec<String> {
        match self {
                    Self::Html { tags, .. } => tags,
                    Self::Markdown { tags, .. } => tags,
                }
    }
}
