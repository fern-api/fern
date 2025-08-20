# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

# Internal Types
<<<<<<< HEAD
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
require_relative "seed/service/types/my_object_with_optional"
require_relative "seed/service/types/my_object"
require_relative "seed/service/types/object_type"
require_relative "seed/service/types/my_inline_type"

# Client Types
require_relative "seed/client"
require_relative "seed/service/client"
require_relative "seed/service/types/my_request"
require_relative "seed/service/types/just_file_request"
require_relative "seed/service/types/just_file_with_query_params_request"
require_relative "seed/service/types/with_content_type_request"
require_relative "seed/service/types/with_form_encoding_request"
require_relative "seed/service/types/my_other_request"
require_relative "seed/service/types/optional_args_request"
require_relative "seed/service/types/inline_type_request"
=======
require_relative 'seed/internal/json/serializable'
require_relative 'seed/internal/types/type'
require_relative 'seed/internal/types/utils'
require_relative 'seed/internal/types/union'
require_relative 'seed/internal/errors/constraint_error'
require_relative 'seed/internal/errors/type_error'
require_relative 'seed/internal/http/base_request'
require_relative 'seed/internal/json/request'
require_relative 'seed/internal/http/raw_client'
require_relative 'seed/internal/multipart/multipart_encoder'
require_relative 'seed/internal/multipart/multipart_form_data_part'
require_relative 'seed/internal/multipart/multipart_form_data'
require_relative 'seed/internal/multipart/multipart_request'
require_relative 'seed/internal/types/model/field'
require_relative 'seed/internal/types/model'
require_relative 'seed/internal/types/array'
require_relative 'seed/internal/types/boolean'
require_relative 'seed/internal/types/enum'
require_relative 'seed/internal/types/hash'
require_relative 'seed/internal/types/unknown'

# API Types
require_relative 'seed/service/types/my_object_with_optional'
require_relative 'seed/service/types/my_object'
require_relative 'seed/service/types/object_type'
require_relative 'seed/service/types/my_inline_type'

# Client Types
require_relative 'seed/client'
require_relative 'seed/service/client'
require_relative 'seed/service/types/my_request'
require_relative 'seed/service/types/just_file_request'
require_relative 'seed/service/types/just_file_with_query_params_request'
require_relative 'seed/service/types/with_content_type_request'
require_relative 'seed/service/types/with_form_encoding_request'
require_relative 'seed/service/types/my_other_request'
require_relative 'seed/service/types/optional_args_request'
require_relative 'seed/service/types/inline_type_request'
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
