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
require_relative "seed/complex/client"
require_relative "seed/inline_users/client"
require_relative "seed/inline_users/inline_users/client"
require_relative "seed/inline_users/inline_users/types/list_users_cursor_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_users_mixed_type_cursor_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_users_body_cursor_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_users_offset_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_users_double_offset_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_users_body_offset_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_users_offset_step_pagination_request"
require_relative "seed/inline_users/inline_users/types/list_with_offset_pagination_has_next_page_request"
require_relative "seed/inline_users/inline_users/types/list_users_extended_request"
require_relative "seed/inline_users/inline_users/types/list_users_extended_request_for_optional_data"
require_relative "seed/inline_users/inline_users/types/list_usernames_request"
require_relative "seed/inline_users/inline_users/types/list_with_global_config_request"
require_relative "seed/users/client"
require_relative "seed/users/types/list_users_cursor_pagination_request"
require_relative "seed/users/types/list_users_mixed_type_cursor_pagination_request"
require_relative "seed/users/types/list_users_body_cursor_pagination_request"
require_relative "seed/users/types/list_users_top_level_body_cursor_pagination_request"
require_relative "seed/users/types/list_users_offset_pagination_request"
require_relative "seed/users/types/list_users_double_offset_pagination_request"
require_relative "seed/users/types/list_users_body_offset_pagination_request"
require_relative "seed/users/types/list_users_offset_step_pagination_request"
require_relative "seed/users/types/list_with_offset_pagination_has_next_page_request"
require_relative "seed/users/types/list_users_extended_request"
require_relative "seed/users/types/list_users_extended_request_for_optional_data"
require_relative "seed/users/types/list_usernames_request"
require_relative "seed/users/types/list_usernames_with_optional_response_request"
require_relative "seed/users/types/list_with_global_config_request"
require_relative "seed/users/types/list_users_optional_data_request"
require_relative "seed/users/types/list_users_aliased_data_request"

module Seed
  module Types
    autoload :UsernamePage, ::File.join(__dir__, "seed/types/username_page")
    autoload :UsernameCursor, ::File.join(__dir__, "seed/types/username_cursor")
  end
end

module Seed
  module Complex
    module Types
      autoload :MultipleFilterSearchRequestOperator, ::File.join(__dir__, "seed/complex/types/multiple_filter_search_request_operator")
      autoload :SingleFilterSearchRequestOperator, ::File.join(__dir__, "seed/complex/types/single_filter_search_request_operator")
      autoload :SingleFilterSearchRequest, ::File.join(__dir__, "seed/complex/types/single_filter_search_request")
      autoload :MultipleFilterSearchRequestValue, ::File.join(__dir__, "seed/complex/types/multiple_filter_search_request_value")
      autoload :MultipleFilterSearchRequest, ::File.join(__dir__, "seed/complex/types/multiple_filter_search_request")
      autoload :SearchRequestQuery, ::File.join(__dir__, "seed/complex/types/search_request_query")
      autoload :StartingAfterPaging, ::File.join(__dir__, "seed/complex/types/starting_after_paging")
      autoload :SearchRequest, ::File.join(__dir__, "seed/complex/types/search_request")
      autoload :CursorPages, ::File.join(__dir__, "seed/complex/types/cursor_pages")
      autoload :Conversation, ::File.join(__dir__, "seed/complex/types/conversation")
      autoload :PaginatedConversationResponse, ::File.join(__dir__, "seed/complex/types/paginated_conversation_response")
    end
  end
end

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        autoload :Order, ::File.join(__dir__, "seed/inline_users/inline_users/types/order")
        autoload :WithPage, ::File.join(__dir__, "seed/inline_users/inline_users/types/with_page")
        autoload :WithCursor, ::File.join(__dir__, "seed/inline_users/inline_users/types/with_cursor")
        autoload :User, ::File.join(__dir__, "seed/inline_users/inline_users/types/user")
        autoload :UserListContainer, ::File.join(__dir__, "seed/inline_users/inline_users/types/user_list_container")
        autoload :UserPage, ::File.join(__dir__, "seed/inline_users/inline_users/types/user_page")
        autoload :UserOptionalListContainer, ::File.join(__dir__, "seed/inline_users/inline_users/types/user_optional_list_container")
        autoload :UserOptionalListPage, ::File.join(__dir__, "seed/inline_users/inline_users/types/user_optional_list_page")
        autoload :UsernameContainer, ::File.join(__dir__, "seed/inline_users/inline_users/types/username_container")
        autoload :ListUsersExtendedResponse, ::File.join(__dir__, "seed/inline_users/inline_users/types/list_users_extended_response")
        autoload :ListUsersExtendedOptionalListResponse, ::File.join(__dir__, "seed/inline_users/inline_users/types/list_users_extended_optional_list_response")
        autoload :NextPage, ::File.join(__dir__, "seed/inline_users/inline_users/types/next_page")
        autoload :Page, ::File.join(__dir__, "seed/inline_users/inline_users/types/page")
        autoload :Users, ::File.join(__dir__, "seed/inline_users/inline_users/types/users")
        autoload :ListUsersPaginationResponse, ::File.join(__dir__, "seed/inline_users/inline_users/types/list_users_pagination_response")
        autoload :ListUsersMixedTypePaginationResponse, ::File.join(__dir__, "seed/inline_users/inline_users/types/list_users_mixed_type_pagination_response")
      end
    end
  end
end

module Seed
  module Users
    module Types
      autoload :Order, ::File.join(__dir__, "seed/users/types/order")
      autoload :WithPage, ::File.join(__dir__, "seed/users/types/with_page")
      autoload :WithCursor, ::File.join(__dir__, "seed/users/types/with_cursor")
      autoload :User, ::File.join(__dir__, "seed/users/types/user")
      autoload :UserListContainer, ::File.join(__dir__, "seed/users/types/user_list_container")
      autoload :UserPage, ::File.join(__dir__, "seed/users/types/user_page")
      autoload :UserOptionalListContainer, ::File.join(__dir__, "seed/users/types/user_optional_list_container")
      autoload :UserOptionalListPage, ::File.join(__dir__, "seed/users/types/user_optional_list_page")
      autoload :UsernameContainer, ::File.join(__dir__, "seed/users/types/username_container")
      autoload :ListUsersExtendedResponse, ::File.join(__dir__, "seed/users/types/list_users_extended_response")
      autoload :ListUsersExtendedOptionalListResponse, ::File.join(__dir__, "seed/users/types/list_users_extended_optional_list_response")
      autoload :NextPage, ::File.join(__dir__, "seed/users/types/next_page")
      autoload :Page, ::File.join(__dir__, "seed/users/types/page")
      autoload :ListUsersPaginationResponse, ::File.join(__dir__, "seed/users/types/list_users_pagination_response")
      autoload :ListUsersOptionalDataPaginationResponse, ::File.join(__dir__, "seed/users/types/list_users_optional_data_pagination_response")
      autoload :ListUsersMixedTypePaginationResponse, ::File.join(__dir__, "seed/users/types/list_users_mixed_type_pagination_response")
      autoload :ListUsersTopLevelCursorPaginationResponse, ::File.join(__dir__, "seed/users/types/list_users_top_level_cursor_pagination_response")
      autoload :UserList, ::File.join(__dir__, "seed/users/types/user_list")
      autoload :ListUsersAliasedDataPaginationResponse, ::File.join(__dir__, "seed/users/types/list_users_aliased_data_pagination_response")
    end
  end
end
