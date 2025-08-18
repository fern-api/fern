
module Seed
    module Users
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Users::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_cursor_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersMixedTypePaginationResponse]
            def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersMixedTypePaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_body_cursor_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_double_offset_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_body_offset_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_step_pagination(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersPaginationResponse]
            def list_with_offset_pagination_has_next_page(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersExtendedResponse]
            def list_with_extended_results(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersExtendedResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::ListUsersExtendedOptionalListResponse]
            def list_with_extended_results_and_optional_data(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::ListUsersExtendedOptionalListResponse.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::UsernameCursor]
            def list_usernames(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::UsernameCursor.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Users::UsernameContainer]
            def list_with_global_config(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Users::Types::UsernameContainer.load(_response.body)

                else
                    raise _response.body
            end

    end
end
