
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
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # Update with JSON merge patch - complex types.
            # This endpoint demonstrates the distinction between:
            # - optional<T> fields (can be present or absent, but not null)
            # - optional<nullable<T>> fields (can be present, absent, or null)
            #
            # @return [untyped]
            def patch_complex(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # Regular PATCH endpoint without merge-patch semantics
            #
            # @return [untyped]
            def regular_patch(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end
        end
    end
end
