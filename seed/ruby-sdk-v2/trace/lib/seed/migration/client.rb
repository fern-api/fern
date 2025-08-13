
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
            def get_attempted_migrations(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/migration-info/all"
                )
            end

    end
end
