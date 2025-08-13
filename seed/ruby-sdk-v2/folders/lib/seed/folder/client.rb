
module Seed
    module Folder
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Folder::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def foo(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

    end
end
