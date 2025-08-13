
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def patch(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # Update with JSON merge patch - complex types.
            # This endpoint demonstrates the distinction between:
            # - optional<T> fields (can be present or absent, but not null)
            # - optional<nullable<T>> fields (can be present, absent, or null)
            #
            # @return [untyped]
            def patch_complex(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # Regular PATCH endpoint without merge-patch semantics
            #
            # @return [untyped]
            def regular_patch(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
