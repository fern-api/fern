
module Seed
    module Complex
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Complex::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Complex::PaginatedConversationResponse]
=======
            # @return [Seed::complex::PaginatedConversationResponse]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Complex::PaginatedConversationResponse]
>>>>>>> 51153df442 (fix)
            def search(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "#{params[:index]}/conversations/search"
                )
            end

    end
end
