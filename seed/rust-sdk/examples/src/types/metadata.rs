use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Metadata {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<HashMap<String, String>>,
    #[serde(rename = "jsonString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub json_string: Option<String>,
}ng, String>,
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
