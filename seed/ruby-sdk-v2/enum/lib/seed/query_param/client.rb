
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
            def send
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def send_list
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
