
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # GET request with custom api key
            #
            # @return [String]
            def get_with_api_key(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "apiKey"
                )
            end

            # GET request with custom api key
            #
            # @return [String]
            def get_with_header(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "apiKeyInHeader"
                )
            end

    end
end
