// Сторінка входу. Авторизованого одразу відправляємо на головну.
redirectIfLoggedIn();

$(function() {
  const $form = $("#login-form");
  const params = new URLSearchParams(location.search);

  if (params.get("registered")) {
    $("#registered").prop("hidden", false);
  }

  $form.on("submit", function(event) {
    event.preventDefault();
    clearFormErrors($form);

    const username = $("#username").val().trim();

    // Вхід не потребує токена, тому звичайний $.ajax (не apiRequest:
    // тут 401 означає невірний пароль, а не прострочений токен).
    $.ajax({
        url: API_URL + "/auth/login/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          username: username,
          password: $("#password").val()
        })
      })
      .done(function(tokens) {
        saveLogin(tokens.access, tokens.refresh, username);
        // Повертаємось туди, звідки прийшли, але лише на сторінку цього сайту.
        location.href = safeNext(params.get("next"));
      })
      .fail(function(xhr) {
        showFormErrors($form, xhr);
      });
  });
});