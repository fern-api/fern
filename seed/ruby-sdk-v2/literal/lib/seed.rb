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
require_relative "seed/headers/client"
require_relative "seed/headers/types/send_literals_in_headers_request"
require_relative "seed/inlined/client"
require_relative "seed/inlined/types/send_literals_inlined_request"
require_relative "seed/path/client"
require_relative "seed/query/client"
require_relative "seed/query/types/send_literals_in_query_request"
require_relative "seed/reference/client"

module Seed
  module Types
    autoload :SendResponse, ::File.join(__dir__, "seed/types/send_response")
  end
end

module Seed
  module Inlined
    module Types
      autoload :SomeAliasedLiteral, ::File.join(__dir__, "seed/inlined/types/some_aliased_literal")
      autoload :ANestedLiteral, ::File.join(__dir__, "seed/inlined/types/a_nested_literal")
      autoload :ATopLevelLiteral, ::File.join(__dir__, "seed/inlined/types/a_top_level_literal")
      autoload :DiscriminatedLiteral, ::File.join(__dir__, "seed/inlined/types/discriminated_literal")
      autoload :UndiscriminatedLiteral, ::File.join(__dir__, "seed/inlined/types/undiscriminated_literal")
    end
  end
end

module Seed
  module Query
    module Types
      autoload :AliasToPrompt, ::File.join(__dir__, "seed/query/types/alias_to_prompt")
      autoload :AliasToStream, ::File.join(__dir__, "seed/query/types/alias_to_stream")
    end
  end
end

module Seed
  module Reference
    module Types
      autoload :NestedObjectWithLiterals, ::File.join(__dir__, "seed/reference/types/nested_object_with_literals")
      autoload :ContainerObject, ::File.join(__dir__, "seed/reference/types/container_object")
      autoload :SomeLiteral, ::File.join(__dir__, "seed/reference/types/some_literal")
      autoload :SendRequest, ::File.join(__dir__, "seed/reference/types/send_request")
    end
  end
end
