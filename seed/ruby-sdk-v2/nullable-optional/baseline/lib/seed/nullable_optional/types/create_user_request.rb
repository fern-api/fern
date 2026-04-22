# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class CreateUserRequest < Internal::Types::Model
        field :username, -> { String }, optional: false, nullable: false
        field :email, -> { String }, optional: false, nullable: true
        field :phone, -> { String }, optional: true, nullable: false
        field :address, -> { Seed::NullableOptional::Types::Address }, optional: true, nullable: false
      end
    end
  end
end
