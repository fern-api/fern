
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Union::MyUnion]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Union::Types::MyUnion.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Hash[Seed::Union::Key, String]]
            def get_metadata(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Union::Types::Metadata.load(_response.body)

                else
                    raise _response.body
            end

            # @return [bool]
            def update_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PUT,
                    path: "/metadata"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # @return [bool]
            def call(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/call"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # @return [Seed::Union::UnionWithDuplicateTypes]
            def duplicate_types_union(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/duplicate"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Union::Types::UnionWithDuplicateTypes.load(_response.body)

                else
                    raise _response.body
            end

            # @return [String]
            def nested_unions(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/nested"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
