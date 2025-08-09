use crate::name::Name;
use chrono::{DateTime, NaiveDate, Utc};
use std::collections::HashMap;
use uuid::Uuid;
use serde_json::Value;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    pub one: i32,
    pub two: f64,
    pub three: String,
    pub four: bool,
    pub five: i64,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub six: chrono::DateTime<chrono::Utc>,
    pub seven: chrono::NaiveDate,
    pub eight: uuid::Uuid,
    pub nine: String,
    pub ten: Vec<i32>,
    pub eleven: std::collections::HashSet<f64>,
    pub twelve: HashMap<String, bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thirteen: Option<i64>,
    pub fourteen: serde_json::Value,
    pub fifteen: Vec<Vec<i32>>,
    pub sixteen: Vec<HashMap<String, i32>>,
    pub seventeen: Vec<Option<uuid::Uuid>>,
    pub eighteen: String,
    pub nineteen: Name,
    pub twenty: u32,
    pub twentyone: u64,
    pub twentytwo: f32,
    pub twentythree: num_bigint::BigInt,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub twentyfour: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub twentyfive: Option<chrono::NaiveDate>,
}