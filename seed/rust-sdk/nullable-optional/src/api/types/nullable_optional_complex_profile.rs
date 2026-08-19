pub use crate::prelude::*;

/// Test object with nullable enums, unions, and arrays
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ComplexProfile {
    #[serde(default)]
    pub id: String,
    #[serde(rename = "nullableRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_role: Option<UserRole>,
    #[serde(rename = "optionalRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_role: Option<UserRole>,
    #[serde(rename = "optionalNullableRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_role: Option<UserRole>,
    #[serde(rename = "nullableStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_status: Option<UserStatus>,
    #[serde(rename = "optionalStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_status: Option<UserStatus>,
    #[serde(rename = "optionalNullableStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_status: Option<UserStatus>,
    #[serde(rename = "nullableNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_notification: Option<NotificationMethod>,
    #[serde(rename = "optionalNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_notification: Option<NotificationMethod>,
    #[serde(rename = "optionalNullableNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_notification: Option<NotificationMethod>,
    #[serde(rename = "nullableSearchResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_search_result: Option<SearchResult>,
    #[serde(rename = "optionalSearchResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_search_result: Option<SearchResult>,
    #[serde(rename = "nullableArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_array: Option<Vec<String>>,
    #[serde(rename = "optionalArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_array: Option<Vec<String>>,
    #[serde(rename = "optionalNullableArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_array: Option<Vec<String>>,
    #[serde(rename = "nullableListOfNullables")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list_of_nullables: Option<Vec<Option<String>>>,
    #[serde(rename = "nullableMapOfNullables")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_map_of_nullables: Option<HashMap<String, Option<Address>>>,
    #[serde(rename = "nullableListOfUnions")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list_of_unions: Option<Vec<NotificationMethod>>,
    #[serde(rename = "optionalMapOfEnums")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_map_of_enums: Option<HashMap<String, UserRole>>,
}

impl ComplexProfile {
    pub fn builder() -> ComplexProfileBuilder {
        <ComplexProfileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ComplexProfileBuilder {
    id: Option<String>,
    nullable_role: Option<UserRole>,
    optional_role: Option<UserRole>,
    optional_nullable_role: Option<UserRole>,
    nullable_status: Option<UserStatus>,
    optional_status: Option<UserStatus>,
    optional_nullable_status: Option<UserStatus>,
    nullable_notification: Option<NotificationMethod>,
    optional_notification: Option<NotificationMethod>,
    optional_nullable_notification: Option<NotificationMethod>,
    nullable_search_result: Option<SearchResult>,
    optional_search_result: Option<SearchResult>,
    nullable_array: Option<Vec<String>>,
    optional_array: Option<Vec<String>>,
    optional_nullable_array: Option<Vec<String>>,
    nullable_list_of_nullables: Option<Vec<Option<String>>>,
    nullable_map_of_nullables: Option<HashMap<String, Option<Address>>>,
    nullable_list_of_unions: Option<Vec<NotificationMethod>>,
    optional_map_of_enums: Option<HashMap<String, UserRole>>,
}

impl ComplexProfileBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn nullable_role(mut self, value: UserRole) -> Self {
        self.nullable_role = Some(value);
        self
    }

    pub fn optional_role(mut self, value: UserRole) -> Self {
        self.optional_role = Some(value);
        self
    }

    pub fn optional_nullable_role(mut self, value: UserRole) -> Self {
        self.optional_nullable_role = Some(value);
        self
    }

    pub fn nullable_status(mut self, value: UserStatus) -> Self {
        self.nullable_status = Some(value);
        self
    }

    pub fn optional_status(mut self, value: UserStatus) -> Self {
        self.optional_status = Some(value);
        self
    }

    pub fn optional_nullable_status(mut self, value: UserStatus) -> Self {
        self.optional_nullable_status = Some(value);
        self
    }

    pub fn nullable_notification(mut self, value: NotificationMethod) -> Self {
        self.nullable_notification = Some(value);
        self
    }

    pub fn optional_notification(mut self, value: NotificationMethod) -> Self {
        self.optional_notification = Some(value);
        self
    }

    pub fn optional_nullable_notification(mut self, value: NotificationMethod) -> Self {
        self.optional_nullable_notification = Some(value);
        self
    }

    pub fn nullable_search_result(mut self, value: SearchResult) -> Self {
        self.nullable_search_result = Some(value);
        self
    }

    pub fn optional_search_result(mut self, value: SearchResult) -> Self {
        self.optional_search_result = Some(value);
        self
    }

    pub fn nullable_array(mut self, value: Vec<String>) -> Self {
        self.nullable_array = Some(value);
        self
    }

    pub fn optional_array(mut self, value: Vec<String>) -> Self {
        self.optional_array = Some(value);
        self
    }

    pub fn optional_nullable_array(mut self, value: Vec<String>) -> Self {
        self.optional_nullable_array = Some(value);
        self
    }

    pub fn nullable_list_of_nullables(mut self, value: Vec<Option<String>>) -> Self {
        self.nullable_list_of_nullables = Some(value);
        self
    }

    pub fn nullable_map_of_nullables(mut self, value: HashMap<String, Option<Address>>) -> Self {
        self.nullable_map_of_nullables = Some(value);
        self
    }

    pub fn nullable_list_of_unions(mut self, value: Vec<NotificationMethod>) -> Self {
        self.nullable_list_of_unions = Some(value);
        self
    }

    pub fn optional_map_of_enums(mut self, value: HashMap<String, UserRole>) -> Self {
        self.optional_map_of_enums = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ComplexProfile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ComplexProfileBuilder::id)
    pub fn build(self) -> Result<ComplexProfile, BuildError> {
        Ok(ComplexProfile {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            nullable_role: self.nullable_role,
            optional_role: self.optional_role,
            optional_nullable_role: self.optional_nullable_role,
            nullable_status: self.nullable_status,
            optional_status: self.optional_status,
            optional_nullable_status: self.optional_nullable_status,
            nullable_notification: self.nullable_notification,
            optional_notification: self.optional_notification,
            optional_nullable_notification: self.optional_nullable_notification,
            nullable_search_result: self.nullable_search_result,
            optional_search_result: self.optional_search_result,
            nullable_array: self.nullable_array,
            optional_array: self.optional_array,
            optional_nullable_array: self.optional_nullable_array,
            nullable_list_of_nullables: self.nullable_list_of_nullables,
            nullable_map_of_nullables: self.nullable_map_of_nullables,
            nullable_list_of_unions: self.nullable_list_of_unions,
            optional_map_of_enums: self.optional_map_of_enums,
        })
    }
}
