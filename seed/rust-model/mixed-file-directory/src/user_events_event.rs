pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserEventsEvent {
    pub id: Id,
    pub name: String,
}