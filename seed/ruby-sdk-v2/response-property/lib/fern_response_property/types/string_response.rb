# frozen_string_literal: true

module FernResponseProperty
  module Types
    class StringResponse < Internal::Types::Model
      field :data, -> { String }, optional: false, nullable: false
    end
  end
end
