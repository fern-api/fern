use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsernameCursor {
    pub cursor: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsernamePage {
    pub after: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultipleFilterSearchRequest {
    pub operator: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MultipleFilterSearchRequestOperator {
    And,
    Or,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingleFilterSearchRequest {
    pub field: String, // TODO: Implement proper type
    pub operator: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SingleFilterSearchRequestOperator {
    Equals,
    NotEquals,
    In,
    NotIn,
    LessThan,
    GreaterThan,
    Contains,
    DoesNotContain,
    StartsWith,
    EndsWith,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchRequest {
    pub pagination: String, // TODO: Implement proper type
    pub query: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedConversationResponse {
    pub conversations: String, // TODO: Implement proper type
    pub pages: String, // TODO: Implement proper type
    pub total_count: String, // TODO: Implement proper type
    pub type_: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPages {
    pub next: String, // TODO: Implement proper type
    pub page: String, // TODO: Implement proper type
    pub per_page: String, // TODO: Implement proper type
    pub total_pages: String, // TODO: Implement proper type
    pub type_: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartingAfterPaging {
    pub per_page: String, // TODO: Implement proper type
    pub starting_after: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub foo: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Order {
    Asc,
    Desc,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithPage {
    pub page: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithCursor {
    pub cursor: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserListContainer {
    pub users: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPage {
    pub data: String, // TODO: Implement proper type
    pub next: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserOptionalListContainer {
    pub users: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserOptionalListPage {
    pub data: String, // TODO: Implement proper type
    pub next: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsernameContainer {
    pub results: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListUsersExtendedResponse {
    pub total_count: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListUsersExtendedOptionalListResponse {
    pub total_count: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListUsersPaginationResponse {
    pub has_next_page: String, // TODO: Implement proper type
    pub page: String, // TODO: Implement proper type
    pub total_count: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListUsersMixedTypePaginationResponse {
    pub next: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Page {
    pub page: String, // TODO: Implement proper type
    pub next: String, // TODO: Implement proper type
    pub per_page: String, // TODO: Implement proper type
    pub total_page: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NextPage {
    pub page: String, // TODO: Implement proper type
    pub starting_after: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub name: String, // TODO: Implement proper type
    pub id: String, // TODO: Implement proper type
}

