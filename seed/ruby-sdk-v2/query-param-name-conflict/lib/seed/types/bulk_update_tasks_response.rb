# frozen_string_literal: true

module Seed
  module Types
    class BulkUpdateTasksResponse < Internal::Types::Model
      field :updated_count, -> { Integer }, optional: true, nullable: false
    end
  end
end
