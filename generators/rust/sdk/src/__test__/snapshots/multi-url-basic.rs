use serde::{Deserialize, Serialize};
use std::collections::{HashMap};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub auth: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub api: String,
    pub auth: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
    match self {
        Self::Production { urls } => urls.api,
        Self::Staging { urls } => urls.api,
    }
}
}
