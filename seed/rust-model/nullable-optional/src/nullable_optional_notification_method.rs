pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum NotificationMethod {
        #[serde(rename = "email")]
        #[non_exhaustive]
        Email {
            #[serde(rename = "emailAddress")]
            #[serde(default)]
            email_address: String,
            #[serde(default)]
            subject: String,
            #[serde(rename = "htmlContent")]
            #[serde(skip_serializing_if = "Option::is_none")]
            html_content: Option<String>,
        },

        #[serde(rename = "sms")]
        #[non_exhaustive]
        Sms {
            #[serde(rename = "phoneNumber")]
            #[serde(default)]
            phone_number: String,
            #[serde(default)]
            message: String,
            #[serde(rename = "shortCode")]
            #[serde(skip_serializing_if = "Option::is_none")]
            short_code: Option<String>,
        },

        #[serde(rename = "push")]
        #[non_exhaustive]
        Push {
            #[serde(rename = "deviceToken")]
            #[serde(default)]
            device_token: String,
            #[serde(default)]
            title: String,
            #[serde(default)]
            body: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            badge: Option<i64>,
        },
}

impl NotificationMethod {
    pub fn email(email_address: String, subject: String) -> Self {
        Self::Email { email_address, subject, html_content: None }
    }

    pub fn sms(phone_number: String, message: String) -> Self {
        Self::Sms { phone_number, message, short_code: None }
    }

    pub fn push(device_token: String, title: String, body: String) -> Self {
        Self::Push { device_token, title, body, badge: None }
    }

    pub fn email_with_html_content(email_address: String, subject: String, html_content: String) -> Self {
        Self::Email { email_address, subject, html_content: Some(html_content) }
    }

    pub fn sms_with_short_code(phone_number: String, message: String, short_code: String) -> Self {
        Self::Sms { phone_number, message, short_code: Some(short_code) }
    }

    pub fn push_with_badge(device_token: String, title: String, body: String, badge: i64) -> Self {
        Self::Push { device_token, title, body, badge: Some(badge) }
    }
}
