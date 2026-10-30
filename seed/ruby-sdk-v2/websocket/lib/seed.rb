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
require_relative "seed/status/client"

module Seed
  module Realtime
    module Types
      autoload :SendEvent, ::File.join(__dir__, "seed/realtime/types/send_event")
      autoload :SendSnakeCase, ::File.join(__dir__, "seed/realtime/types/send_snake_case")
      autoload :ReceiveEvent, ::File.join(__dir__, "seed/realtime/types/receive_event")
      autoload :ReceiveSnakeCase, ::File.join(__dir__, "seed/realtime/types/receive_snake_case")
      autoload :SendEvent2, ::File.join(__dir__, "seed/realtime/types/send_event2")
      autoload :ReceiveEvent2, ::File.join(__dir__, "seed/realtime/types/receive_event2")
      autoload :ReceiveEvent3, ::File.join(__dir__, "seed/realtime/types/receive_event3")
      autoload :TranscriptEvent, ::File.join(__dir__, "seed/realtime/types/transcript_event")
      autoload :FlushedEvent, ::File.join(__dir__, "seed/realtime/types/flushed_event")
      autoload :ErrorEvent, ::File.join(__dir__, "seed/realtime/types/error_event")
    end
  end

  module Status
    module Types
      autoload :StatusResponse, ::File.join(__dir__, "seed/status/types/status_response")
    end
  end
end
