
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
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return

                    else
                        raise _response.body
                end

                # @return [untyped]
                def unknown_request(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/service"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return

                    else
                        raise _response.body
                end

        end
    end
end
