
module Seed
    module File
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::File::Service::Client]
                def initialize(client)
                    @client = client
                end

                # This endpoint returns a file by its name.
                #
                # @return [Seed::Types::File]
                def get_file(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::Types::Types::File.load(_response.body)

                    else
                        raise _response.body
                end

        end
    end
end
