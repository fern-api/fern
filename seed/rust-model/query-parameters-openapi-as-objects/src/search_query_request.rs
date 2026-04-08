pub use crate::prelude::*;

/// Query parameters for search
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchQueryRequest {
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub date: NaiveDate,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub deadline: DateTime<FixedOffset>,
    #[serde(default)]
    pub bytes: String,
    #[serde(default)]
    pub user: User,
    #[serde(rename = "userList")]
    #[serde(default)]
    pub user_list: Vec<Option<User>>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_deadline: Option<DateTime<FixedOffset>>,
    #[serde(rename = "keyValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key_value: Option<HashMap<String, String>>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nested_user: Option<NestedUser>,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<User>,
    #[serde(rename = "excludeUser")]
    #[serde(default)]
    pub exclude_user: Vec<Option<User>>,
    #[serde(default)]
    pub filter: Vec<Option<String>>,
    /// List of tags. Serialized as a comma-separated list.
    #[serde(default)]
    pub tags: Vec<Option<String>>,
    /// Optional list of tags. Serialized as a comma-separated list.
    #[serde(rename = "optionalTags")]
    #[serde(default)]
    pub optional_tags: Vec<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub neighbor: Option<SearchRequestNeighbor>,
    #[serde(rename = "neighborRequired")]
    pub neighbor_required: SearchRequestNeighborRequired,
}

impl SearchQueryRequest {
    pub fn builder() -> SearchQueryRequestBuilder {
        <SearchQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchQueryRequestBuilder {
    limit: Option<i64>,
    id: Option<String>,
    date: Option<NaiveDate>,
    deadline: Option<DateTime<FixedOffset>>,
    bytes: Option<String>,
    user: Option<User>,
    user_list: Option<Vec<Option<User>>>,
    optional_deadline: Option<DateTime<FixedOffset>>,
    key_value: Option<HashMap<String, String>>,
    optional_string: Option<String>,
    nested_user: Option<NestedUser>,
    optional_user: Option<User>,
    exclude_user: Option<Vec<Option<User>>>,
    filter: Option<Vec<Option<String>>>,
    tags: Option<Vec<Option<String>>>,
    optional_tags: Option<Vec<Option<String>>>,
    neighbor: Option<SearchRequestNeighbor>,
    neighbor_required: Option<SearchRequestNeighborRequired>,
}

impl SearchQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn date(mut self, value: NaiveDate) -> Self {
        self.date = Some(value);
        self
    }

    pub fn deadline(mut self, value: DateTime<FixedOffset>) -> Self {
        self.deadline = Some(value);
        self
    }

    pub fn bytes(mut self, value: impl Into<String>) -> Self {
        self.bytes = Some(value.into());
        self
    }

    pub fn user(mut self, value: User) -> Self {
        self.user = Some(value);
        self
    }

    pub fn user_list(mut self, value: Vec<Option<User>>) -> Self {
        self.user_list = Some(value);
        self
    }

    pub fn optional_deadline(mut self, value: DateTime<FixedOffset>) -> Self {
        self.optional_deadline = Some(value);
        self
    }

    pub fn key_value(mut self, value: HashMap<String, String>) -> Self {
        self.key_value = Some(value);
        self
    }

    pub fn optional_string(mut self, value: impl Into<String>) -> Self {
        self.optional_string = Some(value.into());
        self
    }

    pub fn nested_user(mut self, value: NestedUser) -> Self {
        self.nested_user = Some(value);
        self
    }

    pub fn optional_user(mut self, value: User) -> Self {
        self.optional_user = Some(value);
        self
    }

    pub fn exclude_user(mut self, value: Vec<Option<User>>) -> Self {
        self.exclude_user = Some(value);
        self
    }

    pub fn filter(mut self, value: Vec<Option<String>>) -> Self {
        self.filter = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<Option<String>>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn optional_tags(mut self, value: Vec<Option<String>>) -> Self {
        self.optional_tags = Some(value);
        self
    }

    pub fn neighbor(mut self, value: SearchRequestNeighbor) -> Self {
        self.neighbor = Some(value);
        self
    }

    pub fn neighbor_required(mut self, value: SearchRequestNeighborRequired) -> Self {
        self.neighbor_required = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`limit`](SearchQueryRequestBuilder::limit)
    /// - [`id`](SearchQueryRequestBuilder::id)
    /// - [`date`](SearchQueryRequestBuilder::date)
    /// - [`deadline`](SearchQueryRequestBuilder::deadline)
    /// - [`bytes`](SearchQueryRequestBuilder::bytes)
    /// - [`user`](SearchQueryRequestBuilder::user)
    /// - [`user_list`](SearchQueryRequestBuilder::user_list)
    /// - [`exclude_user`](SearchQueryRequestBuilder::exclude_user)
    /// - [`filter`](SearchQueryRequestBuilder::filter)
    /// - [`tags`](SearchQueryRequestBuilder::tags)
    /// - [`optional_tags`](SearchQueryRequestBuilder::optional_tags)
    /// - [`neighbor_required`](SearchQueryRequestBuilder::neighbor_required)
    pub fn build(self) -> Result<SearchQueryRequest, BuildError> {
        Ok(SearchQueryRequest {
            limit: self.limit.ok_or_else(|| BuildError::missing_field("limit"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            date: self.date.ok_or_else(|| BuildError::missing_field("date"))?,
            deadline: self.deadline.ok_or_else(|| BuildError::missing_field("deadline"))?,
            bytes: self.bytes.ok_or_else(|| BuildError::missing_field("bytes"))?,
            user: self.user.ok_or_else(|| BuildError::missing_field("user"))?,
            user_list: self.user_list.ok_or_else(|| BuildError::missing_field("user_list"))?,
            optional_deadline: self.optional_deadline,
            key_value: self.key_value,
            optional_string: self.optional_string,
            nested_user: self.nested_user,
            optional_user: self.optional_user,
            exclude_user: self.exclude_user.ok_or_else(|| BuildError::missing_field("exclude_user"))?,
            filter: self.filter.ok_or_else(|| BuildError::missing_field("filter"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
            optional_tags: self.optional_tags.ok_or_else(|| BuildError::missing_field("optional_tags"))?,
            neighbor: self.neighbor,
            neighbor_required: self.neighbor_required.ok_or_else(|| BuildError::missing_field("neighbor_required"))?,
        })
    }
}

