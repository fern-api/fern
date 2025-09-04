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
require_relative "seed/user/types/user"
require_relative "seed/organization/types/organization"
require_relative "seed/organization/types/create_organization_request"
require_relative "seed/user/events/types/event"
require_relative "seed/user/events/metadata/types/metadata"

# Client Types
require_relative "seed/client"
require_relative "seed/organization/client"
require_relative "seed/user/client"
require_relative "seed/user/types/list_users_request"
require_relative "seed/user/events/client"
require_relative "seed/user/events/types/list_user_events_request"
require_relative "seed/user/events/metadata/client"
require_relative "seed/user/events/metadata/types/get_event_metadata_request"
