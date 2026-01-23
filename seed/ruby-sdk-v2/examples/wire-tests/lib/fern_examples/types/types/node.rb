# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Node < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :nodes, -> { Internal::Types::Array[FernExamples::Types::Types::Node] }, optional: true, nullable: false
        field :trees, -> { Internal::Types::Array[FernExamples::Types::Types::Tree] }, optional: true, nullable: false
      end
    end
  end
end
