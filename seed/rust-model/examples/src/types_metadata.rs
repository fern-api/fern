use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Metadata {
        Html {
            value: String,
            extra: HashMap<String, String>,
            tags: std::collections::HashSet<String>,
        },

        Markdown {
            value: String,
            extra: HashMap<String, String>,
            tags: std::collections::HashSet<String>,
        },
}

impl Metadata {
    pub fn get_extra(&self) -> &HashMap<String, String> {
        match self {
                    Self::Html { extra, .. } => extra,
                    Self::Markdown { extra, .. } => extra,
                }
    }

    pub fn get_tags(&self) -> &std::collections::HashSet<String> {
        match self {
                    Self::Html { tags, .. } => tags,
                    Self::Markdown { tags, .. } => tags,
                }
    }

}
