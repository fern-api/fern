pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UpdateComplexProfileRequest {
    #[serde(rename = "nullableRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_role: Option<UserRole>,
    #[serde(rename = "nullableStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_status: Option<UserStatus>,
    #[serde(rename = "nullableNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_notification: Option<NotificationMethod>,
    #[serde(rename = "nullableSearchResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_search_result: Option<SearchResult>,
    #[serde(rename = "nullableArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_array: Option<Vec<String>>,
}

impl UpdateComplexProfileRequest {
    pub fn builder() -> UpdateComplexProfileRequestBuilder {
        <UpdateComplexProfileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateComplexProfileRequestBuilder {
    nullable_role: Option<UserRole>,
    nullable_status: Option<UserStatus>,
    nullable_notification: Option<NotificationMethod>,
    nullable_search_result: Option<SearchResult>,
    nullable_array: Option<Vec<String>>,
}

impl UpdateComplexProfileRequestBuilder {
    pub fn nullable_role(mut self, value: UserRole) -> Self {
        self.nullable_role = Some(value);
        self
    }

    pub fn nullable_status(mut self, value: UserStatus) -> Self {
        self.nullable_status = Some(value);
        self
    }

    pub fn nullable_notification(mut self, value: NotificationMethod) -> Self {
        self.nullable_notification = Some(value);
        self
    }

    pub fn nullable_search_result(mut self, value: SearchResult) -> Self {
        self.nullable_search_result = Some(value);
        self
    }

    pub fn nullable_array(mut self, value: Vec<String>) -> Self {
        self.nullable_array = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UpdateComplexProfileRequest`].
    pub fn build(self) -> Result<UpdateComplexProfileRequest, BuildError> {
        Ok(UpdateComplexProfileRequest {
            nullable_role: self.nullable_role,
            nullable_status: self.nullable_status,
            nullable_notification: self.nullable_notification,
            nullable_search_result: self.nullable_search_result,
            nullable_array: self.nullable_array,
        })
    }
}

