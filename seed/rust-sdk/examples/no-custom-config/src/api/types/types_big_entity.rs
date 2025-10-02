use crate::commons_types_data::Data;
use crate::commons_types_event_info::EventInfo;
use crate::commons_types_metadata::Metadata;
use crate::types_cast_member::CastMember;
use crate::types_directory::Directory;
use crate::types_entity::Entity;
use crate::types_exception::Exception;
use crate::types_extended_movie::ExtendedMovie;
use crate::types_migration::Migration;
use crate::types_moment::Moment;
use crate::types_node::Node;
use crate::types_test::Test;
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
