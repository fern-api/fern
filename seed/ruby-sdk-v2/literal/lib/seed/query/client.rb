
module Seed
    module Query
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Query::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
