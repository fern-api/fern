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
require_relative "seed/service/client"

module Seed
  module Types
    autoload :StringResponse, ::File.join(__dir__, "seed/types/string_response")
    autoload :OptionalStringResponse, ::File.join(__dir__, "seed/types/optional_string_response")
    autoload :WithMetadata, ::File.join(__dir__, "seed/types/with_metadata")
  end
end

module Seed
  module Service
    module Types
      autoload :WithDocs, ::File.join(__dir__, "seed/service/types/with_docs")
      autoload :OptionalWithDocs, ::File.join(__dir__, "seed/service/types/optional_with_docs")
      autoload :Movie, ::File.join(__dir__, "seed/service/types/movie")
      autoload :Response, ::File.join(__dir__, "seed/service/types/response")
    end
  end
end
