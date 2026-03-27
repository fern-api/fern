//! Request and response types for the server-sent-events-openapi
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 7 types for API operations
//! - **Model Types**: 12 types for data representation

pub mod stream_protocol_no_collision_response;
pub mod stream_protocol_collision_response;
pub mod stream_data_context_response;
pub mod stream_no_context_response;
pub mod stream_protocol_with_flat_schema_response;
pub mod stream_data_context_with_envelope_schema_response;
pub mod stream_request;
pub mod event;
pub mod status_payload;
pub mod object_payload_with_event_field;
pub mod heartbeat_payload;
pub mod entity_event_payload_event_type;
pub mod entity_event_payload;
pub mod protocol_heartbeat;
pub mod protocol_string_event;
pub mod protocol_number_event;
pub mod protocol_object_event;
pub mod data_context_heartbeat;
pub mod data_context_entity_event;

pub use stream_protocol_no_collision_response::StreamProtocolNoCollisionResponse;
pub use stream_protocol_collision_response::StreamProtocolCollisionResponse;
pub use stream_data_context_response::StreamDataContextResponse;
pub use stream_no_context_response::StreamNoContextResponse;
pub use stream_protocol_with_flat_schema_response::StreamProtocolWithFlatSchemaResponse;
pub use stream_data_context_with_envelope_schema_response::StreamDataContextWithEnvelopeSchemaResponse;
pub use stream_request::StreamRequest;
pub use event::Event;
pub use status_payload::StatusPayload;
pub use object_payload_with_event_field::ObjectPayloadWithEventField;
pub use heartbeat_payload::HeartbeatPayload;
pub use entity_event_payload_event_type::EntityEventPayloadEventType;
pub use entity_event_payload::EntityEventPayload;
pub use protocol_heartbeat::ProtocolHeartbeat;
pub use protocol_string_event::ProtocolStringEvent;
pub use protocol_number_event::ProtocolNumberEvent;
pub use protocol_object_event::ProtocolObjectEvent;
pub use data_context_heartbeat::DataContextHeartbeat;
pub use data_context_entity_event::DataContextEntityEvent;

