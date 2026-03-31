pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
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
    pub metadata: Option<Metadata2>,
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

impl BigEntity {
    pub fn builder() -> BigEntityBuilder {
        <BigEntityBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigEntityBuilder {
    cast_member: Option<CastMember>,
    extended_movie: Option<ExtendedMovie>,
    entity: Option<Entity>,
    metadata: Option<Metadata2>,
    common_metadata: Option<Metadata>,
    event_info: Option<EventInfo>,
    data: Option<Data>,
    migration: Option<Migration>,
    exception: Option<Exception>,
    test: Option<Test>,
    node: Option<Node>,
    directory: Option<Directory>,
    moment: Option<Moment>,
}

impl BigEntityBuilder {
    pub fn cast_member(mut self, value: CastMember) -> Self {
        self.cast_member = Some(value);
        self
    }

    pub fn extended_movie(mut self, value: ExtendedMovie) -> Self {
        self.extended_movie = Some(value);
        self
    }

    pub fn entity(mut self, value: Entity) -> Self {
        self.entity = Some(value);
        self
    }

    pub fn metadata(mut self, value: Metadata2) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn common_metadata(mut self, value: Metadata) -> Self {
        self.common_metadata = Some(value);
        self
    }

    pub fn event_info(mut self, value: EventInfo) -> Self {
        self.event_info = Some(value);
        self
    }

    pub fn data(mut self, value: Data) -> Self {
        self.data = Some(value);
        self
    }

    pub fn migration(mut self, value: Migration) -> Self {
        self.migration = Some(value);
        self
    }

    pub fn exception(mut self, value: Exception) -> Self {
        self.exception = Some(value);
        self
    }

    pub fn test(mut self, value: Test) -> Self {
        self.test = Some(value);
        self
    }

    pub fn node(mut self, value: Node) -> Self {
        self.node = Some(value);
        self
    }

    pub fn directory(mut self, value: Directory) -> Self {
        self.directory = Some(value);
        self
    }

    pub fn moment(mut self, value: Moment) -> Self {
        self.moment = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigEntity`].
    pub fn build(self) -> Result<BigEntity, BuildError> {
        Ok(BigEntity {
            cast_member: self.cast_member,
            extended_movie: self.extended_movie,
            entity: self.entity,
            metadata: self.metadata,
            common_metadata: self.common_metadata,
            event_info: self.event_info,
            data: self.data,
            migration: self.migration,
            exception: self.exception,
            test: self.test,
            node: self.node,
            directory: self.directory,
            moment: self.moment,
        })
    }
}
