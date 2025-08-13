
module Seed
    module QueryParam
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::QueryParam::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "query"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def send_list(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "query-list"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
