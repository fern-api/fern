
module Seed
    module A
        module B
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::A::B::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def foo(request_options: {}, **params)
<<<<<<< HEAD
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: ""
                    )
>>>>>>> ca21b06d09 (fix)
                end

        end
    end
end
