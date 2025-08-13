
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
                def get_something(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/nested/get-something"
                    )
                end

        end
    end
end
