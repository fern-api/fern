
module Seed
    module Complex
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Complex::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Complex::PaginatedConversationResponse]
            def search(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "#{params[:index]}/conversations/search"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Complex::Types::PaginatedConversationResponse.load(_response.body)

                else
                    raise _response.body
            end

    end
end
