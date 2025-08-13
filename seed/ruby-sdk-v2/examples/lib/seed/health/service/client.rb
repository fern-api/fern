
module Seed
    module Health
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Health::Service::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def check
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [bool]
                def ping
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
