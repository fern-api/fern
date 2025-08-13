
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
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
