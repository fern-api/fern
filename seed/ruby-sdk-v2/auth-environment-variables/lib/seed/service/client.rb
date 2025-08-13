
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
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "apiKey"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # GET request with custom api key
            #
            # @return [String]
            def get_with_header(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "apiKeyInHeader"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
