
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
            def list_with_cursor_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersMixedTypePaginationResponse]
            def list_with_mixed_type_cursor_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_body_cursor_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_offset_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_double_offset_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_body_offset_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_offset_step_pagination
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersPaginationResponse]
            def list_with_offset_pagination_has_next_page
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersExtendedResponse]
            def list_with_extended_results
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::ListUsersExtendedOptionalListResponse]
            def list_with_extended_results_and_optional_data
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::UsernameCursor]
            def list_usernames
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::users::UsernameContainer]
            def list_with_global_config
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
