# frozen_string_literal: true

module Seed
  module User
    module Types
      class NestedUser < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :user, -> { Seed::User::Types::User }, optional: false, nullable: false
      end
    end
  end
end
