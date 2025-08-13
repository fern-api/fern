
module Seed
    module Dummy
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Dummy::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def get_dummy(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "dummy"
                )
            end

    end
end
