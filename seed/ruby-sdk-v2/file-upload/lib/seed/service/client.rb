
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def post(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def just_file(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/just-file"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def just_file_with_query_params(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/just-file-with-query-params"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def with_content_type(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/with-content-type"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def with_form_encoding(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/with-form-encoding"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def with_form_encoded_containers(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [String]
            def optional_args(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/optional-args"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [String]
            def with_inline_type(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/inline-type"
                )
>>>>>>> ca21b06d09 (fix)
            end

            # @return [untyped]
            def simple(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/snippet"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
