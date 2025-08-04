use crate::username_page::UsernamePage;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UsernameCursor {
    pub cursor: UsernamePage,
}