
module Seed
    module Completions
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Completions::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def stream(request_options: {}, **params)
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "stream"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
