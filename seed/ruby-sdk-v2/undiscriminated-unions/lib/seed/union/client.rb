
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::union::MyUnion]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

            # @return [Hash[Seed::union::Key, String]]
            def get_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/metadata"
                )
            end

            # @return [bool]
            def update_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PUT,
                    path: "/metadata"
                )
            end

            # @return [bool]
            def call(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/call"
                )
            end

            # @return [Seed::union::UnionWithDuplicateTypes]
            def duplicate_types_union(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/duplicate"
                )
            end

            # @return [String]
            def nested_unions(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/nested"
                )
            end

    end
end
