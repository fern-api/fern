
module Seed
    module Endpoints
        module Urls
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Urls::Client]
                def initialize(client)
                    @client = client
                end

                # @return [String]
                def with_mixed_case(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/urls/MixedCase"
                    )
                end

                # @return [String]
                def no_ending_slash(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/urls/no-ending-slash"
                    )
                end

                # @return [String]
                def with_ending_slash(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/urls/with-ending-slash/"
                    )
                end

                # @return [String]
                def with_underscores(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/urls/with_underscores"
                    )
                end

        end
    end
end
