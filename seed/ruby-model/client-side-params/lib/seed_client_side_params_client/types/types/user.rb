# frozen_string_literal: true

require "date"
require_relative "identity"
require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    # User object similar to Auth0 users
    class User
      # @return [String]
      attr_reader :user_id
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
      # @return [DateTime]
      attr_reader :created_at
      # @return [DateTime]
      attr_reader :updated_at
      # @return [Array<SeedClientSideParamsClient::Types::Identity>]
      attr_reader :identities
      # @return [Hash{String => Object}]
      attr_reader :app_metadata
      # @return [Hash{String => Object}]
      attr_reader :user_metadata
      # @return [String]
      attr_reader :picture
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :nickname
      # @return [Array<String>]
      attr_reader :multifactor
      # @return [String]
      attr_reader :last_ip
      # @return [DateTime]
      attr_reader :last_login
      # @return [Integer]
      attr_reader :logins_count
      # @return [Boolean]
      attr_reader :blocked
      # @return [String]
      attr_reader :given_name
      # @return [String]
      attr_reader :family_name
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param user_id [String]
      # @param email [String]
      # @param email_verified [Boolean]
      # @param username [String]
      # @param phone_number [String]
      # @param phone_verified [Boolean]
      # @param created_at [DateTime]
      # @param updated_at [DateTime]
      # @param identities [Array<SeedClientSideParamsClient::Types::Identity>]
      # @param app_metadata [Hash{String => Object}]
      # @param user_metadata [Hash{String => Object}]
      # @param picture [String]
      # @param name [String]
      # @param nickname [String]
      # @param multifactor [Array<String>]
      # @param last_ip [String]
      # @param last_login [DateTime]
      # @param logins_count [Integer]
      # @param blocked [Boolean]
      # @param given_name [String]
      # @param family_name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::User]
      def initialize(user_id:, email:, email_verified:, created_at:, updated_at:, username: OMIT, phone_number: OMIT,
                     phone_verified: OMIT, identities: OMIT, app_metadata: OMIT, user_metadata: OMIT, picture: OMIT, name: OMIT, nickname: OMIT, multifactor: OMIT, last_ip: OMIT, last_login: OMIT, logins_count: OMIT, blocked: OMIT, given_name: OMIT, family_name: OMIT, additional_properties: nil)
        @user_id = user_id
        @email = email
        @email_verified = email_verified
        @username = username if username != OMIT
        @phone_number = phone_number if phone_number != OMIT
        @phone_verified = phone_verified if phone_verified != OMIT
        @created_at = created_at
        @updated_at = updated_at
        @identities = identities if identities != OMIT
        @app_metadata = app_metadata if app_metadata != OMIT
        @user_metadata = user_metadata if user_metadata != OMIT
        @picture = picture if picture != OMIT
        @name = name if name != OMIT
        @nickname = nickname if nickname != OMIT
        @multifactor = multifactor if multifactor != OMIT
        @last_ip = last_ip if last_ip != OMIT
        @last_login = last_login if last_login != OMIT
        @logins_count = logins_count if logins_count != OMIT
        @blocked = blocked if blocked != OMIT
        @given_name = given_name if given_name != OMIT
        @family_name = family_name if family_name != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "user_id": user_id,
          "email": email,
          "email_verified": email_verified,
          "username": username,
          "phone_number": phone_number,
          "phone_verified": phone_verified,
          "created_at": created_at,
          "updated_at": updated_at,
          "identities": identities,
          "app_metadata": app_metadata,
          "user_metadata": user_metadata,
          "picture": picture,
          "name": name,
          "nickname": nickname,
          "multifactor": multifactor,
          "last_ip": last_ip,
          "last_login": last_login,
          "logins_count": logins_count,
          "blocked": blocked,
          "given_name": given_name,
          "family_name": family_name
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of User
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::User]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        user_id = parsed_json["user_id"]
        email = parsed_json["email"]
        email_verified = parsed_json["email_verified"]
        username = parsed_json["username"]
        phone_number = parsed_json["phone_number"]
        phone_verified = parsed_json["phone_verified"]
        created_at = (DateTime.parse(parsed_json["created_at"]) unless parsed_json["created_at"].nil?)
        updated_at = (DateTime.parse(parsed_json["updated_at"]) unless parsed_json["updated_at"].nil?)
        identities = parsed_json["identities"]&.map do |item|
          item = item.to_json
          SeedClientSideParamsClient::Types::Identity.from_json(json_object: item)
        end
        app_metadata = parsed_json["app_metadata"]
        user_metadata = parsed_json["user_metadata"]
        picture = parsed_json["picture"]
        name = parsed_json["name"]
        nickname = parsed_json["nickname"]
        multifactor = parsed_json["multifactor"]
        last_ip = parsed_json["last_ip"]
        last_login = (DateTime.parse(parsed_json["last_login"]) unless parsed_json["last_login"].nil?)
        logins_count = parsed_json["logins_count"]
        blocked = parsed_json["blocked"]
        given_name = parsed_json["given_name"]
        family_name = parsed_json["family_name"]
        new(
          user_id: user_id,
          email: email,
          email_verified: email_verified,
          username: username,
          phone_number: phone_number,
          phone_verified: phone_verified,
          created_at: created_at,
          updated_at: updated_at,
          identities: identities,
          app_metadata: app_metadata,
          user_metadata: user_metadata,
          picture: picture,
          name: name,
          nickname: nickname,
          multifactor: multifactor,
          last_ip: last_ip,
          last_login: last_login,
          logins_count: logins_count,
          blocked: blocked,
          given_name: given_name,
          family_name: family_name,
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
        obj.user_id.is_a?(String) != false || raise("Passed value for field obj.user_id is not the expected type, validation failed.")
        obj.email.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
        obj.email_verified.is_a?(Boolean) != false || raise("Passed value for field obj.email_verified is not the expected type, validation failed.")
        obj.username&.is_a?(String) != false || raise("Passed value for field obj.username is not the expected type, validation failed.")
        obj.phone_number&.is_a?(String) != false || raise("Passed value for field obj.phone_number is not the expected type, validation failed.")
        obj.phone_verified&.is_a?(Boolean) != false || raise("Passed value for field obj.phone_verified is not the expected type, validation failed.")
        obj.created_at.is_a?(DateTime) != false || raise("Passed value for field obj.created_at is not the expected type, validation failed.")
        obj.updated_at.is_a?(DateTime) != false || raise("Passed value for field obj.updated_at is not the expected type, validation failed.")
        obj.identities&.is_a?(Array) != false || raise("Passed value for field obj.identities is not the expected type, validation failed.")
        obj.app_metadata&.is_a?(Hash) != false || raise("Passed value for field obj.app_metadata is not the expected type, validation failed.")
        obj.user_metadata&.is_a?(Hash) != false || raise("Passed value for field obj.user_metadata is not the expected type, validation failed.")
        obj.picture&.is_a?(String) != false || raise("Passed value for field obj.picture is not the expected type, validation failed.")
        obj.name&.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.nickname&.is_a?(String) != false || raise("Passed value for field obj.nickname is not the expected type, validation failed.")
        obj.multifactor&.is_a?(Array) != false || raise("Passed value for field obj.multifactor is not the expected type, validation failed.")
        obj.last_ip&.is_a?(String) != false || raise("Passed value for field obj.last_ip is not the expected type, validation failed.")
        obj.last_login&.is_a?(DateTime) != false || raise("Passed value for field obj.last_login is not the expected type, validation failed.")
        obj.logins_count&.is_a?(Integer) != false || raise("Passed value for field obj.logins_count is not the expected type, validation failed.")
        obj.blocked&.is_a?(Boolean) != false || raise("Passed value for field obj.blocked is not the expected type, validation failed.")
        obj.given_name&.is_a?(String) != false || raise("Passed value for field obj.given_name is not the expected type, validation failed.")
        obj.family_name&.is_a?(String) != false || raise("Passed value for field obj.family_name is not the expected type, validation failed.")
      end
    end
  end
end
