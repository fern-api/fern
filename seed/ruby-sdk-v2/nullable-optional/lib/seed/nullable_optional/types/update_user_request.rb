# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # For testing PATCH operations
      class UpdateUserRequest < Internal::Types::Model
        field :username, -> { String }, optional: true, nullable: false

        field :email, -> { String }, optional: true, nullable: true

        field :phone, -> { String }, optional: true, nullable: false

        field :address, -> { Seed::NullableOptional::Types::Address }, optional: true, nullable: true
      end
    end
  end
end
