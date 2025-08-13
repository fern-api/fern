
module Seed
    module Users
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Users::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_cursor_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersMixedTypePaginationResponse]
            def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_body_cursor_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_offset_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_double_offset_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_body_offset_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_offset_step_pagination(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_offset_pagination_has_next_page(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersExtendedResponse]
            def list_with_extended_results(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::ListUsersExtendedOptionalListResponse]
            def list_with_extended_results_and_optional_data(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::UsernameCursor]
            def list_usernames(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

            # @return [Seed::users::UsernameContainer]
            def list_with_global_config(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
            end

    end
end
