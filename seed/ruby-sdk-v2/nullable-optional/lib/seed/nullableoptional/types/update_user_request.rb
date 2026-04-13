# frozen_string_literal: true

module Seed
  module Nullableoptional
    module Types
      class UpdateUserRequest < Internal::Types::Model
        field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"
        field :username, -> { String }, optional: true, nullable: false
        field :email, -> { String }, optional: true, nullable: false
        field :phone, -> { String }, optional: true, nullable: false
        field :address, -> { Seed::Types::Address }, optional: true, nullable: false
      end
    end
  end
end
