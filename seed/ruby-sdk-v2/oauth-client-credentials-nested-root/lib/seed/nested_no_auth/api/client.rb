
module Seed
    module NestedNoAuth
        module Api
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::NestedNoAuth::Api::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_something(request_options: {}, **params)
<<<<<<< HEAD
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/nested-no-auth/get-something"
                    )
>>>>>>> ca21b06d09 (fix)
                end

        end
    end
end
