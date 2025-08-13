
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
                def endpoint
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def unknown_request
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
