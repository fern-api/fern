
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
                    # @return [Seed::user::events::metadata::Metadata]
                    def get_metadata(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/users/events/metadata/"
                        )
                    end

            end
        end
    end
end
