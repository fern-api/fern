use crate::memo::Memo;
use crate::resource_list::ResourceList;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BaseResource {
    pub id: String,
    pub related_resources: Vec<ResourceList>,
    pub memo: Memo,
}
