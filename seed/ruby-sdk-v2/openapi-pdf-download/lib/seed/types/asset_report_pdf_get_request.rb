# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class AssetReportPdfGetRequest < Internal::Types::Model
      field :asset_report_token, -> { String }, optional: false, nullable: false
    end
  end
end
