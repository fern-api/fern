# frozen_string_literal: true

module Seed
  module Types
    class TranscriptEvent < Internal::Types::Model
      field :type, -> { Seed::Types::TranscriptEventType }, optional: false, nullable: false
      field :data, -> { String }, optional: false, nullable: false
    end
  end
end
