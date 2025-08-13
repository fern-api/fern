
module Seed
    module Payment
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Payment::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def create(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/payment"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def delete(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/payment/#{params[:paymentId]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
