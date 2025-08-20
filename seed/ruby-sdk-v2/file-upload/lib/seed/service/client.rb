# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def post(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is not a file, maybe_string
        hi this is not a file, integer
        hi this is a file, file
        hi this is a file, file_list
        hi this is a file, maybe_file
        hi this is a file, maybe_file_list
        hi this is not a file, maybe_integer
        hi this is not a file, optional_list_of_strings
        hi this is not a file, list_of_objects
        hi this is not a file, optional_metadata
        hi this is not a file, optional_object_type
        hi this is not a file, optional_id
        hi this is not a file, alias_object
        hi this is not a file, list_of_alias_object
        hi this is not a file, alias_list_of_object

        _request = Deep.new(
          method: POST,
          path: "",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [untyped]
      def just_file(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file

        _request = Deep.new(
          method: POST,
          path: "/just-file",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [untyped]
      def just_file_with_query_params(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file

        _request = Deep.new(
          method: POST,
          path: "/just-file-with-query-params",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [untyped]
      def with_content_type(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file
        hi this is not a file, foo
        hi this is not a file, bar
        hi this is not a file, foo_bar

        _request = Deep.new(
          method: POST,
          path: "/with-content-type",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [untyped]
      def with_form_encoding(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file
        hi this is not a file, foo
        hi this is not a file, bar

        _request = Deep.new(
          method: POST,
          path: "/with-form-encoding",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [untyped]
      def with_form_encoded_containers(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is not a file, maybe_string
        hi this is not a file, integer
        hi this is a file, file
        hi this is a file, file_list
        hi this is a file, maybe_file
        hi this is a file, maybe_file_list
        hi this is not a file, maybe_integer
        hi this is not a file, optional_list_of_strings
        hi this is not a file, list_of_objects
        hi this is not a file, optional_metadata
        hi this is not a file, optional_object_type
        hi this is not a file, optional_id
        hi this is not a file, list_of_objects_with_optionals
        hi this is not a file, alias_object
        hi this is not a file, list_of_alias_object
        hi this is not a file, alias_list_of_object

        _request = Deep.new(
          method: POST,
          path: "",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [String]
      def optional_args(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, image_file
        hi this is not a file, request

        _request = Deep.new(
          method: POST,
          path: "/optional-args",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [String]
      def with_inline_type(request_options: {}, **params)
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file
        hi this is not a file, request

        _request = Deep.new(
          method: POST,
          path: "/inline-type",
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end

      # @return [untyped]
      def simple(request_options: {}, **params)
        _request = params
        _response = @client.send(_request)
<<<<<<< HEAD
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
=======
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
    end
  end
end
