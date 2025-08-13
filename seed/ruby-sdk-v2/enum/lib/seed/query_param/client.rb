
module Seed
    module QueryParam
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::QueryParam::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def send_list(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
