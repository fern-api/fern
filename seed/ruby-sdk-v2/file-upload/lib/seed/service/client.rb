
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
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

            # @return [untyped]
            def just_file(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/just-file"
                )
            end

            # @return [untyped]
            def just_file_with_query_params(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/just-file-with-query-params"
                )
            end

            # @return [untyped]
            def with_content_type(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/with-content-type"
                )
            end

            # @return [untyped]
            def with_form_encoding(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/with-form-encoding"
                )
            end

            # @return [untyped]
            def with_form_encoded_containers(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )
            end

            # @return [String]
            def optional_args(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/optional-args"
                )
            end

            # @return [String]
            def with_inline_type(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/inline-type"
                )
            end

            # @return [untyped]
            def simple(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/snippet"
                )
            end

    end
end
