## usage
## modify this file with the changes you want
## ruby update_tests

require 'json'

#loop through all the json files in tests
Dir['tests/regression/*.json'].each do |fname|
    temp = JSON.parse(File.read(fname))

    # modify the ruby hash to include new values (setting default value) #
    ######################################################################

    # example for test level change:
    # temp['start_url'] = 'https://platform.test.lotame.com';

    # example for verify level change (setting default value)
    # steps = temp['steps'];
    # steps.each do |step|
    #     verifys = step['verify']
    #     verifys.each do |verify|
    #         verify['new_verify_attibute'] = true   
    # end
    # end

    # example for specific test level change
    # use utilty script 'ruby test_list' to generate updated hash to paste below
    # testz = {
    #     "tests/apr.json" => 'aprValue',
    #     "tests/audience_export.json" => 'exportValue',
    #     ...
    # }
    # temp['new_attribute_specific'] = testz[fname];

    #writes the file with the above changes
    File.open(fname, "w") do |f|
        f.write(JSON.pretty_generate(temp))
    end

    puts 'updated ' + fname
end
