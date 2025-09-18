# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Entity < Internal::Types::Model
        field :type, -> { Seed::Types::Type }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
