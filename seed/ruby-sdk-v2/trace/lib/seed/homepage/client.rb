
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
                raise NotImplementedError, 'This method is not yet implemented.'
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
