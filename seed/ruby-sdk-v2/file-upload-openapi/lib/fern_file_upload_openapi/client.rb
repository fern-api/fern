# frozen_string_literal: true

module FernFileUploadOpenapi
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernFileUploadOpenapi::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_file-upload-openapi/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernFileUploadOpenapi::FileUploadExample::Client]
    def file_upload_example
      @file_upload_example ||= FernFileUploadOpenapi::FileUploadExample::Client.new(client: @raw_client)
    end
  end
end
