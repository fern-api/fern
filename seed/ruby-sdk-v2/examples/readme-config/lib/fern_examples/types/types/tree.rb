# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Tree < Internal::Types::Model
        field :nodes, -> { Internal::Types::Array[FernExamples::Types::Types::Node] }, optional: true, nullable: false
      end
    end
  end
end
