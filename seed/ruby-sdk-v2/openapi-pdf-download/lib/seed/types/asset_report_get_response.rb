# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class AssetReportGetResponse < Internal::Types::Model
      field :request_id, -> { String }, optional: false, nullable: false
    end
  end
end
