# frozen_string_literal: true

module Seed
  module Types
    # Not XML-encoded; properties must not carry xml metadata.
    class PlainObject < Internal::Types::Model
      field :id, -> { String }, optional: true, nullable: false
    end
  end
end
