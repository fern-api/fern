
module Seed
    module Migration
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Migration::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Seed::Migration::Migration]]
            def get_attempted_migrations(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
