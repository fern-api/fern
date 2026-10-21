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
require_relative "seed/endpoints/client"
require_relative "seed/endpoints/container/client"
require_relative "seed/endpoints/content_type/client"
require_relative "seed/endpoints/enum/client"
require_relative "seed/endpoints/http_methods/client"
require_relative "seed/endpoints/object/client"
require_relative "seed/endpoints/pagination/client"
require_relative "seed/endpoints/pagination/types/list_items_request"
require_relative "seed/endpoints/params/client"
require_relative "seed/endpoints/params/types/get_with_inline_path"
require_relative "seed/endpoints/params/types/get_with_query"
require_relative "seed/endpoints/params/types/get_with_multiple_query"
require_relative "seed/endpoints/params/types/get_with_path_and_query"
require_relative "seed/endpoints/params/types/get_with_inline_path_and_query"
require_relative "seed/endpoints/params/types/modify_resource_at_inlined_path"
require_relative "seed/endpoints/params/types/create_with_body_and_query"
require_relative "seed/endpoints/params/types/upload_bytes_with_query"
require_relative "seed/endpoints/primitive/client"
require_relative "seed/endpoints/put/client"
require_relative "seed/endpoints/put/types/put_request"
require_relative "seed/endpoints/union/client"
require_relative "seed/endpoints/urls/client"
require_relative "seed/inlined_requests/client"
require_relative "seed/inlined_requests/types/post_with_object_body"
require_relative "seed/inlined_requests/types/post_with_array_body_and_headers"
require_relative "seed/no_auth/client"
require_relative "seed/no_req_body/client"
require_relative "seed/req_with_headers/client"
require_relative "seed/req_with_headers/types/req_with_headers"

module Seed
  module Types
    module Object_
      module Types
        autoload :ObjectWithRequiredField, ::File.join(__dir__, "seed/types/object/types/object_with_required_field")
        autoload :ObjectWithOptionalField, ::File.join(__dir__, "seed/types/object/types/object_with_optional_field")
        autoload :ObjectWithMapOfMap, ::File.join(__dir__, "seed/types/object/types/object_with_map_of_map")
        autoload :NestedObjectWithOptionalField, ::File.join(__dir__, "seed/types/object/types/nested_object_with_optional_field")
        autoload :NestedObjectWithRequiredField, ::File.join(__dir__, "seed/types/object/types/nested_object_with_required_field")
        autoload :OptionalAlias, ::File.join(__dir__, "seed/types/object/types/optional_alias")
        autoload :DoubleOptional, ::File.join(__dir__, "seed/types/object/types/double_optional")
        autoload :ObjectWithDatetimeLikeString, ::File.join(__dir__, "seed/types/object/types/object_with_datetime_like_string")
        autoload :ObjectWithUnknownField, ::File.join(__dir__, "seed/types/object/types/object_with_unknown_field")
        autoload :DocumentedUnknownType, ::File.join(__dir__, "seed/types/object/types/documented_unknown_type")
        autoload :ObjectWithDocumentedUnknownType, ::File.join(__dir__, "seed/types/object/types/object_with_documented_unknown_type")
        autoload :MapOfDocumentedUnknownType, ::File.join(__dir__, "seed/types/object/types/map_of_documented_unknown_type")
        autoload :ObjectWithMixedRequiredAndOptionalFields, ::File.join(__dir__, "seed/types/object/types/object_with_mixed_required_and_optional_fields")
        autoload :ObjectWithRequiredNestedObject, ::File.join(__dir__, "seed/types/object/types/object_with_required_nested_object")
        autoload :ObjectWithInheritedRequiredEnum, ::File.join(__dir__, "seed/types/object/types/object_with_inherited_required_enum")
        autoload :ExtendedObjectWithInheritedEnum, ::File.join(__dir__, "seed/types/object/types/extended_object_with_inherited_enum")
        autoload :ObjectWithRequiredExtendedField, ::File.join(__dir__, "seed/types/object/types/object_with_required_extended_field")
      end
    end
  end
end

module Seed
  module Endpoints
    module Pagination
      module Types
        autoload :PaginatedResponse, ::File.join(__dir__, "seed/endpoints/pagination/types/paginated_response")
      end
    end
  end
end

module Seed
  module Endpoints
    module Put
      module Types
        autoload :ErrorCategory, ::File.join(__dir__, "seed/endpoints/put/types/error_category")
        autoload :ErrorCode, ::File.join(__dir__, "seed/endpoints/put/types/error_code")
        autoload :Error, ::File.join(__dir__, "seed/endpoints/put/types/error")
        autoload :PutResponse, ::File.join(__dir__, "seed/endpoints/put/types/put_response")
      end
    end
  end
end

module Seed
  module GeneralErrors
    module Types
      autoload :BadObjectRequestInfo, ::File.join(__dir__, "seed/general_errors/types/bad_object_request_info")
    end
  end
end

module Seed
  module Types
    module Docs
      module Types
        autoload :ObjectWithDocs, ::File.join(__dir__, "seed/types/docs/types/object_with_docs")
      end
    end
  end
end

module Seed
  module Types
    module Enum
      module Types
        autoload :WeatherReport, ::File.join(__dir__, "seed/types/enum/types/weather_report")
      end
    end
  end
end

module Seed
  module Types
    module Union
      module Types
        autoload :Dog, ::File.join(__dir__, "seed/types/union/types/dog")
        autoload :Cat, ::File.join(__dir__, "seed/types/union/types/cat")
        autoload :Animal, ::File.join(__dir__, "seed/types/union/types/animal")
        autoload :MixedType, ::File.join(__dir__, "seed/types/union/types/mixed_type")
      end
    end
  end
end
