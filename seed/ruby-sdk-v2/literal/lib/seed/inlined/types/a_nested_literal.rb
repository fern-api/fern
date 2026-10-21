# frozen_string_literal: true

require_relative "../.."

module Seed
  module Inlined
    module Types
      class ANestedLiteral < Internal::Types::Model
        field :my_literal, -> { String }, optional: false, nullable: false, api_name: "myLiteral"
      end
    end
  end
end
