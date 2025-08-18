
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
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
