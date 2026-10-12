require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.asset_report.get_pdf(asset_report_token: "asset_report_token")
