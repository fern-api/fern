# frozen_string_literal: true

module Seed
  module Types
    module Types
      # User object similar to Auth0 users
      class User < Internal::Types::Model
        field :user_id, -> { String }, optional: false, nullable: false
        field :email, -> { String }, optional: false, nullable: false
        field :email_verified, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :username, -> { String }, optional: true, nullable: false
        field :phone_number, -> { String }, optional: true, nullable: false
        field :phone_verified, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :created_at, -> { String }, optional: false, nullable: false
        field :updated_at, -> { String }, optional: false, nullable: false
        field :identities, -> { Internal::Types::Array[Seed::Types::Types::Identity] }, optional: true, nullable: false
        field :app_metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :user_metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :picture, -> { String }, optional: true, nullable: false
        field :name, -> { String }, optional: true, nullable: false
        field :nickname, -> { String }, optional: true, nullable: false
        field :multifactor, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :last_ip, -> { String }, optional: true, nullable: false
        field :last_login, -> { String }, optional: true, nullable: false
        field :logins_count, -> { Integer }, optional: true, nullable: false
        field :blocked, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :given_name, -> { String }, optional: true, nullable: false
        field :family_name, -> { String }, optional: true, nullable: false
      end
    end
  end
end
