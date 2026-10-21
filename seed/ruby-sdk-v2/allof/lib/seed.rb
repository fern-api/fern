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
require_relative "seed/types/search_rule_types_request"
require_relative "seed/types/rule_create_request"
require_relative "seed/types/plant_post"
require_relative "seed/environment"

module Seed
  module Types
    autoload :RuleCreateRequestExecutionContext, ::File.join(__dir__, "seed/types/rule_create_request_execution_context")
    autoload :PlantBaseWateringFrequency, ::File.join(__dir__, "seed/types/plant_base_watering_frequency")
    autoload :PlantPostSunExposure, ::File.join(__dir__, "seed/types/plant_post_sun_exposure")
    autoload :PagingCursors, ::File.join(__dir__, "seed/types/paging_cursors")
    autoload :PaginatedResult, ::File.join(__dir__, "seed/types/paginated_result")
    autoload :RuleExecutionContext, ::File.join(__dir__, "seed/types/rule_execution_context")
    autoload :AuditInfo, ::File.join(__dir__, "seed/types/audit_info")
    autoload :RuleType, ::File.join(__dir__, "seed/types/rule_type")
    autoload :RuleTypeSearchResponse, ::File.join(__dir__, "seed/types/rule_type_search_response")
    autoload :User, ::File.join(__dir__, "seed/types/user")
    autoload :UserSearchResponse, ::File.join(__dir__, "seed/types/user_search_response")
    autoload :RuleResponseStatus, ::File.join(__dir__, "seed/types/rule_response_status")
    autoload :RuleResponse, ::File.join(__dir__, "seed/types/rule_response")
    autoload :Identifiable, ::File.join(__dir__, "seed/types/identifiable")
    autoload :Describable, ::File.join(__dir__, "seed/types/describable")
    autoload :CombinedEntityStatus, ::File.join(__dir__, "seed/types/combined_entity_status")
    autoload :CombinedEntity, ::File.join(__dir__, "seed/types/combined_entity")
    autoload :BaseOrgMetadata, ::File.join(__dir__, "seed/types/base_org_metadata")
    autoload :BaseOrg, ::File.join(__dir__, "seed/types/base_org")
    autoload :DetailedOrgMetadata, ::File.join(__dir__, "seed/types/detailed_org_metadata")
    autoload :DetailedOrg, ::File.join(__dir__, "seed/types/detailed_org")
    autoload :Organization, ::File.join(__dir__, "seed/types/organization")
    autoload :PlantStrict, ::File.join(__dir__, "seed/types/plant_strict")
    autoload :PlantBase, ::File.join(__dir__, "seed/types/plant_base")
    autoload :TreeIdentifiable, ::File.join(__dir__, "seed/types/tree_identifiable")
    autoload :TreeDescribable, ::File.join(__dir__, "seed/types/tree_describable")
    autoload :TreeBase, ::File.join(__dir__, "seed/types/tree_base")
    autoload :TreeRecord, ::File.join(__dir__, "seed/types/tree_record")
  end
end
