
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
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

        end
    end
end
