# frozen_string_literal: true

module Seed
  module User
    module Types
      class CreateUsernameBodyOptionalProperties < Internal::Types::Model
        field :username, -> { String }, optional: true, nullable: false
        field :password, -> { String }, optional: true, nullable: false
        field :name, -> { String }, optional: true, nullable: false
      end
    end
  end
end
