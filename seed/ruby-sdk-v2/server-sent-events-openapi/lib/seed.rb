# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"
require "time"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"
require_relative "seed/types/stream_x_fern_streaming_condition_stream_request"
require_relative "seed/types/stream_x_fern_streaming_condition_request"
require_relative "seed/types/stream_x_fern_streaming_shared_schema_stream_request"
require_relative "seed/types/stream_x_fern_streaming_shared_schema_request"
require_relative "seed/types/shared_completion_request"
require_relative "seed/types/stream_x_fern_streaming_nullable_condition_stream_request"
require_relative "seed/types/stream_x_fern_streaming_nullable_condition_request"

module Seed
  module Types
    autoload :StatusPayload, ::File.join(__dir__, "seed/types/status_payload")
    autoload :ProtocolHeartbeat, ::File.join(__dir__, "seed/types/protocol_heartbeat")
    autoload :ProtocolStringEvent, ::File.join(__dir__, "seed/types/protocol_string_event")
    autoload :ProtocolNumberEvent, ::File.join(__dir__, "seed/types/protocol_number_event")
    autoload :ProtocolObjectEvent, ::File.join(__dir__, "seed/types/protocol_object_event")
    autoload :StreamProtocolNoCollisionResponse, ::File.join(__dir__, "seed/types/stream_protocol_no_collision_response")
    autoload :ObjectPayloadWithEventField, ::File.join(__dir__, "seed/types/object_payload_with_event_field")
    autoload :ProtocolCollisionObjectEvent, ::File.join(__dir__, "seed/types/protocol_collision_object_event")
    autoload :StreamProtocolCollisionResponse, ::File.join(__dir__, "seed/types/stream_protocol_collision_response")
    autoload :HeartbeatPayload, ::File.join(__dir__, "seed/types/heartbeat_payload")
    autoload :EntityEventPayloadEventType, ::File.join(__dir__, "seed/types/entity_event_payload_event_type")
    autoload :EntityEventPayload, ::File.join(__dir__, "seed/types/entity_event_payload")
    autoload :DataContextHeartbeat, ::File.join(__dir__, "seed/types/data_context_heartbeat")
    autoload :DataContextEntityEvent, ::File.join(__dir__, "seed/types/data_context_entity_event")
    autoload :StreamDataContextResponse, ::File.join(__dir__, "seed/types/stream_data_context_response")
    autoload :StreamNoContextResponse, ::File.join(__dir__, "seed/types/stream_no_context_response")
    autoload :StreamProtocolWithFlatSchemaResponse, ::File.join(__dir__, "seed/types/stream_protocol_with_flat_schema_response")
    autoload :StreamProtocolMixedSchemaResponse, ::File.join(__dir__, "seed/types/stream_protocol_mixed_schema_response")
    autoload :StreamDataContextWithEnvelopeSchemaResponse, ::File.join(__dir__, "seed/types/stream_data_context_with_envelope_schema_response")
    autoload :UnionStreamRequestBase, ::File.join(__dir__, "seed/types/union_stream_request_base")
    autoload :UnionStreamMessageVariant, ::File.join(__dir__, "seed/types/union_stream_message_variant")
    autoload :UnionStreamInterruptVariant, ::File.join(__dir__, "seed/types/union_stream_interrupt_variant")
    autoload :UnionStreamCompactVariant, ::File.join(__dir__, "seed/types/union_stream_compact_variant")
    autoload :StreamXFernStreamingUnionStreamRequest, ::File.join(__dir__, "seed/types/stream_x_fern_streaming_union_stream_request")
    autoload :StreamXFernStreamingUnionRequest, ::File.join(__dir__, "seed/types/stream_x_fern_streaming_union_request")
    autoload :ValidateUnionRequestResponse, ::File.join(__dir__, "seed/types/validate_union_request_response")
    autoload :StreamRequest, ::File.join(__dir__, "seed/types/stream_request")
    autoload :Event, ::File.join(__dir__, "seed/types/event")
    autoload :CompletionRequest, ::File.join(__dir__, "seed/types/completion_request")
    autoload :NullableStreamRequest, ::File.join(__dir__, "seed/types/nullable_stream_request")
    autoload :CompletionFullResponseFinishReason, ::File.join(__dir__, "seed/types/completion_full_response_finish_reason")
    autoload :CompletionFullResponse, ::File.join(__dir__, "seed/types/completion_full_response")
    autoload :CompletionStreamChunk, ::File.join(__dir__, "seed/types/completion_stream_chunk")
    autoload :UnionStreamRequest, ::File.join(__dir__, "seed/types/union_stream_request")
  end
end
