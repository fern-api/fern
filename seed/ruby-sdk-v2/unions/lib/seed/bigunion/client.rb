
module Seed
    module Bigunion
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Bigunion::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Bigunion::BigUnion]
            def get
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::bigunion::BigUnion]
            def get(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/#{params[:id]}"
                )
>>>>>>> b7b4afb47e (fix(ruby): add basic endpoint implementation)
=======
            # @return [Seed::Bigunion::BigUnion]
            def get(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 591a1624b0 (fix)
            end

            # @return [bool]
            def update(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PATCH,
                    path: ""
                )
            end

            # @return [Hash[String, bool]]
            def update_many(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PATCH,
                    path: "/many"
                )
            end

    end
end
