
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Union::Shape]
            def get(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def update(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PATCH,
                    path: ""
                )
            end

    end
end
