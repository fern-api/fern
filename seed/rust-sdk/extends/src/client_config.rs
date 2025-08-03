use std::collections::{HashMap};
use std::time::{Duration};

#[derive(Debug, Clone)]
pub struct ClientConfig {
    pub base_url: String,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub timeout: Duration,
    pub max_retries: u32,
    pub custom_headers: HashMap<String, String>,
    pub user_agent: String,
}
impl Default for ClientConfig {
    fn default() -> Self {
    Self {
        base_url: String::new(),
        api_key: None,
        bearer_token: None,
        username: None,
        password: None,
        timeout: Duration::from_secs(60),
        max_retries: 3,
        custom_headers: HashMap::new(),
        user_agent: "Extends Rust SDK".to_string()
    }
}
}
