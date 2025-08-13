
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
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/s3/presigned-url"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
