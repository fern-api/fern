
module Seed
    module Migration
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Migration::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Seed::migration::Migration]]
            def get_attempted_migrations
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
