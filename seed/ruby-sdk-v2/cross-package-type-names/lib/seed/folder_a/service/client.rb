
module Seed
    module FolderA
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::FolderA::Service::Client]
                def initialize(client)
                    @client = client
                end

                # @return [Seed::folder_a::service::Response]
                def get_direct_thread
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
