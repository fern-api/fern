
module Seed
    module Users
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Users::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_cursor_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersMixedTypePaginationResponse]
            def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_body_cursor_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_double_offset_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_body_offset_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_step_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_pagination_has_next_page(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersExtendedResponse]
            def list_with_extended_results(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersExtendedOptionalListResponse]
            def list_with_extended_results_and_optional_data(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::users::ListUsersPaginationResponse]
=======
            # @return [Seed::Users::ListUsersPaginationResponse]
>>>>>>> 51153df442 (fix)
            def list_with_cursor_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersMixedTypePaginationResponse]
            def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_body_cursor_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_double_offset_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_body_offset_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_step_pagination(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_pagination_has_next_page(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersExtendedResponse]
            def list_with_extended_results(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::ListUsersExtendedOptionalListResponse]
            def list_with_extended_results_and_optional_data(request_options: {}, **params)
<<<<<<< HEAD
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # @return [Seed::UsernameCursor]
            def list_usernames(request_options: {}, **params)
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Users::UsernameContainer]
            def list_with_global_config(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # @return [Seed::Users::UsernameContainer]
            def list_with_global_config(request_options: {}, **params)
<<<<<<< HEAD
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/users"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
