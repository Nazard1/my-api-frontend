// Спільний код авторизації для всіх сторінок.

// Адреса бекенду (Django REST API).
const API_URL = "http://127.0.0.1:8000/api/v1";

// ---------- Токени в localStorage ----------

function getAccess() {
  return localStorage.getItem("access");
}

function getRefresh() {
  return localStorage.getItem("refresh");
}

function getUsername() {
  return localStorage.getItem("username");
}

function isLoggedIn() {
  return getAccess() !== null;
}

function saveLogin(access, refresh, username) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  localStorage.setItem("username", username);
}

function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
}

// ---------- Переходи між сторінками ----------

// Приймаємо лише назву сторінки цього сайту (наприклад, add-product.html).
// Повні адреси (https://...), //host, /шлях і javascript: відкидаються,
// щоб параметр next не можна було використати для переходу на чужий сайт.
function safeNext(value) {
  if (value && /^[\w-]+\.html$/.test(value)) {
    return value;
  }
  return "index.html";
}

// Перейти на логін, запамʼятавши поточну сторінку, щоб потім повернутися.
function goToLogin() {
  const page = location.pathname.split("/").pop() || "index.html";
  location.href = "login.html?next=" + encodeURIComponent(page);
}

// Для сторінок лише для авторизованих (add-product.html).
function requireAuth() {
  if (!isLoggedIn()) {
    goToLogin();
  }
}

// Для login.html і register.html: авторизованому там робити нічого.
function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    location.href = "index.html";
  }
}

function logout() {
  clearTokens();
  location.href = "index.html";
}

// ---------- Запити з автооновленням access-токена ----------

// Отримати новий access за refresh-токеном і зберегти його.
function refreshAccess() {
  return $.ajax({
    url: API_URL + "/auth/refresh/",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      refresh: getRefresh()
    })
  }).done(function(data) {
    localStorage.setItem("access", data.access);
  });
}

// Обгортка над $.ajax для запитів, яким потрібен токен.
// Додає заголовок Authorization. Якщо сервер відповів 401 (access прострочений),
// один раз оновлює access через /auth/refresh/ і повторює запит.
// Якщо оновити не вдалося, очищає токени й веде на сторінку входу.
function apiRequest(options) {
  const result = $.Deferred();

  function send(isRetry) {
    const settings = $.extend({}, options, {
      headers: $.extend({}, options.headers, {
        Authorization: "Bearer " + getAccess()
      })
    });

    $.ajax(settings)
      .done(result.resolve)
      .fail(function(xhr) {
        if (xhr.status !== 401) {
          result.reject(xhr);
          return;
        }
        if (isRetry || !getRefresh()) {
          clearTokens();
          goToLogin();
          result.reject(xhr);
          return;
        }
        refreshAccess()
          .done(function() {
            send(true);
          })
          .fail(function() {
            clearTokens();
            goToLogin();
            result.reject(xhr);
          });
      });
  }

  send(false);
  return result.promise();
}

// ---------- Помилки форм ----------

// Показати помилки 400 біля відповідних полів форми, решту — у блоці .form-error.
// Увесь текст вставляється через .text(), а не .html(), — захист від XSS.
function showFormErrors($form, xhr) {
  clearFormErrors($form);
  const $general = $form.find(".form-error");
  const error = xhr.responseJSON?.error;

  if (!error) {
    $general.text("Не вдалося звʼязатися з сервером. Перевірте, що бекенд запущено.")
      .prop("hidden", false);
    return;
  }

  const unmatched = [];
  $.each(error.details || {}, function(field, messages) {
    const text = [messages].flat().join(" ");
    const $input = $form.find("[name='" + field + "']");
    if ($input.length) {
      $("<p>").addClass("field-error").text(text).insertAfter($input);
    } else {
      unmatched.push(text);
    }
  });

  if ($.isEmptyObject(error.details) || unmatched.length) {
    $general.text(unmatched.length ? unmatched.join(" ") : error.message)
      .prop("hidden", false);
  }
}

function clearFormErrors($form) {
  $form.find(".field-error").remove();
  $form.find(".form-error").text("").prop("hidden", true);
}

// ---------- Навігація ----------

// Гість бачить «Увійти» й «Реєстрація», авторизований — своє імʼя й «Вийти».
function renderNav() {
  const $user = $("#nav-user").empty();

  if (isLoggedIn()) {
    $user.append(
      $("<span>").addClass("nav-username").text(getUsername()),
      $("<button>").attr("type", "button").addClass("link-button").text("Вийти")
      .on("click", logout)
    );
  } else {
    $user.append(
      $("<a>").attr("href", "login.html").text("Увійти"),
      $("<a>").attr("href", "register.html").text("Реєстрація")
    );
  }
}

$(renderNav);