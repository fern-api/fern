use thiserror::{Error};

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("PropertyBasedErrorTest: Bad request - {{message}}")]
    PropertyBasedErrorTest { message: String, field: Option<String>, details: Option<String> },
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    #[error("Network error: {0}")]
    Network(reqwest::Error),
    #[error("Serialization error: {0}")]
    Serialization(serde_json::Error),
}
impl ApiError {
    pub fn from_response(status_code: u16, body: Option<&str>) -> Self {
    match status_code {
        400 => {
            // Parse error body for PropertyBasedErrorTest;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::PropertyBasedErrorTest {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::PropertyBasedErrorTest {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        _ => Self::Http {
            status: status_code,
            message: body.unwrap_or("Unknown error").to_string()
        },
    }
}
}