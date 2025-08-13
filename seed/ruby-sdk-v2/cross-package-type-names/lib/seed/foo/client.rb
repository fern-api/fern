
module Seed
    module Foo
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Foo::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
            # @return [Seed::Foo::ImportingType]
            def find(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::foo::ImportingType]
            def find(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
