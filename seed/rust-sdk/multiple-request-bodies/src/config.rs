use crate::Environment;
use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct ClientConfig {
    pub base_url: String,
    pub api_key: Option<String>,
    pub token: Option<String>,
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
            base_url: Environment::default().url().to_string(),
            api_key: None,
            token: None,
            username: None,
            password: None,
            timeout: Duration::from_secs(60),
            max_retries: 3,
            custom_headers: HashMap::new(),
            user_agent: "Api Rust SDK".to_string(),
        }
    }
}
