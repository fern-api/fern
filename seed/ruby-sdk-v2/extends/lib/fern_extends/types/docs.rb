# frozen_string_literal: true

module FernExtends
  module Types
    class Docs < Internal::Types::Model
      field :docs, -> { String }, optional: false, nullable: false
    end
  end
end
