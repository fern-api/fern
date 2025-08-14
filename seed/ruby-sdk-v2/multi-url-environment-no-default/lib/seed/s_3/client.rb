
module Seed
    module S3
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::S3::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def get_presigned_url(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
