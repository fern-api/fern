
module Seed
    module Homepage
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Homepage::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[String]]
            def get_homepage_problems(request_options: {}, **params)
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/homepage-problems"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # @return [untyped]
            def set_homepage_problems(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/homepage-problems"
                )
            end

    end
end
