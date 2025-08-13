
module Seed
    module Package
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Package::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def test(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
