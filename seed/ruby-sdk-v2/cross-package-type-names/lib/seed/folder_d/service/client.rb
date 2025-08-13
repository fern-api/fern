
module Seed
    module FolderD
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::FolderD::Service::Client]
                def initialize(client)
                    @client = client
                end

                # @return [Seed::folder_d::service::Response]
                def get_direct_thread
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
