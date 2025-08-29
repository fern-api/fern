# frozen_string_literal: true

require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class EmailNotification
      # @return [String]
      attr_reader :email_address
      # @return [String]
      attr_reader :subject
      # @return [String]
      attr_reader :html_content
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param email_address [String]
      # @param subject [String]
      # @param html_content [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::EmailNotification]
      def initialize(email_address:, subject:, html_content: OMIT, additional_properties: nil)
        @email_address = email_address
        @subject = subject
        @html_content = html_content if html_content != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "emailAddress": email_address,
          "subject": subject,
          "htmlContent": html_content
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of EmailNotification
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::EmailNotification]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        email_address = parsed_json["emailAddress"]
        subject = parsed_json["subject"]
        html_content = parsed_json["htmlContent"]
        new(
          email_address: email_address,
          subject: subject,
          html_content: html_content,
          additional_properties: struct
        )
      end

      # Serialize an instance of EmailNotification to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.email_address.is_a?(String) != false || raise("Passed value for field obj.email_address is not the expected type, validation failed.")
        obj.subject.is_a?(String) != false || raise("Passed value for field obj.subject is not the expected type, validation failed.")
        obj.html_content&.is_a?(String) != false || raise("Passed value for field obj.html_content is not the expected type, validation failed.")
      end
    end
  end
end
