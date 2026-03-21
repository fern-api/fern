pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EmailNotification {
    #[serde(rename = "emailAddress")]
    #[serde(default)]
    pub email_address: String,
    #[serde(default)]
    pub subject: String,
    #[serde(rename = "htmlContent")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub html_content: Option<String>,
}

impl EmailNotification {
    pub fn builder() -> EmailNotificationBuilder {
        EmailNotificationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EmailNotificationBuilder {
    email_address: Option<String>,
    subject: Option<String>,
    html_content: Option<String>,
}

impl EmailNotificationBuilder {
    pub fn email_address(mut self, value: impl Into<String>) -> Self {
        self.email_address = Some(value.into());
        self
    }

    pub fn subject(mut self, value: impl Into<String>) -> Self {
        self.subject = Some(value.into());
        self
    }

    pub fn html_content(mut self, value: impl Into<String>) -> Self {
        self.html_content = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`EmailNotification`].
    /// This method will fail if any of the following fields are not set:
    /// - [`email_address`](EmailNotificationBuilder::email_address)
    /// - [`subject`](EmailNotificationBuilder::subject)
    pub fn build(self) -> Result<EmailNotification, BuildError> {
        Ok(EmailNotification {
            email_address: self
                .email_address
                .ok_or_else(|| BuildError::missing_field("email_address"))?,
            subject: self
                .subject
                .ok_or_else(|| BuildError::missing_field("subject"))?,
            html_content: self.html_content,
        })
    }
}
