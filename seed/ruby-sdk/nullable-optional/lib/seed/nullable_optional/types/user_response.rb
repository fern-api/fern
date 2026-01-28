# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class UserResponse < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :username, -> { String }, optional: false, nullable: false
        field :email, -> { String }, optional: false, nullable: true
        field :phone, -> { String }, optional: true, nullable: false
        field :created_at, -> { String }, optional: false, nullable: false, api_name: "createdAt"
        field :updated_at, -> { String }, optional: false, nullable: true, api_name: "updatedAt"
        field :address, -> { Seed::NullableOptional::Types::Address }, optional: true, nullable: false
      end
    end
  end
end
