
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

                # @return [Array[Seed::user::events::Event]]
                def list_events
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
