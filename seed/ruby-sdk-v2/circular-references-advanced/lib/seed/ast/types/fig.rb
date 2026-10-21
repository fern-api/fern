# frozen_string_literal: true

require_relative "../.."

module Seed
  module Ast
    module Types
      class Fig < Internal::Types::Model
        field :animal, -> { Seed::Ast::Types::Animal }, optional: false, nullable: false
      end
    end
  end
end
