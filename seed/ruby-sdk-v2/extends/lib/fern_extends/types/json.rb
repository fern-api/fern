# frozen_string_literal: true

module FernExtends
  module Types
    class Json < Internal::Types::Model
      field :raw, -> { String }, optional: false, nullable: false
    end
  end
end
