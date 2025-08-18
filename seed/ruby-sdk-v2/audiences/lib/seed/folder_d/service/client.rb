
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

                # @return [Seed::FolderD::Service::Response]
                def get_direct_thread(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::FolderD::Service::Types::Response.load(_response.body)

                    else
                        raise _response.body
                end

        end
    end
end
