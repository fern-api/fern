# frozen_string_literal: true

module FernObjectsWithImports
  module Types
    class Tree < Internal::Types::Model
      field :nodes, -> { Internal::Types::Array[FernObjectsWithImports::Types::Node] }, optional: true, nullable: false
    end
  end
end
