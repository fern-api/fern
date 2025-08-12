
module Seed
    module InlinedRequest
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::InlinedRequest::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
