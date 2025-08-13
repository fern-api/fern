
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
<<<<<<< HEAD
<<<<<<< HEAD
                    # @return [Seed::User::Events::Metadata::Metadata]
                    def get_metadata(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
=======
                    # @return [Seed::user::events::metadata::Metadata]
                    def get_metadata(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/users/events/metadata/"
                        )
>>>>>>> ca21b06d09 (fix)
=======
                    # @return [Seed::User::Events::Metadata::Metadata]
                    def get_metadata(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
                    end

            end
        end
    end
end
