
module Seed
    module User
        module Events
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::User::Events::Client]
                def initialize(client)
                    @client = client
                end

                # List all user events.
                #
<<<<<<< HEAD
                # @return [Array[Seed::User::Events::Event]]
                def list_events(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                # @return [Array[Seed::user::events::Event]]
                def list_events(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/users/events/"
                    )
>>>>>>> ca21b06d09 (fix)
                end

        end
    end
end
