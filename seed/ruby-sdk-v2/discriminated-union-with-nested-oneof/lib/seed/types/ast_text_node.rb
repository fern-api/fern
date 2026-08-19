# frozen_string_literal: true

module Seed
  module Types
    class AstTextNode < Internal::Types::Model
      field :content, -> { String }, optional: false, nullable: false
    end
  end
end
