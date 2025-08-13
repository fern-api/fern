
module Seed
    module Nested
        module Api
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Nested::Api::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_something
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
