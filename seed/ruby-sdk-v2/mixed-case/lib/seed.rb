# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

# Internal Types
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

# API Types
require_relative "seed/service/types/organization"
require_relative "seed/service/types/user"
require_relative "seed/service/types/nested_user"
require_relative "seed/service/types/resource_status"
require_relative "seed/service/types/resource"

# Client Types
require_relative "seed/client"
require_relative "seed/service/client"
require_relative "seed/service/types/list_resources_request"
