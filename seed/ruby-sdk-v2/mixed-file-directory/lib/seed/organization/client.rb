
module Seed
    module Organization
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Organization::Client]
            def initialize(client)
                @client = client
            end

            # Create a new organization.
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Organization::Organization]
=======
            # @return [Seed::organization::Organization]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Organization::Organization]
>>>>>>> 51153df442 (fix)
            def create(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/organizations/"
                )
            end

    end
end
