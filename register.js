// Сторінка реєстрації. Авторизованого одразу відправляємо на головну.
redirectIfLoggedIn();

$(function() {
  const $form = $("#register-form");

  $form.on("submit", function(event) {
    event.preventDefault();
    clearFormErrors($form);

    const data = {
      username: $("#username").val().trim(),
      first_name: $("#first_name").val().trim(),
      last_name: $("#last_name").val().trim(),
      email: $("#email").val().trim(),
      password: $("#password").val(),
      password2: $("#password2").val()
    };

    // Реєстрація не потребує токена, тому звичайний $.ajax.
    $.ajax({
        url: API_URL + "/auth/register/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data)
      })
      .done(function() {
        location.href = "login.html?registered=1";
      })
      .fail(function(xhr) {
        showFormErrors($form, xhr);
      });
  });
});