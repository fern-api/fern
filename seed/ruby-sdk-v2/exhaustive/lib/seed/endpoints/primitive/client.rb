
module Seed
    module Endpoints
        module Primitive
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Primitive::Client]
                def initialize(client)
                    @client = client
                end

                # @return [String]
                def get_and_return_string(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/string"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [Integer]
                def get_and_return_int(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/integer"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [Integer]
                def get_and_return_long(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/long"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [Integer]
                def get_and_return_double(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/double"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [bool]
                def get_and_return_bool(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/boolean"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [String]
                def get_and_return_datetime(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/datetime"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [String]
                def get_and_return_date(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/date"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [String]
                def get_and_return_uuid(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/uuid"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [String]
                def get_and_return_base_64(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/primitive/base64"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

        end
    end
end
