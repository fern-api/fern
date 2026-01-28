# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class ExtendedMovie < Internal::Types::Model
        field :cast, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
