
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Union::MyUnion]
=======
            # @return [Seed::union::MyUnion]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Union::MyUnion]
>>>>>>> 51153df442 (fix)
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Hash[Seed::Union::Key, String]]
            def get_metadata(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Hash[Seed::union::Key, String]]
            def get_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/metadata"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Hash[Seed::Union::Key, String]]
            def get_metadata(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
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

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Union::UnionWithDuplicateTypes]
=======
            # @return [Seed::union::UnionWithDuplicateTypes]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Union::UnionWithDuplicateTypes]
>>>>>>> 51153df442 (fix)
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
