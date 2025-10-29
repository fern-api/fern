# frozen_string_literal: true

module Seed
  module FileUploadExample
    class Client
      # @return [Seed::FileUploadExample::Client]
      def initialize(client:)
        @client = client
      end

      # Upload a file to the database
      #
      # @return [String]
      def upload_file(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:name]
          body.add(
            name: "name",
            value: params[:name]
          )
        end
        body.add_part(params[:file].to_form_data_part(name: "file")) if params[:file]

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "upload-file",
          body: body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::FileId.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
