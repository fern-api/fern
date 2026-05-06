pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BulkUpdateTasksRequest {
    #[serde(rename = "assigned_to")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bulk_update_tasks_request_assigned_to: Option<String>,
    #[serde(rename = "date")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bulk_update_tasks_request_date: Option<NaiveDate>,
    #[serde(rename = "is_complete")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bulk_update_tasks_request_is_complete: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing)]
    pub assigned_to: Option<String>,
    #[serde(skip_serializing)]
    pub is_complete: Option<String>,
    #[serde(skip_serializing)]
    pub date: Option<String>,
    /// Comma-separated list of fields to include in the response.
    #[serde(rename = "_fields")]
    #[serde(skip_serializing)]
    pub fields: Option<String>,
}

impl BulkUpdateTasksRequest {
    pub fn builder() -> BulkUpdateTasksRequestBuilder {
        <BulkUpdateTasksRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BulkUpdateTasksRequestBuilder {
    bulk_update_tasks_request_assigned_to: Option<String>,
    bulk_update_tasks_request_date: Option<NaiveDate>,
    bulk_update_tasks_request_is_complete: Option<bool>,
    text: Option<String>,
    assigned_to: Option<String>,
    is_complete: Option<String>,
    date: Option<String>,
    fields: Option<String>,
}

impl BulkUpdateTasksRequestBuilder {
    pub fn bulk_update_tasks_request_assigned_to(mut self, value: impl Into<String>) -> Self {
        self.bulk_update_tasks_request_assigned_to = Some(value.into());
        self
    }

    pub fn bulk_update_tasks_request_date(mut self, value: NaiveDate) -> Self {
        self.bulk_update_tasks_request_date = Some(value);
        self
    }

    pub fn bulk_update_tasks_request_is_complete(mut self, value: bool) -> Self {
        self.bulk_update_tasks_request_is_complete = Some(value);
        self
    }

    pub fn text(mut self, value: impl Into<String>) -> Self {
        self.text = Some(value.into());
        self
    }

    pub fn assigned_to(mut self, value: impl Into<String>) -> Self {
        self.assigned_to = Some(value.into());
        self
    }

    pub fn is_complete(mut self, value: impl Into<String>) -> Self {
        self.is_complete = Some(value.into());
        self
    }

    pub fn date(mut self, value: impl Into<String>) -> Self {
        self.date = Some(value.into());
        self
    }

    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BulkUpdateTasksRequest`].
    pub fn build(self) -> Result<BulkUpdateTasksRequest, BuildError> {
        Ok(BulkUpdateTasksRequest {
            bulk_update_tasks_request_assigned_to: self.bulk_update_tasks_request_assigned_to,
            bulk_update_tasks_request_date: self.bulk_update_tasks_request_date,
            bulk_update_tasks_request_is_complete: self.bulk_update_tasks_request_is_complete,
            text: self.text,
            assigned_to: self.assigned_to,
            is_complete: self.is_complete,
            date: self.date,
            fields: self.fields,
        })
    }
}
