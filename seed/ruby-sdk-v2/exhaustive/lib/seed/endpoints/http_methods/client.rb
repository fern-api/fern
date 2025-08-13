
module Seed
    module Endpoints
        module HttpMethods
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::HttpMethods::Client]
                def initialize(client)
                    @client = client
                end

                # @return [String]
                def test_get(request_options: {}, **params)
<<<<<<< HEAD
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::Types::Object_::ObjectWithOptionalField]
=======
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/http-methods/#{params[:id]}"
                    )
                end

                # @return [Seed::types::object::ObjectWithOptionalField]
>>>>>>> ca21b06d09 (fix)
                def test_post(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/http-methods"
                    )
                end

<<<<<<< HEAD
                # @return [Seed::Types::Object_::ObjectWithOptionalField]
=======
                # @return [Seed::types::object::ObjectWithOptionalField]
>>>>>>> ca21b06d09 (fix)
                def test_put(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PUT,
                        path: "/http-methods/#{params[:id]}"
                    )
                end

<<<<<<< HEAD
                # @return [Seed::Types::Object_::ObjectWithOptionalField]
=======
                # @return [Seed::types::object::ObjectWithOptionalField]
>>>>>>> ca21b06d09 (fix)
                def test_patch(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PATCH,
                        path: "/http-methods/#{params[:id]}"
                    )
                end

                # @return [bool]
                def test_delete(request_options: {}, **params)
<<<<<<< HEAD
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: DELETE,
                        path: "/http-methods/#{params[:id]}"
                    )
>>>>>>> ca21b06d09 (fix)
                end

        end
    end
end
