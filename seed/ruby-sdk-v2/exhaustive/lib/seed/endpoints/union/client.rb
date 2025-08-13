
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

                # @return [Seed::Types::Union::Animal]
                def get_and_return_union(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/union"
                    )
                end

        end
    end
end
