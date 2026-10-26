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
require_relative "seed/nullable_optional/client"
require_relative "seed/nullable_optional/types/list_users_request"
require_relative "seed/nullable_optional/types/search_users_request"
require_relative "seed/nullable_optional/types/update_complex_profile_request"
require_relative "seed/nullable_optional/types/filter_by_role_request"
require_relative "seed/nullable_optional/types/update_tags_request"
require_relative "seed/nullable_optional/types/search_request"

module Seed
  module NullableOptional
    module Types
      autoload :NullableUserID, ::File.join(__dir__, "seed/nullable_optional/types/nullable_user_id")
      autoload :OptionalUserID, ::File.join(__dir__, "seed/nullable_optional/types/optional_user_id")
      autoload :Address, ::File.join(__dir__, "seed/nullable_optional/types/address")
      autoload :UserProfile, ::File.join(__dir__, "seed/nullable_optional/types/user_profile")
      autoload :CreateUserRequest, ::File.join(__dir__, "seed/nullable_optional/types/create_user_request")
      autoload :UpdateUserRequest, ::File.join(__dir__, "seed/nullable_optional/types/update_user_request")
      autoload :UserRole, ::File.join(__dir__, "seed/nullable_optional/types/user_role")
      autoload :UserStatus, ::File.join(__dir__, "seed/nullable_optional/types/user_status")
      autoload :EmailNotification, ::File.join(__dir__, "seed/nullable_optional/types/email_notification")
      autoload :SmsNotification, ::File.join(__dir__, "seed/nullable_optional/types/sms_notification")
      autoload :PushNotification, ::File.join(__dir__, "seed/nullable_optional/types/push_notification")
      autoload :NotificationMethod, ::File.join(__dir__, "seed/nullable_optional/types/notification_method")
      autoload :Organization, ::File.join(__dir__, "seed/nullable_optional/types/organization")
      autoload :Document, ::File.join(__dir__, "seed/nullable_optional/types/document")
      autoload :UserResponse, ::File.join(__dir__, "seed/nullable_optional/types/user_response")
      autoload :SearchResult, ::File.join(__dir__, "seed/nullable_optional/types/search_result")
      autoload :ComplexProfile, ::File.join(__dir__, "seed/nullable_optional/types/complex_profile")
      autoload :DeserializationTestRequest, ::File.join(__dir__, "seed/nullable_optional/types/deserialization_test_request")
      autoload :DeserializationTestResponse, ::File.join(__dir__, "seed/nullable_optional/types/deserialization_test_response")
    end
  end
end
