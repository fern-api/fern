# frozen_string_literal: true

module Seed
  module User
    module Types
      class CreateUserRequest < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :age, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
