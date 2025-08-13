
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

                # This endpoint checks the health of a resource.
                #
                # @return [untyped]
                def check(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/check/#{params[:id]}"
                    )
                end

                # This endpoint checks the health of the service.
                #
                # @return [bool]
                def ping(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/ping"
                    )
                end

        end
    end
end
