
module Seed
    module Endpoints
        module Union
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Union::Client]
                def initialize(client)
                    @client = client
                end

<<<<<<< HEAD
                # @return [Seed::Types::Union::Animal]
=======
                # @return [Seed::types::union::Animal]
>>>>>>> ca21b06d09 (fix)
                def get_and_return_union(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/union"
                    )
                end

        end
    end
end
