# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Actor < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
