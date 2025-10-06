pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesBigEntity {
    #[serde(rename = "castMember")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cast_member: Option<TypesCastMember>,
    #[serde(rename = "extendedMovie")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extended_movie: Option<TypesExtendedMovie>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity: Option<TypesEntity>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<TypesMetadata>,
    #[serde(rename = "commonMetadata")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub common_metadata: Option<CommonsTypesMetadata>,
    #[serde(rename = "eventInfo")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_info: Option<CommonsTypesEventInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<CommonsTypesData>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub migration: Option<TypesMigration>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<TypesException>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test: Option<TypesTest>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub node: Option<TypesNode>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directory: Option<TypesDirectory>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub moment: Option<TypesMoment>,
}