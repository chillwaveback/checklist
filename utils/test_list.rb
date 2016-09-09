## usage
## ruby test_list
## outputs a copy pasta friendly hash of all tests in test directory

puts 'testz = { '
Dir['tests/regression/*.json'].each do |fname|
    puts '"' +  fname + '" => \'TODO\'' + ","
end
puts ' } '
