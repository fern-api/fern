# frozen_string_literal: true

require_relative "user_profile"
require "ostruct"
require "json"

module SeedPropertyAccessClient
  # User object
  class User
    # @return [String] The unique identifier for the user.
    attr_reader :id
    # @return [String] The email address of the user.
    attr_reader :email
    # @return [String] The password for the user.
    attr_reader :password
    # @return [SeedPropertyAccessClient::UserProfile] User profile object
    attr_reader :profile
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param id [String] The unique identifier for the user.
    # @param email [String] The email address of the user.
    # @param password [String] The password for the user.
    # @param profile [SeedPropertyAccessClient::UserProfile] User profile object
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedPropertyAccessClient::User]
    def initialize(id:, email:, password:, profile:, additional_properties: nil)
      @id = id
      @email = email
      @password = password
      @profile = profile
      @additional_properties = additional_properties
      @_field_set = { "id": id, "email": email, "password": password, "profile": profile }
    end

    # Deserialize a JSON object to an instance of User
    #
    # @param json_object [String]
    # @return [SeedPropertyAccessClient::User]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      id = parsed_json["id"]
      email = parsed_json["email"]
      password = parsed_json["password"]
      if parsed_json["profile"].nil?
        profile = nil
      else
        profile = parsed_json["profile"].to_json
        profile = SeedPropertyAccessClient::UserProfile.from_json(json_object: profile)
      end
      new(
        id: id,
        email: email,
        password: password,
        profile: profile,
        additional_properties: struct
      )
    end

    # Serialize an instance of User to a JSON object
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
      obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.email.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
      obj.password.is_a?(String) != false || raise("Passed value for field obj.password is not the expected type, validation failed.")
      SeedPropertyAccessClient::UserProfile.validate_raw(obj: obj.profile)
    end
  end
end
