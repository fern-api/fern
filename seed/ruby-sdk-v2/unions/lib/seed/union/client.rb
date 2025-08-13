
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Union::Shape]
            def get
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::union::Shape]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:id]}"
                )
>>>>>>> b7b4afb47e (fix(ruby): add basic endpoint implementation)
=======
            # @return [Seed::Union::Shape]
            def get(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 591a1624b0 (fix)
=======
            # @return [Seed::Union::Shape]
            def get(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::union::Shape]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:id]}"
                )
>>>>>>> b7b4afb47e (fix(ruby): add basic endpoint implementation)
>>>>>>> 84556af643 (fix)
            end

            # @return [bool]
            def update(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PATCH,
                    path: ""
                )
            end

    end
end
