use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Metadata {
    Html {
        value: String,
        extra: HashMap<String, String>,
        tags: HashSet<String>,
    },

    Markdown {
        value: String,
        extra: HashMap<String, String>,
        tags: HashSet<String>,
    },
}

impl Metadata {
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
