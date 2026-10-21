# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

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
require_relative "seed/completions/client"
require_relative "seed/completions/types/stream_completion_request"
require_relative "seed/completions/types/stream_events_request"
require_relative "seed/completions/types/stream_events_discriminant_in_data_request"
require_relative "seed/completions/types/stream_events_context_protocol_request"

module Seed
  module Completions
    module Types
      autoload :StreamedCompletion, File.join(__dir__, "seed/completions/types/streamed_completion")
      autoload :CompletionEvent, File.join(__dir__, "seed/completions/types/completion_event")
      autoload :EventEvent, File.join(__dir__, "seed/completions/types/event_event")
      autoload :ErrorEvent, File.join(__dir__, "seed/completions/types/error_event")
      autoload :StreamEventContextProtocol, File.join(__dir__, "seed/completions/types/stream_event_context_protocol")
      autoload :GroupCreatedEvent, File.join(__dir__, "seed/completions/types/group_created_event")
      autoload :GroupDeletedEvent, File.join(__dir__, "seed/completions/types/group_deleted_event")
      autoload :StreamEventDiscriminantInData, File.join(__dir__, "seed/completions/types/stream_event_discriminant_in_data")
      autoload :StreamEvent, File.join(__dir__, "seed/completions/types/stream_event")
    end
  end
end
