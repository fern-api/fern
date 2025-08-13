
module Seed
    module Reference
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Reference::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "reference"
                )
            end

    end
end
