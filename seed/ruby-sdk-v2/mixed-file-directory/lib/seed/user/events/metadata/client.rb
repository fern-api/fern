
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
                        _request = params

                        _response = @client.send(_request)
                        if _response.code >= "200" && _response.code < "300"
                            return Seed::User::Events::Metadata::Types::Metadata.load(_response.body)

                        else
                            raise _response.body
                    end

            end
        end
    end
end
