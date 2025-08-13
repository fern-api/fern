
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
                # @return [Array[Seed::User::Events::Event]]
                def list_events(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
