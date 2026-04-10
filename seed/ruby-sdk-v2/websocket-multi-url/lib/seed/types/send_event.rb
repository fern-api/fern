# frozen_string_literal: true

module Seed
  module Types
    class SendEvent < Internal::Types::Model
      field :text, -> { String }, optional: false, nullable: false
      field :priority, -> { Integer }, optional: false, nullable: false
    end
  end
end
