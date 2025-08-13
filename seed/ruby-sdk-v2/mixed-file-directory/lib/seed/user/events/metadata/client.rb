
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

                    # Get event metadata.
                    #
                    # @return [Seed::User::Events::Metadata::Metadata]
                    def get_metadata(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
                    end

            end
        end
    end
end
