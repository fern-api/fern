use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::movie_id::MovieId;
use crate::tag::Tag;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Movie {
    pub id: MovieId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prequel: Option<MovieId>,
    pub title: String,
    pub from: String,
    pub rating: f64,
    #[serde(rename = "type")]
    pub type_: String,
    pub tag: Tag,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub book: Option<String>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub revenue: i64,
}