# frozen_string_literal: true

require "json"
require_relative "document_metadata"
require_relative "document_upload_result"

module SeedApiClient
  class UploadDocumentResponse
    # Deserialize a JSON object to an instance of UploadDocumentResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::UploadDocumentResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      begin
        SeedApiClient::DocumentMetadata.validate_raw(obj: struct)
        return SeedApiClient::DocumentMetadata.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedApiClient::DocumentUploadResult.validate_raw(obj: struct)
        return SeedApiClient::DocumentUploadResult.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      struct
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given
    #  hash and check each fields type against the current object's property
    #  definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      begin
        return SeedApiClient::DocumentMetadata.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedApiClient::DocumentUploadResult.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      raise("Passed value matched no type within the union, validation failed.")
    end
  end
end
