
module Seed
    module Ec2
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Ec2::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def boot_instance(request_options: {}, **params)
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/ec2/boot"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
