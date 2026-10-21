# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class AstTextNode < Internal::Types::Model
      field :content, -> { String }, optional: false, nullable: false
    end
  end
end
