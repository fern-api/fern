# frozen_string_literal: true

module Seed
  module Types
    class Widget < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :status, -> { ::Seed::Types::WidgetStatus }, optional: false, nullable: false
    end
  end
end
