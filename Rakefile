load 'toolchain/Rakefile'
load 'end2end/Rakefile'

task :environment do
  ENV['CONTENT_PATH'] = File.dirname(__FILE__)
end

task default: %w[environment docs:all]
