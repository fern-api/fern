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
        body = Internal::Multipart::FormData.new

        body.add_part(params[:maybe_string].to_form_data_part(name: "maybe_string")) if params[:maybe_string]
        body.add_part(params[:integer].to_form_data_part(name: "integer")) if params[:integer]
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:file_list]
          body.add(Internal::Multipart::FilePart.new(:file_list, File.new(params[:file_list]),
                                                     "application/octet-stream"))
        end
        if params[:maybe_file]
          body.add(Internal::Multipart::FilePart.new(:maybe_file, File.new(params[:maybe_file]),
                                                     "application/octet-stream"))
        end
        if params[:maybe_file_list]
          body.add(Internal::Multipart::FilePart.new(:maybe_file_list, File.new(params[:maybe_file_list]),
                                                     "application/octet-stream"))
        end
        body.add_part(params[:maybe_integer].to_form_data_part(name: "maybe_integer")) if params[:maybe_integer]
        if params[:optional_list_of_strings]
          body.add_part(params[:optional_list_of_strings].to_form_data_part(name: "optional_list_of_strings"))
        end
        body.add_part(params[:list_of_objects].to_form_data_part(name: "list_of_objects")) if params[:list_of_objects]
        if params[:optional_metadata]
          body.add_part(params[:optional_metadata].to_form_data_part(name: "optional_metadata"))
        end
        if params[:optional_object_type]
          body.add_part(params[:optional_object_type].to_form_data_part(name: "optional_object_type"))
        end
        body.add_part(params[:optional_id].to_form_data_part(name: "optional_id")) if params[:optional_id]
        body.add_part(params[:alias_object].to_form_data_part(name: "alias_object")) if params[:alias_object]
        if params[:list_of_alias_object]
          body.add_part(params[:list_of_alias_object].to_form_data_part(name: "list_of_alias_object"))
        end
        if params[:alias_list_of_object]
          body.add_part(params[:alias_list_of_object].to_form_data_part(name: "alias_list_of_object"))
        end

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def just_file(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "/just-file",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def just_file_with_query_params(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "/just-file-with-query-params",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def with_content_type(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        body.add_part(params[:foo].to_form_data_part(name: "foo")) if params[:foo]
        body.add_part(params[:bar].to_form_data_part(name: "bar")) if params[:bar]
        body.add_part(params[:foo_bar].to_form_data_part(name: "foo_bar")) if params[:foo_bar]

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "/with-content-type",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def with_form_encoding(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        body.add_part(params[:foo].to_form_data_part(name: "foo")) if params[:foo]
        body.add_part(params[:bar].to_form_data_part(name: "bar")) if params[:bar]

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "/with-form-encoding",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def with_form_encoded_containers(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        body.add_part(params[:maybe_string].to_form_data_part(name: "maybe_string")) if params[:maybe_string]
        body.add_part(params[:integer].to_form_data_part(name: "integer")) if params[:integer]
        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        if params[:file_list]
          body.add(Internal::Multipart::FilePart.new(:file_list, File.new(params[:file_list]),
                                                     "application/octet-stream"))
        end
        if params[:maybe_file]
          body.add(Internal::Multipart::FilePart.new(:maybe_file, File.new(params[:maybe_file]),
                                                     "application/octet-stream"))
        end
        if params[:maybe_file_list]
          body.add(Internal::Multipart::FilePart.new(:maybe_file_list, File.new(params[:maybe_file_list]),
                                                     "application/octet-stream"))
        end
        body.add_part(params[:maybe_integer].to_form_data_part(name: "maybe_integer")) if params[:maybe_integer]
        if params[:optional_list_of_strings]
          body.add_part(params[:optional_list_of_strings].to_form_data_part(name: "optional_list_of_strings"))
        end
        body.add_part(params[:list_of_objects].to_form_data_part(name: "list_of_objects")) if params[:list_of_objects]
        if params[:optional_metadata]
          body.add_part(params[:optional_metadata].to_form_data_part(name: "optional_metadata"))
        end
        if params[:optional_object_type]
          body.add_part(params[:optional_object_type].to_form_data_part(name: "optional_object_type"))
        end
        body.add_part(params[:optional_id].to_form_data_part(name: "optional_id")) if params[:optional_id]
        if params[:list_of_objects_with_optionals]
          body.add_part(params[:list_of_objects_with_optionals].to_form_data_part(name: "list_of_objects_with_optionals"))
        end
        body.add_part(params[:alias_object].to_form_data_part(name: "alias_object")) if params[:alias_object]
        if params[:list_of_alias_object]
          body.add_part(params[:list_of_alias_object].to_form_data_part(name: "list_of_alias_object"))
        end
        if params[:alias_list_of_object]
          body.add_part(params[:alias_list_of_object].to_form_data_part(name: "alias_list_of_object"))
        end

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [String]
      def optional_args(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:image_file]
          body.add(Internal::Multipart::FilePart.new(:image_file, File.new(params[:image_file]),
                                                     "application/octet-stream"))
        end
        body.add_part(params[:request].to_form_data_part(name: "request")) if params[:request]

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "/optional-args",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [String]
      def with_inline_type(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:file]
          body.add(Internal::Multipart::FilePart.new(:file, File.new(params[:file]), "application/octet-stream"))
        end
        body.add_part(params[:request].to_form_data_part(name: "request")) if params[:request]

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "/inline-type",
          body: body
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def simple(request_options: {}, **params)
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
