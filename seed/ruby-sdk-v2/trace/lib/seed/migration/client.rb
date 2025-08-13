
module Seed
    module Migration
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Migration::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Array[Seed::Migration::Migration]]
            def get_attempted_migrations(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Array[Seed::migration::Migration]]
            def get_attempted_migrations(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/migration-info/all"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Array[Seed::Migration::Migration]]
            def get_attempted_migrations(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
