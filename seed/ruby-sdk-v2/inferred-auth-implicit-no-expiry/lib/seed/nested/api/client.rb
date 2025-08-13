
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
<<<<<<< HEAD
<<<<<<< HEAD
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/nested/get-something"
                    )
>>>>>>> ca21b06d09 (fix)
=======
                    raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
                end

        end
    end
end
