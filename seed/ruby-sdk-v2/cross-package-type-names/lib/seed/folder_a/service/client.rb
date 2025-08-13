
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

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::FolderA::Service::Response]
                def get_direct_thread(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                # @return [Seed::folder_a::service::Response]
                def get_direct_thread(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: ""
                    )
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::FolderA::Service::Response]
                def get_direct_thread(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
                end

        end
    end
end
