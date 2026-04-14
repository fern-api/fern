//! Request and response types for the server-sent-events-openapi
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 23 types for API operations
//! - **Model Types**: 16 types for data representation

pub mod stream_protocol_no_collision_response;
pub mod stream_protocol_collision_response;
pub mod stream_data_context_response;
pub mod stream_no_context_response;
pub mod stream_protocol_with_flat_schema_response;
pub mod stream_data_context_with_envelope_schema_response;
pub mod stream_x_fern_streaming_union_stream_request;
pub mod stream_x_fern_streaming_union_request;
pub mod validate_union_request_response;
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
pub mod completion_request;
pub mod nullable_stream_request;
pub mod completion_full_response_finish_reason;
pub mod completion_full_response;
pub mod completion_stream_chunk;
pub mod union_stream_request_base;
pub mod union_stream_message_variant;
pub mod union_stream_interrupt_variant;
pub mod union_stream_compact_variant;
pub mod union_stream_request;
pub mod stream_x_fern_streaming_condition_stream_request;
pub mod stream_x_fern_streaming_condition_request;
pub mod stream_x_fern_streaming_shared_schema_stream_request;
pub mod stream_x_fern_streaming_shared_schema_request;
pub mod shared_completion_request;
pub mod stream_x_fern_streaming_nullable_condition_stream_request;
pub mod stream_x_fern_streaming_nullable_condition_request;

pub use stream_protocol_no_collision_response::StreamProtocolNoCollisionResponse;
pub use stream_protocol_collision_response::StreamProtocolCollisionResponse;
pub use stream_data_context_response::StreamDataContextResponse;
pub use stream_no_context_response::StreamNoContextResponse;
pub use stream_protocol_with_flat_schema_response::StreamProtocolWithFlatSchemaResponse;
pub use stream_data_context_with_envelope_schema_response::StreamDataContextWithEnvelopeSchemaResponse;
pub use stream_x_fern_streaming_union_stream_request::StreamXFernStreamingUnionStreamRequest;
pub use stream_x_fern_streaming_union_request::StreamXFernStreamingUnionRequest;
pub use validate_union_request_response::ValidateUnionRequestResponse;
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
pub use completion_request::CompletionRequest;
pub use nullable_stream_request::NullableStreamRequest;
pub use completion_full_response_finish_reason::CompletionFullResponseFinishReason;
pub use completion_full_response::CompletionFullResponse;
pub use completion_stream_chunk::CompletionStreamChunk;
pub use union_stream_request_base::UnionStreamRequestBase;
pub use union_stream_message_variant::UnionStreamMessageVariant;
pub use union_stream_interrupt_variant::UnionStreamInterruptVariant;
pub use union_stream_compact_variant::UnionStreamCompactVariant;
pub use union_stream_request::UnionStreamRequest;
pub use stream_x_fern_streaming_condition_stream_request::StreamXFernStreamingConditionStreamRequest;
pub use stream_x_fern_streaming_condition_request::StreamXFernStreamingConditionRequest;
pub use stream_x_fern_streaming_shared_schema_stream_request::StreamXFernStreamingSharedSchemaStreamRequest;
pub use stream_x_fern_streaming_shared_schema_request::StreamXFernStreamingSharedSchemaRequest;
pub use shared_completion_request::SharedCompletionRequest;
pub use stream_x_fern_streaming_nullable_condition_stream_request::StreamXFernStreamingNullableConditionStreamRequest;
pub use stream_x_fern_streaming_nullable_condition_request::StreamXFernStreamingNullableConditionRequest;

