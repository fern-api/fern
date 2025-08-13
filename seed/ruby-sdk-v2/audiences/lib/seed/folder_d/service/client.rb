
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

<<<<<<< HEAD
                # @return [Seed::FolderD::Service::Response]
                def get_direct_thread(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                # @return [Seed::folder_d::service::Response]
                def get_direct_thread(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/partner-path"
                    )
>>>>>>> ca21b06d09 (fix)
                end

        end
    end
end
