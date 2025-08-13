
module Seed
    module PathParam
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::PathParam::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def send(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "path/#{params[:operand]}/#{params[:operandOrColor]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
