
module Seed
    module Complex
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Complex::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::complex::PaginatedConversationResponse]
            def search(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "#{params[:index]}/conversations/search"
                )
            end

    end
end
