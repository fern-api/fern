
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
                def get_direct_thread(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: ""
                    )
                end

        end
    end
end
