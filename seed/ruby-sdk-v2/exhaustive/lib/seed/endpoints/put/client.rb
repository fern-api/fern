
module Seed
    module Endpoints
        module Put
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Put::Client]
                def initialize(client)
                    @client = client
                end

                # @return [Seed::Endpoints::Put::PutResponse]
                def add(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
