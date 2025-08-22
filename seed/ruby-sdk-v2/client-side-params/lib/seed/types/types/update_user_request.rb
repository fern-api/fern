# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UpdateUserRequest < Internal::Types::Model
        field :email, -> { String }, optional: true, nullable: false
        field :email_verified, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :username, -> { String }, optional: true, nullable: false
        field :phone_number, -> { String }, optional: true, nullable: false
        field :phone_verified, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :user_metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :app_metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :password, -> { String }, optional: true, nullable: false
        field :blocked, -> { Internal::Types::Boolean }, optional: true, nullable: false
      end
    end
  end
end
