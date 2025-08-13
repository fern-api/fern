
module Seed
    module Folder
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Folder::Service::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def endpoint(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def unknown_request(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/service"
                    )
                end

        end
    end
end
