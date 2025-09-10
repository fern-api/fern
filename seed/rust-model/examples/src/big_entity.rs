use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BigEntity {
    #[serde(rename = "castMember")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cast_member: Option<CastMember>,
    #[serde(rename = "extendedMovie")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extended_movie: Option<ExtendedMovie>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity: Option<Entity>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,
    #[serde(rename = "commonMetadata")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub common_metadata: Option<Metadata>,
    #[serde(rename = "eventInfo")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_info: Option<EventInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Data>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub migration: Option<Migration>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<Exception>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test: Option<Test>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub node: Option<Node>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directory: Option<Directory>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub moment: Option<Moment>,
}