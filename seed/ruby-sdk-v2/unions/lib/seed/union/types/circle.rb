# frozen_string_literal: true

require_relative "../.."

module Seed
  module Union
    module Types
      class Circle < Internal::Types::Model
        field :radius, -> { Float }, optional: false, nullable: false
      end
    end
  end
end
