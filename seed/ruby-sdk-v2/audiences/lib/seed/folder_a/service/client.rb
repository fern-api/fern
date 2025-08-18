
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

                # @return [Seed::FolderA::Service::Response]
                def get_direct_thread(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::FolderA::Service::Types::Response.load(_response.body)

                    else
                        raise _response.body
                end

        end
    end
end
