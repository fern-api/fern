
module Seed
    module Optional
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Optional::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def send_optional_body(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "send-optional-body"
                )

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
                end
            end
        end
    end
end
