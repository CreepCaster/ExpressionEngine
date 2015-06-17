require_relative '_profile_form.rb'

module Profile
  class UsernamePassword < ControlPanelPage
    set_url '/system/index.php?/cp/members/profile/auth'

    section :profile_form,
      Profile::ProfileForm,
      'form.settings[action*="cp/members/profile"]'

    element :username, 'input[name=username]'
    element :screen_name, 'input[name=screen_name]'
    element :password, 'input[name=password]'
    element :confirm_password, 'input[name=confirm_password]'
    element :current_password, 'input[name=current_password]'
  end
end
