# frozen_string_literal: true

module Seed
  module Service
    module Types
      class NestedUser < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :nested_user, -> { Seed::Service::Types::User }, optional: false, nullable: false
      end
    end
  end
end
