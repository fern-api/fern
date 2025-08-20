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
=======
        body = Internal::Multipart::FormData.new
        
        if params[:maybe_string]
          body.add_part(params[:maybe_string].to_form_data_part(name: "maybe_string"))
        end
        if params[:integer]
          body.add_part(params[:integer].to_form_data_part(name: "integer"))
        end
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:file_list]
          body.add(Internal::Multipart::FilePart.new(:file_list, File.new(params[:file_list]), "application/octet-stream"))
        end
        if params[:maybe_file]
          body.add(Internal::Multipart::FilePart.new(:maybe_file, File.new(params[:maybe_file]), "application/octet-stream"))
        end
        if params[:maybe_file_list]
          body.add(Internal::Multipart::FilePart.new(:maybe_file_list, File.new(params[:maybe_file_list]), "application/octet-stream"))
        end
        if params[:maybe_integer]
          body.add_part(params[:maybe_integer].to_form_data_part(name: "maybe_integer"))
        end
        if params[:optional_list_of_strings]
          body.add_part(params[:optional_list_of_strings].to_form_data_part(name: "optional_list_of_strings"))
        end
        if params[:list_of_objects]
          body.add_part(params[:list_of_objects].to_form_data_part(name: "list_of_objects"))
        end
        if params[:optional_metadata]
          body.add_part(params[:optional_metadata].to_form_data_part(name: "optional_metadata"))
        end
        if params[:optional_object_type]
          body.add_part(params[:optional_object_type].to_form_data_part(name: "optional_object_type"))
        end
        if params[:optional_id]
          body.add_part(params[:optional_id].to_form_data_part(name: "optional_id"))
        end
        if params[:alias_object]
          body.add_part(params[:alias_object].to_form_data_part(name: "alias_object"))
        end
        if params[:list_of_alias_object]
          body.add_part(params[:list_of_alias_object].to_form_data_part(name: "list_of_alias_object"))
        end
        if params[:alias_list_of_object]
          body.add_part(params[:alias_list_of_object].to_form_data_part(name: "alias_list_of_object"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "",
          body: body,
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
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file

        _request = Deep.new(
=======
        body = Internal::Multipart::FormData.new
        
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "/just-file",
          body: body,
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
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file

        _request = Deep.new(
=======
        body = Internal::Multipart::FormData.new
        
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "/just-file-with-query-params",
          body: body,
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
=======
        body = Internal::Multipart::FormData.new
        
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:foo]
          body.add_part(params[:foo].to_form_data_part(name: "foo"))
        end
        if params[:bar]
          body.add_part(params[:bar].to_form_data_part(name: "bar"))
        end
        if params[:foo_bar]
          body.add_part(params[:foo_bar].to_form_data_part(name: "foo_bar"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "/with-content-type",
          body: body,
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
=======
        body = Internal::Multipart::FormData.new
        
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:foo]
          body.add_part(params[:foo].to_form_data_part(name: "foo"))
        end
        if params[:bar]
          body.add_part(params[:bar].to_form_data_part(name: "bar"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "/with-form-encoding",
          body: body,
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
=======
        body = Internal::Multipart::FormData.new
        
        if params[:maybe_string]
          body.add_part(params[:maybe_string].to_form_data_part(name: "maybe_string"))
        end
        if params[:integer]
          body.add_part(params[:integer].to_form_data_part(name: "integer"))
        end
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:file_list]
          body.add(Internal::Multipart::FilePart.new(:file_list, File.new(params[:file_list]), "application/octet-stream"))
        end
        if params[:maybe_file]
          body.add(Internal::Multipart::FilePart.new(:maybe_file, File.new(params[:maybe_file]), "application/octet-stream"))
        end
        if params[:maybe_file_list]
          body.add(Internal::Multipart::FilePart.new(:maybe_file_list, File.new(params[:maybe_file_list]), "application/octet-stream"))
        end
        if params[:maybe_integer]
          body.add_part(params[:maybe_integer].to_form_data_part(name: "maybe_integer"))
        end
        if params[:optional_list_of_strings]
          body.add_part(params[:optional_list_of_strings].to_form_data_part(name: "optional_list_of_strings"))
        end
        if params[:list_of_objects]
          body.add_part(params[:list_of_objects].to_form_data_part(name: "list_of_objects"))
        end
        if params[:optional_metadata]
          body.add_part(params[:optional_metadata].to_form_data_part(name: "optional_metadata"))
        end
        if params[:optional_object_type]
          body.add_part(params[:optional_object_type].to_form_data_part(name: "optional_object_type"))
        end
        if params[:optional_id]
          body.add_part(params[:optional_id].to_form_data_part(name: "optional_id"))
        end
        if params[:list_of_objects_with_optionals]
          body.add_part(params[:list_of_objects_with_optionals].to_form_data_part(name: "list_of_objects_with_optionals"))
        end
        if params[:alias_object]
          body.add_part(params[:alias_object].to_form_data_part(name: "alias_object"))
        end
        if params[:list_of_alias_object]
          body.add_part(params[:list_of_alias_object].to_form_data_part(name: "list_of_alias_object"))
        end
        if params[:alias_list_of_object]
          body.add_part(params[:alias_list_of_object].to_form_data_part(name: "alias_list_of_object"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "",
          body: body,
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
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, image_file
        hi this is not a file, request

        _request = Deep.new(
=======
        body = Internal::Multipart::FormData.new
        
        if params[:image_file]
          body.add(Internal::Multipart::FilePart.new(:image_file, File.new(params[:image_file]), "application/octet-stream"))
        end
        if params[:request]
          body.add_part(params[:request].to_form_data_part(name: "request"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "/optional-args",
          body: body,
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
<<<<<<< HEAD
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
=======
        hi this is a file, file
        hi this is not a file, request

        _request = Deep.new(
=======
        body = Internal::Multipart::FormData.new
        
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:request]
          body.add_part(params[:request].to_form_data_part(name: "request"))
        end

        _request = Seed::Internal::Multipart::Request.new(
>>>>>>> a419d24f88 (chore(ruby): fix sdks)
          method: POST,
          path: "/inline-type",
          body: body,
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
