# frozen_string_literal: true

require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    class UpdateUserRequest
      # @return [String]
      attr_reader :email
      # @return [Boolean]
      attr_reader :email_verified
      # @return [String]
      attr_reader :username
      # @return [String]
      attr_reader :phone_number
      # @return [Boolean]
      attr_reader :phone_verified
      # @return [Hash{String => Object}]
      attr_reader :user_metadata
      # @return [Hash{String => Object}]
      attr_reader :app_metadata
      # @return [String]
      attr_reader :password
      # @return [Boolean]
      attr_reader :blocked
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param email [String]
      # @param email_verified [Boolean]
      # @param username [String]
      # @param phone_number [String]
      # @param phone_verified [Boolean]
      # @param user_metadata [Hash{String => Object}]
      # @param app_metadata [Hash{String => Object}]
      # @param password [String]
      # @param blocked [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::UpdateUserRequest]
      def initialize(email: OMIT, email_verified: OMIT, username: OMIT, phone_number: OMIT, phone_verified: OMIT,
                     user_metadata: OMIT, app_metadata: OMIT, password: OMIT, blocked: OMIT, additional_properties: nil)
        @email = email if email != OMIT
        @email_verified = email_verified if email_verified != OMIT
        @username = username if username != OMIT
        @phone_number = phone_number if phone_number != OMIT
        @phone_verified = phone_verified if phone_verified != OMIT
        @user_metadata = user_metadata if user_metadata != OMIT
        @app_metadata = app_metadata if app_metadata != OMIT
        @password = password if password != OMIT
        @blocked = blocked if blocked != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "email": email,
          "email_verified": email_verified,
          "username": username,
          "phone_number": phone_number,
          "phone_verified": phone_verified,
          "user_metadata": user_metadata,
          "app_metadata": app_metadata,
          "password": password,
          "blocked": blocked
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of UpdateUserRequest
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::UpdateUserRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        email = parsed_json["email"]
        email_verified = parsed_json["email_verified"]
        username = parsed_json["username"]
        phone_number = parsed_json["phone_number"]
        phone_verified = parsed_json["phone_verified"]
        user_metadata = parsed_json["user_metadata"]
        app_metadata = parsed_json["app_metadata"]
        password = parsed_json["password"]
        blocked = parsed_json["blocked"]
        new(
          email: email,
          email_verified: email_verified,
          username: username,
          phone_number: phone_number,
          phone_verified: phone_verified,
          user_metadata: user_metadata,
          app_metadata: app_metadata,
          password: password,
          blocked: blocked,
          additional_properties: struct
        )
      end

      # Serialize an instance of UpdateUserRequest to a JSON object
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
        obj.email&.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
        obj.email_verified&.is_a?(Boolean) != false || raise("Passed value for field obj.email_verified is not the expected type, validation failed.")
        obj.username&.is_a?(String) != false || raise("Passed value for field obj.username is not the expected type, validation failed.")
        obj.phone_number&.is_a?(String) != false || raise("Passed value for field obj.phone_number is not the expected type, validation failed.")
        obj.phone_verified&.is_a?(Boolean) != false || raise("Passed value for field obj.phone_verified is not the expected type, validation failed.")
        obj.user_metadata&.is_a?(Hash) != false || raise("Passed value for field obj.user_metadata is not the expected type, validation failed.")
        obj.app_metadata&.is_a?(Hash) != false || raise("Passed value for field obj.app_metadata is not the expected type, validation failed.")
        obj.password&.is_a?(String) != false || raise("Passed value for field obj.password is not the expected type, validation failed.")
        obj.blocked&.is_a?(Boolean) != false || raise("Passed value for field obj.blocked is not the expected type, validation failed.")
      end
    end
  end
end
