# frozen_string_literal: true

module Seed
  module Union
    module Types
      class Circle < Internal::Types::Model
        field :radius, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
