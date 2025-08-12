
module Seed
    module User
        module Events
            module Metadata
                class Client
                    # @option client [Seed::Internal::Http::RawClient]
                    #
                    # @return [Seed::User::Events::Metadata::Client]
                    def initialize(client)
                        @client = client
                    end

                    # @return [Seed::user::events::metadata::Metadata]
                    def get_metadata
                        raise NotImplementedError, 'This method is not yet implemented.'
                    end
                end
            end
        end
    end
end
